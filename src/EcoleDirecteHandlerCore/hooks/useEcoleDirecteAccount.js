// libs/utils
import { useState, useRef } from "react";

// constants
import { LoginStates, CommonCodes } from "../constants/codes";
import { guestDataPath, guestCredentials } from "../constants/config";

// split
import mapLogin from "../mappers/login";
import fetchDoubleAuthAnswer from "../requests/fetchDoubleAuthAnswer";
import fetchDoubleAuthQuestions from "../requests/fetchDoubleAuthQuestions";
import { DefaultEcoleDirecteAccount } from "../constants/default";
import { mapDoubleAuthQuestion } from "../mappers/doubleAuthQuestions";
import { requestLogin } from "./requestHandler/requestLogin";

/**
 * Each get function (the ones that get parse and store data such as requestLogin of getGrades)
 * will return a code, and other data such as messages, display text, ...
 * The code rule is easy :
 *  - 0    : Everything OK
 *  - >= 1 : a known error
 *  - -1   : an unknown error
 *
 * With this system, every known errors will return a message hard coded and unknown erro will return the message of the response.
 * If you need to display a specific error message for unknown error, handle it after using the fetch function.
 * (basically :
 *  fetchFunction.then((response) => {
 *      if (response.code === -1) {
 *          // do something
 *      }
 *  })
 * )
 */

export default function useEcoleDirecteAccount(initialAccount, callbacks) {
    const [loginState, setLoginState] = useState(initialAccount.users ? (initialAccount.token ? LoginStates.LOGGED_IN : LoginStates.REQUIRE_NEW_TOKEN) : LoginStates.REQUIRE_LOGIN);
    const [username, setUsername] = useState(initialAccount.username ?? DefaultEcoleDirecteAccount.username);
    const [password, setPassword] = useState(initialAccount.password ?? DefaultEcoleDirecteAccount.password);
    const [token, setToken] = useState(initialAccount.token ?? DefaultEcoleDirecteAccount.token);
    const [doubleAuthToken, setDoubleAuthToken] = useState(initialAccount.token ?? DefaultEcoleDirecteAccount.token);
    const [selectedUserIndex, setSelectedUserIndex] = useState(initialAccount.selectedUserIndex ?? DefaultEcoleDirecteAccount.selectedUserIndex);
    const [users, setUsers] = useState(initialAccount.users ?? DefaultEcoleDirecteAccount.users);

    const doubleAuthKey = useRef(null);
    const selectedUser = users !== null && selectedUserIndex < users.length ? users[selectedUserIndex] : null;

    const isLoggedIn = loginState === LoginStates.LOGGED_IN;
    const requireLogin = loginState === LoginStates.REQUIRE_LOGIN;
    const requireNewToken = loginState === LoginStates.REQUIRE_NEW_TOKEN;
    const requireDoubleAuth = loginState === LoginStates.REQUIRE_DOUBLE_AUTH;
    const doubleAuthAcquired = loginState === LoginStates.DOUBLE_AUTH_ACQUIRED;

    const account = {
        userCredentials: {
            username: { value: username, set: (value) => { if (requireLogin) setUsername(value) } },
            password: { value: password, set: (value) => { if (requireLogin) setPassword(value) } },
        },
        doubleAuthKey,
        token: { value: token, set: setToken },
        doubleAuthToken: { value: doubleAuthToken, set: setDoubleAuthToken },
        selectedUserIndex: { value: selectedUserIndex, set: (newIndex) => { setSelectedUserIndex(newIndex); callbacks.onUserChange(users[newIndex], newIndex) } },
        loginStates: {
            requireLogin,
            isLoggedIn,
            requireDoubleAuth,
            requireNewToken,
            doubleAuthAcquired,
            set: setLoginState,
        },
        selectedUser,
        users: {value: users, set: setUsers},
    };

    async function getDoubleAuthQuestions(controller = new AbortController()) {
        // We don't handle guest because he doesn't need DoubleAuth obviously
        return fetchDoubleAuthQuestions(token, controller)
            .then((response) => {
                setToken((old) => response?.token || old);
                switch (response.code) {
                    case 200:
                        return { // !:! faire un mapper enft
                            data: mapDoubleAuthQuestion(response.data),
                            code: 0,
                            message: "",
                        };
                    default:// !:! report en webhook
                        setLoginState(LoginStates.REQUIRE_LOGIN);
                        console.error(response.message);
                        return { code: -1, message: response.message };
                }
            })
            .catch((error) => {
                if (error.type === "ED_ERROR") {
                    setLoginState(LoginStates.REQUIRE_LOGIN);
                    switch (error.code) {
                        case 520:
                            return CommonCodes.INVALID_TOKEN;
                        case 525:
                            return CommonCodes.EXPIRED_TOKEN;
                        default:
                            return { code: -1, message: error.message };
                    }
                }
                if (error.name !== "AbortError") {
                    setLoginState(LoginStates.REQUIRE_LOGIN);
                    console.error(error);
                    return { code: -1, message: error.message };
                }
            })
    }

    async function sendDoubleAuthAnswer(choice, controller = new AbortController()) {
        return fetchDoubleAuthAnswer(token, choice, controller)
            .then((response) => {
                setToken((old) => response?.token || old);
                switch (response.code) {
                    case 200:
                        doubleAuthKey.current = response.data;
                        setLoginState(LoginStates.DOUBLE_AUTH_ACQUIRED);
                        return {
                            code: 0,
                            message: "",
                        };
                    default:
                        console.error(response.message);
                        setLoginState(LoginStates.REQUIRE_LOGIN);
                        return { code: -1, message: response.message };
                }
            })
            .catch((error) => {
                if (error.type === "ED_ERROR") {
                    setLoginState(LoginStates.REQUIRE_LOGIN);
                    switch (error.code) {
                        case 520:
                            return CommonCodes.INVALID_TOKEN;
                        case 525:
                            return CommonCodes.EXPIRED_TOKEN;
                        default:
                            return { code: -1, message: error.message };
                    }
                }
                if (error.name !== "AbortError") {
                    setLoginState(LoginStates.REQUIRE_LOGIN);
                    console.error(error);
                    return { code: -1, message: error.message };
                }
            })
    }

    function exportInitAccounts() {
        return { username, password, token, selectedUserIndex, users }
    }

    function logout() {
        callbacks.onLogout();
        setUsers(null);
        setToken("");
        setUsername("");
        setPassword("");
        setSelectedUserIndex(0);
        setLoginState(LoginStates.REQUIRE_LOGIN);
    }

    return {
        ...account,
        exportInitAccounts,
        logout,
        requestLogin: (...args) => requestLogin(account, callbacks.onLogin, ...args),
        getDoubleAuthQuestions,
        sendDoubleAuthAnswer,
    };
}
