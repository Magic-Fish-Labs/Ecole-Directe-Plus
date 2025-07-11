import { useReducer, useRef, useState } from "react";
import { tracer } from "../../../../devutils/utils";

function cleanInitializer(init, template) {
    if (!init
        || !init.length
        || typeof init !== "object"
        || !Array.isArray(init)
        || init.some((el) => typeof el !== "object" || Array.isArray(el))) {
        // these values may come from localStorage, so they are sensible to user modifications and data may be invalid
        return [template];
    }
    const result = [];
    init.forEach((initElement) => {
        const element = {};
        Object.keys(template).forEach((key) => {
            if (initElement.hasOwnProperty(key)) {
                element[key] = initElement[key];
            } else {
                element[key] = template[key];
            }
        });
        result.push(element);
    })
    return Array.from({ length: init.length }, (_, index) => ({ ...template, ...init[index] }));
}

export default function useAccountData(initAccountData, accountDataTemplate) {
    const [selectedUserDataIndex, setSelectedUserDataIndex] = useState(0);
    const isInitialized = useRef(!!initAccountData);
    const [accountData, dispatch] = useReducer((current, { action, params }) => {
        switch (action) {
            case "INITIALIZE":
                {
                    const { userNumber } = params;
                    isInitialized.current = true;
                    return Array.from({ length: userNumber }, () => accountDataTemplate);
                }
            case "RESET":
                {
                    isInitialized.current = false;
                    return [accountDataTemplate];
                }
            case "SET":
                {
                    const next = [...current];
                    const { data, value, userIndex } = params;

                    next[userIndex][data] = value;
                    return next;
                }
        }
    }, cleanInitializer(initAccountData, accountDataTemplate));

    function initialize(userNumber, dataList) {
        dispatch({
            action: "INITIALIZE",
            params: { userNumber, dataList }
        });
    }

    function reset() {
        dispatch({
            action: "RESET",
            params: {}
        });
    }

    /**This is the function you'll mainly use to change and initialize data of an account with mutiple users.
     * Here is an explanations of the params :
     *  @param data      is the "key" of the data, its identifier in the object "userData" returned by the hook
     *  @param value     is the value you want to assign to the key above
     *  @param userIndex is the index of a specific user, this may be important in cases where you work with
     *                   async threads and you get data for a user after that the sekected user changed.
     */
    function set(data, value, userIndex) {
        if (userIndex >= accountData.length) {
            throw new Error("Cannot set data to unexistent user. Invalid userIndex")
        }

        dispatch({
            action: "SET",
            params: { data, value, userIndex }
        });
    }

    const returnedData = accountData.map(data => Object.fromEntries(Object.keys(accountData[selectedUserDataIndex]).map((dataName) => [
        dataName,
        {
            value: data[dataName],
            set: tracer((value, userIndex = selectedUserDataIndex) => {
                set(dataName, value, userIndex);
            }, false),
        }
    ])));

    return {
        userData: returnedData[selectedUserDataIndex],
        handlers: {
            initialize,
            reset,
            setSelectedUserDataIndex
        },
        isInitialized: isInitialized.current,
        returnedData,
        accountData,
    };
}