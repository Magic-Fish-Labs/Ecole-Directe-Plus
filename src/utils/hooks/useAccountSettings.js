import { useReducer } from "react";

export default function useAccountSettings(selectedUserIndex, defaultSettings) {

    const [accountSettings, dispatch] = useReducer((current, { action, params }) => {
        const next = [...current];

        switch (action) {
            case "SET":
                {
                    const { setting, value } = params;
                    if (next[selectedUserIndex].hasOwnProperty(setting)) {
                        next[selectedUserIndex][setting].value = value;
                    } else {
                        next[selectedUserIndex][setting] = { value, properties: {} };
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
                    if (!next[selectedUserIndex].hasOwnProperty(setting)) {
                        throw new Error("Couldn't add property to inexistant setting");
                    }
                    next[selectedUserIndex][setting].properties[property] = value;
                    return next;
                }
            case "RESET":
                { // !:! We'll see later if this is usefull or not
                    const { initSettings } = params;
                    return initSettings;
                }
        }

    }, defaultSettings);

    return Object.fromEntries(Object.keys(accountSettings[selectedUserIndex]).map(setting => [
        setting,
        {
            ...accountSettings[selectedUserIndex][setting],
            set: (value) => dispatch({ action: "SET", params: { setting, value } }),
            setProperty: (property, value) => dispatch({ action: "SET_PROPERTY", params: { setting, property, value } })
        }
    ]));
}