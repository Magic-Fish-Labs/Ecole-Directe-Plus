// libs/utils
import { useState, useRef } from "react";

// constants
import { LoginStates, LoginCodes, DoubleAuthCodes } from "../constants/codes";
import { guestDataPath, guestCredentials } from "../constants/config";

// split
import fetchLogin from "../requests/fetchLogin";
import mapLogin from "../mappers/login";
import fetchDoubleAuthAnswer from "../requests/fetchDoubleAuthAnswer";
import fetchDoubleAuthQuestions from "../requests/fetchDoubleAuthQuestions";
import { DefaultEcoleDirecteAccount } from "../constants/default";
import { mapDoubleAuthQuestion } from "../mappers/doubleAuthQuestions";

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

export default function useEcoleDirecteAccount(initialAccount) {
    const [loginState, setLoginState] = useState(initialAccount.users ? (initialAccount.token ? LoginStates.LOGGED_IN : LoginStates.REQUIRE_NEW_TOKEN) : LoginStates.REQUIRE_LOGIN);
    const [username, setUsername] = useState(initialAccount.username ?? DefaultEcoleDirecteAccount.username);
    const [password, setPassword] = useState(initialAccount.password ?? DefaultEcoleDirecteAccount.password);
    const [token, setToken] = useState(initialAccount.token ?? DefaultEcoleDirecteAccount.token);
    const [selectedUserIndex, setSelectedUserIndex] = useState(initialAccount.selectedUserIndex ?? DefaultEcoleDirecteAccount.selectedUserIndex);
    const [users, setUsers] = useState(initialAccount.users ?? DefaultEcoleDirecteAccount.users);

    const doubleAuthKey = useRef(null);
    const selectedUser = users !== null && selectedUserIndex < users.length ? users[selectedUserIndex] : null;

    const isLoggedIn = loginState === LoginStates.LOGGED_IN;
    const requireLogin = loginState === LoginStates.REQUIRE_LOGIN;
    const requireNewToken = loginState === LoginStates.REQUIRE_NEW_TOKEN;
    const requireDoubleAuth = loginState === LoginStates.REQUIRE_DOUBLE_AUTH;
    const doubleAuthAcquired = loginState === LoginStates.DOUBLE_AUTH_ACQUIRED;

    async function requestLogin(localUsername, localPassword, keepLoggedIn, controller = new AbortController()) {

        let response;
        if (localUsername === guestCredentials.username && localPassword === guestCredentials.password) {
            response = import(/* @vite-ignore */ guestDataPath.login)
        } else {
            response = fetchLogin(localUsername, localPassword, doubleAuthKey.current, controller)
        }

        return response
            .then((response) => {
                switch (response.code) {
                    case 200:
                        setToken(response.token); // collecte du token
                        setUsers(mapLogin(response.data));
                        setLoginState(LoginStates.LOGGED_IN);
                        if (keepLoggedIn) {
                            setUsername(localUsername);
                            setPassword(localPassword);
                        } else {
                            setUsername("");
                            setPassword("");
                        }
                        return LoginCodes.SUCCESS;
                    case 250:
                        doubleAuthKey.current = null;
                        setToken(response.token); // collecte du token pour la double authentification
                        setLoginState(LoginStates.REQUIRE_DOUBLE_AUTH);
                        return LoginCodes.REQUIRE_DOUBLE_AUTH;
                    case 202:
                        setLoginState(LoginStates.REQUIRE_LOGIN);
                        return LoginCodes.ACCOUNT_CREATION_ERROR;
                    case -1:
                        setLoginState(LoginStates.BANNED_USER);
                        return LoginCodes.EMPTY_RESPONSE;
                    default: // UNHANDLED ERROR
                        // !:! report l'erreur
                        return { code: -1, message: response.message };
                }
            })
            .catch((error) => {
                if (error.type === "ED_ERROR") {
                    if (error.code < 0) {
                        setLoginState(LoginStates.BANNED_USER);
                    } else {
                        setLoginState(LoginStates.REQUIRE_LOGIN);
                    }
                    switch (error.code) {
                        case 1:
                            return LoginCodes.NO_EXT_RESPONSE;
                        case 2:
                            return LoginCodes.EXT_NO_GTK_COOKIE;
                        case 3:
                            return LoginCodes.EXT_NO_COOKIE;
                        case 505:
                            return LoginCodes.INVALID_CREDENTIALS;
                        case 74000:
                            return LoginCodes.SERVER_ERROR;
                        case -1:
                            return LoginCodes.EMPTY_RESPONSE;
                        default:
                            return { code: -1, message: error.message };
                    }
                }
                if (error.name !== "AbortError") {
                    console.error(error);
                    return { code: -1, message: error.message };
                } // !:! report l'erreur
            });
    }

    function getDoubleAuthQuestions(controller = new AbortController()) {
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
                            return DoubleAuthCodes.INVALID_TOKEN;
                        case 525:
                            return DoubleAuthCodes.EXPIRED_TOKEN;
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

    function sendDoubleAuthAnswer(choice, controller = new AbortController()) {
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
                            return DoubleAuthCodes.INVALID_TOKEN;
                        case 525:
                            return DoubleAuthCodes.EXPIRED_TOKEN;
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
        setUsers(null);
        setToken("");
        setUsername("");
        setPassword("");
        setSelectedUserIndex(0);
        setLoginState(LoginStates.REQUIRE_LOGIN);
    }

    return {
        userCredentials: {
            username: { value: username, set: (value) => { if (requireLogin) setUsername(value) } },
            password: { value: password, set: (value) => { if (requireLogin) setPassword(value) } },
        },
        token: { value: token, set: setToken },
        selectedUserIndex: { value: selectedUserIndex, set: setSelectedUserIndex },
        loginStates: {
            requireLogin,
            isLoggedIn,
            requireDoubleAuth,
            requireNewToken,
            doubleAuthAcquired,
            set: setLoginState,
        },
        requestLogin,
        getDoubleAuthQuestions,
        sendDoubleAuthAnswer,
        selectedUser,
        users,
        exportInitAccounts,
        logout,
    };
}
