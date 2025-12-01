// libs/utils
import { useState, useRef, Dispatch, SetStateAction } from "react";

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
import EdError from "../class/EdError";

type ObjectFromState<T> = {
    value: T,
    set: Dispatch<SetStateAction<T>>
}

export type User = any;

export interface Account {
    userCredentials: {
        username: ObjectFromState<string>,
        password: ObjectFromState<string>,
    },
    doubleAuthKey: any,
    token: ObjectFromState<string>,
    doubleAuthToken: ObjectFromState<string>,
    selectedUserIndex: { value: number, set: (newValue: number) => void },
    loginStates: ObjectFromState<LoginStates> & {
        requireLogin: boolean,
        isLoggedIn: boolean,
        requireDoubleAuth: boolean,
        requireNewToken: boolean,
        doubleAuthAcquired: boolean,
    },
    selectedUser: User,
    users: ObjectFromState<Array<User> | null>,
};

export type UseEcoleDirecteAccountCallbacks = {
    onUserChange: (newSelectedUser: any, newSelectedUserIndex: number) => void,
    onLogin: (users: Array<User>) => void,
    onLogout: () => void,
};


function getInitialLoginState(initialAccount: any): LoginStates {
    if (initialAccount.users) {
        if (initialAccount.token) {
            return LoginStates.LOGGED_IN;
        }
        return LoginStates.REQUIRE_NEW_TOKEN;
    }
    return LoginStates.REQUIRE_LOGIN;
}

export default function useEcoleDirecteAccount(initialAccount: any, callbacks: UseEcoleDirecteAccountCallbacks) {
    const [loginState, setLoginState] = useState(getInitialLoginState(initialAccount));
    const [username, setUsername] = useState(initialAccount.username as string ?? DefaultEcoleDirecteAccount.username);
    const [password, setPassword] = useState(initialAccount.password as string ?? DefaultEcoleDirecteAccount.password);
    const [token, setToken] = useState(initialAccount.token as string ?? DefaultEcoleDirecteAccount.token);
    const [doubleAuthToken, setDoubleAuthToken] = useState(initialAccount.token as string ?? DefaultEcoleDirecteAccount.token);
    const [selectedUserIndex, setSelectedUserIndex] = useState(initialAccount.selectedUserIndex as number ?? DefaultEcoleDirecteAccount.selectedUserIndex);
    const [users, setUsers] = useState<Array<User> | null>(initialAccount.users as Array<User> ?? DefaultEcoleDirecteAccount.users);

    const doubleAuthKey = useRef<any>(null);
    const selectedUser = users !== null && selectedUserIndex < users.length ? users[selectedUserIndex] : null;

    const isLoggedIn = loginState === LoginStates.LOGGED_IN;
    const requireLogin = loginState === LoginStates.REQUIRE_LOGIN;
    const requireNewToken = loginState === LoginStates.REQUIRE_NEW_TOKEN;
    const requireDoubleAuth = loginState === LoginStates.REQUIRE_DOUBLE_AUTH;
    const doubleAuthAcquired = loginState === LoginStates.DOUBLE_AUTH_ACQUIRED;

    const account: Account = {
        userCredentials: {
            username: { value: username, set: (value) => { if (requireLogin) setUsername(value) } },
            password: { value: password, set: (value) => { if (requireLogin) setPassword(value) } },
        },
        doubleAuthKey,
        token: { value: token, set: setToken },
        doubleAuthToken: { value: doubleAuthToken, set: setDoubleAuthToken },
        selectedUserIndex: {
            value: selectedUserIndex, set: (newIndex) => {
                setSelectedUserIndex(newIndex);
                callbacks.onUserChange(users ? users[newIndex]: null, newIndex);
            }
        },
        loginStates: {
            value: loginState,
            set: setLoginState,
            requireLogin,
            isLoggedIn,
            requireDoubleAuth,
            requireNewToken,
            doubleAuthAcquired,
        },
        selectedUser,
        users: { value: users, set: setUsers },
    };

    async function getDoubleAuthQuestions(controller: AbortController = new AbortController()) {
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

    async function sendDoubleAuthAnswer(choice: string, controller: AbortController = new AbortController()) {
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
                if (error instanceof EdError) {
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
        requestLogin: (...args: any[]) => requestLogin(account, callbacks.onLogin, ...args),
        getDoubleAuthQuestions,
        sendDoubleAuthAnswer,
    };
}
