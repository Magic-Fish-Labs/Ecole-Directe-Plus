import { useEffect } from "react";
import { LocalStorageKeys } from "../constants/constants";
import { logEDPLogo } from "../../edpConfig";

export function useLocalStorageEffect(userSession, keepLoggedIn) {
    const {
        userCredentials,
        token,
        loginStates,
        selectedUserIndex,
        users,
        exportInitAccounts,
    } = userSession.account;

    const { isLoggedIn } = loginStates;

    useEffect(() => {
        const { username, password } = exportInitAccounts();
        if (keepLoggedIn.value && isLoggedIn && username && password) {
            localStorage.setItem(LocalStorageKeys.ENCRYPTED_CREDENTIALS, encrypt(JSON.stringify({ username, password })));
        }
    }, [userCredentials.username.value, userCredentials.password.value]);

    useEffect(() => {
        const { token } = exportInitAccounts();
        if (isLoggedIn && token) {
            localStorage.setItem(LocalStorageKeys.TOKEN, token);
        }
    }, [token.value]);

    useEffect(() => {
        const { users } = exportInitAccounts();
        if (isLoggedIn && users) {
            localStorage.setItem(LocalStorageKeys.USERS, JSON.stringify(users));
        }
    }, [loginStates, users]);

    useEffect(() => {
        const { selectedUserIndex } = exportInitAccounts();
        if (isLoggedIn) {
            localStorage.setItem(LocalStorageKeys.LAST_SELECTED_USER, selectedUserIndex.toString());
        }
    }, [selectedUserIndex]);
}

const toggleThemeTransitionAnimation = (() => {
    let oldTimeoutId = 0;
    return ((displayMode) => {
        if (displayMode.value === "balanced" || displayMode.value === "performance") return;
        clearTimeout(oldTimeoutId);
        document.documentElement.classList.add("switching-theme");
        oldTimeoutId = setTimeout(() => {
            document.documentElement.classList.remove("switching-theme")
        }, 500);
    })
})();

export function useDisplayThemeEffect(displayTheme, displayMode) {
    useEffect(() => {
        const metaThemeColor = document.getElementById("theme-color");
        if (displayTheme.value === "dark") {
            document.documentElement.classList.add("dark");
            document.documentElement.classList.remove("light");
            metaThemeColor.content = "#181829";
        } else if (displayTheme.value === "light") {
            document.documentElement.classList.add("light");
            document.documentElement.classList.remove("dark");
            metaThemeColor.content = "#e4e4ff";
        } else {
            const browserPrefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
            document.documentElement.classList.add(browserPrefersDarkMode ? "dark" : "light");
            document.documentElement.classList.remove(browserPrefersDarkMode ? "light" : "dark");
            metaThemeColor.content = (browserPrefersDarkMode ? "#181829" : "#e4e4ff");
        }
        toggleThemeTransitionAnimation(displayMode);
    }, [displayTheme.value]);
}

export function useBrowserDisplayThemeChange(displayMode) {
    useEffect(() => {
        const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)");
        const handleBrowserThemeChange = () => {
            console.clear();
            logEDPLogo();
            if (displayTheme.value === "auto") {
                document.documentElement.classList.add(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
                document.documentElement.classList.remove(window.matchMedia("(prefers-color-scheme: dark)").matches ? "light" : "dark");
                toggleThemeTransitionAnimation();
            }
        }
        prefersDarkMode.addEventListener('change', handleBrowserThemeChange);

        return (() => {
            prefersDarkMode.removeEventListener('change', handleBrowserThemeChange);
        });
    }, []);
}

export function useDisplayModeEffect(displayMode) {
    useEffect(() => {
        document.documentElement.classList.remove("quality");
        document.documentElement.classList.remove("balanced");
        document.documentElement.classList.remove("performance");

        document.documentElement.classList.add(displayMode.value);
    }, [displayMode.value]);
}
