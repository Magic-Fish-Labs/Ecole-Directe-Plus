// libs/utils
import useEcoleDirecteAccount, { UseEcoleDirecteAccountCallbacks } from "./useEcoleDirecteAccount";
// lonstants
import { guestDataPath } from "../constants/config";
import { LoginStates, GradesCodes, HomeworksCodes, CommonCodes } from "../constants/codes";

// split
import useAccountData from "./utils/useAccountData";
import fetchGrades from "../requests/fetchGrades";
import { mapGrades } from "../mappers/grades";
import fetchTimeline from "../requests/fetchTimeline";
import { mapTimeline } from "../mappers/timeline";
import fetchHomeworks from "../requests/fetchHomeworks";
import { DefaultAccountdata } from "../constants/default";
import Homeworks from "../class/Homeworks";
import EdError from "../class/EdError";

import { UpcomingHomeworkResponse } from "../structures/UpcomingHomeworkResponse";

/**
 * Each fetch function will return a code, and other data such as messages, display text, ...
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

export default function useEcoleDirecteSession(initEcoleDirecteSession: any, callbacks: UseEcoleDirecteAccountCallbacks) {
    const usedAccountDataTemplate = { ...DefaultAccountdata, ...initEcoleDirecteSession.accountDataTemplate };
    const {
        userData,
        handlers: {
            initialize: initializeUserData,
            reset: resetUserData,
            setSelectedUserDataIndex,
        }
    } = useAccountData(initEcoleDirecteSession.isLoggedIn ? initEcoleDirecteSession.accountData : undefined, usedAccountDataTemplate);
    const account = useEcoleDirecteAccount({}, {
        onLogin: (users) => {
            initializeUserData(users.length);
            if (callbacks.onLogin) callbacks.onLogin(users);
        },
        onUserChange: (user, userIndex) => {
            setSelectedUserDataIndex(userIndex);
            if (callbacks.onUserChange) callbacks.onUserChange(user, userIndex);
        },
        onLogout: () => {
            resetUserData();
            if (callbacks.onLogout) callbacks.onLogout();
        }
    });
    const { token, selectedUser, selectedUserIndex, loginStates } = account;

    async function getGrades(schoolYear: string, controller: AbortController = new AbortController()) {
        const requestUserIndex = selectedUserIndex.value;
        let response;
        if (selectedUser.id === -1) {
            response = import(/* @vite-ignore */ guestDataPath.grades)
        } else {
            response = fetchGrades(schoolYear, selectedUser.id, token.value, controller)
        }

        return response.then((response) => {
            token.set((old) => (response?.token || old));
            switch (response.code) {
                case 200:
                    const mappedResponse = mapGrades(response.data);
                    (Object.keys(mappedResponse) as Array<keyof typeof mappedResponse>).forEach((data) => {
                        userData[data].set(mappedResponse[data], requestUserIndex);
                    })
                    return GradesCodes.SUCCESS;
                default:
                    return { code: -1, message: response.message };
            }
        })
            .catch((error) => {
                if (error instanceof EdError) {
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
                    loginStates.set(LoginStates.REQUIRE_LOGIN);
                    console.error(error);
                    return { code: -1, message: error.message };
                }
            })
    }

    /**
     * @brief Fetch user incoming homeworks
     * @param {AbortController} controller AbortController
     */
    async function getHomeworks(controller = (new AbortController())) {
        const requestUserIndex = selectedUserIndex.value;
        let response;
        if (selectedUser.id === -1) {
            response = import(/* @vite-ignore */ guestDataPath.incoming_homeworks);
        } else {
            response = fetchHomeworks(selectedUser.id, token.value, controller);
        }
        return response.then((response: UpcomingHomeworkResponse) => {
            token.set((old: string) => (response?.token || old));
            switch (response.code) {
                case 200:
                    const mappedHomeworks = Homeworks.createFromUpcoming(account, response.data);
                    userData.homeworks.set(mappedHomeworks, requestUserIndex);
                    userData.upcomingAssignments.set(mappedHomeworks.getUpcomingAssignements(), requestUserIndex);
                    userData.activeHomeworkDate.set(mappedHomeworks.getDefaultActiveHomeworkDate(), requestUserIndex);
                    userData.activeHomeworkId.set(null, requestUserIndex);
                    return HomeworksCodes.SUCCESS;
                default:
                    return { code: -1, message: response.message };
            }
        })
            .catch((error) => {
                if (error instanceof EdError) {
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
                    loginStates.set(LoginStates.REQUIRE_LOGIN);
                    console.error(error);
                    return { code: -1, message: error.message };
                }
            })
    }

    async function getTimeline(schoolYear: string, controller = (new AbortController())) {
        const requestUserIndex = selectedUserIndex.value;
        let response;
        if (selectedUser.id === -1) {
            response = import(/* @vite-ignore */ guestDataPath.timeline)
        } else {
            response = fetchTimeline(schoolYear, token.value, selectedUser.id, controller)
        }
        return response.then((response) => {
            token.set((old) => (response?.token || old));
            switch (response.code) {
                case 200:
                    const { notifications } = mapTimeline(response.data)
                    userData.notifications.set(notifications, requestUserIndex);
                    return GradesCodes.SUCCESS;
                default:
                    return { code: -1, message: response.message };
            }
        })
            .catch((error) => {
                if (error instanceof EdError) {
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
                    loginStates.set(LoginStates.REQUIRE_LOGIN);
                    console.error(error);
                    return { code: -1, message: error.message };
                }
            })
    }

    function logout() {
        resetUserData();
        account.logout();
    }

    return {
        userData: {
            ...userData,
            grades: {
                ...userData.grades,
                get: getGrades
            },
            homeworks: {
                ...userData.homeworks,
                get: getHomeworks
            },
        },
        account,
        logout,
    }
}