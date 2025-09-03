import { useState, useReducer } from "react";

export default function useAccountSettings(init, template) {
    const [selectedUserSettingIndex, setSelectedUserSettingIndex] = useState(0);
    const [accountSettings, dispatch] = useReducer((current, { action, params }) => {
        const next = [...current];

        switch (action) {
            case "SET":
                {
                    const { setting, value } = params;
                    if (next[selectedUserSettingIndex].hasOwnProperty(setting)) {
                        next[selectedUserSettingIndex][setting].value = value;
                    } else {
                        next[selectedUserSettingIndex][setting] = { value, properties: {} };
                    }
                    return next;
                }
            case "SET_PROPERTY":
                {
                    /**
                     * Brackets are mandatory here, because without it,
                     * the previous case is considered as the same scope
                     * so we can't create the same variables on the line
                     * below (setting and value)  
                     */
                    const { setting, property, value } = params;
                    if (!next[selectedUserSettingIndex].hasOwnProperty(setting)) {
                        throw new Error("Couldn't add property to inexistant setting");
                    }
                    next[selectedUserSettingIndex][setting].properties[property] = value;
                    return next;
                }
            case "INITIALIZE":
                {
                    const { userNumber } = params;
                    return Array.from({ length: userNumber }, () => template);
                }
            case "RESET":
                { // !:! We'll see later if this is usefull or not
                    const { initSettings } = params;
                    return initSettings;
                }
        }

    }, init);

    return {
        userSettings: Object.fromEntries(Object.keys(accountSettings[selectedUserSettingIndex]).map(setting => [
            setting,
            {
                ...accountSettings[selectedUserSettingIndex][setting],
                set: (value) => dispatch({ action: "SET", params: { setting, value } }),
                setProperty: (property, value) => dispatch({ action: "SET_PROPERTY", params: { setting, property, value } })
            }
        ])),
        handlers: {
            initialize: (userNumber) => dispatch({ action: "INITIALIZE", params: { userNumber } }),
            setSelectedUserSettingIndex
        }
    };
}