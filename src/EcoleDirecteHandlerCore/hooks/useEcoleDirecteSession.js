// libs/utils
import { useEffect } from "react";
import useEcoleDirecteAccount from "./useEcoleDirecteAccount";
// lonstants
import { guestDataPath } from "../constants/config";
import { LoginStates, GradesCodes, HomeworksCodes } from "../constants/codes";

// split
import useAccountData from "./utils/useAccountData";
import fetchGrades from "../requests/fetchGrades";
import { mapGrades } from "../mappers/grades";
import fetchTimeline from "../requests/fetchTimeline";
import { mapTimeline } from "../mappers/timeline";
import fetchHomeworks from "../requests/fetchHomeworks";
import { mapUpcomingHomeworks, mapDayHomeworks } from "../mappers/homeworks";
import { textPlaceholder } from "../utils/utils";
import { DefaultAccountdata } from "../constants/default";

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

export default function useEcoleDirecteSession(initEcoleDirecteSession) {
    const usedAccountDataTemplate = { ...DefaultAccountdata, ...initEcoleDirecteSession.accountDataTemplate };
    const {
        userData,
        handlers: {
            initialize: initializeUserData,
            reset: resetUserData,
            setSelectedUserDataIndex,
        },
        isInitialized
    } = useAccountData(initEcoleDirecteSession.isLoggedIn ? initEcoleDirecteSession.accountData : undefined, usedAccountDataTemplate);
    const account = useEcoleDirecteAccount({});
    const { token, users, selectedUser, selectedUserIndex, loginStates } = account;

    useEffect(() => {
        if (loginStates.isLoggedIn && !isInitialized) {
            initializeUserData(users.length);
        } else if (loginStates.requireLogin) {
            resetUserData();
        }
    }, [loginStates.isLoggedIn, loginStates.requireLogin]);

    useEffect(() => {
        setSelectedUserDataIndex(selectedUserIndex.value);
    }, [selectedUserIndex.value]);

    async function getGrades(schoolYear, controller = (new AbortController())) {
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
                    const mappedResponse = mapGrades(response.data)
                    Object.keys(mappedResponse).forEach((data) => {
                        userData[data].set(mappedResponse[data], requestUserIndex);
                    })
                    return GradesCodes.SUCCESS;
                default:
                    return { code: -1, message: response.message };
            }
        })
            .catch((error) => {
                if (error.type === "ED_ERROR") {
                    switch (error.code) {
                        case 520:
                            loginStates.set(LoginStates.REQUIRE_LOGIN);
                            return GradesCodes.INVALID_TOKEN;
                        case 525:
                            loginStates.set(LoginStates.REQUIRE_LOGIN);
                            return GradesCodes.EXPIRED_TOKEN;
                        default:
                            return { code: -1, message: error.message };
                    }
                }
                if (error.name !== "AbortError") {
                    console.error(error);
                    return { code: -1, message: error.message };
                }
            })
    }

    /**
     * @brief Fetch user homeworks
     * @param date fetch the specified date (Date object) ; default value: "incoming": will fetch the incoming homeworks 
     * @param controller AbortController
     */
    async function getHomeworks(date = null, controller = (new AbortController())) {
        const requestUserIndex = selectedUserIndex.value;
        let response;
        if (selectedUser.id === -1) {
            response = date === null
                ? import(/* @vite-ignore */ guestDataPath.incoming_homeworks)
                : import(/* @vite-ignore */ guestDataPath.detailed_homeworks);
        } else {
            response = fetchHomeworks(date, selectedUser.id, token.value, controller);
        }
        return response.then((response) => {
            token.set((old) => (response?.token || old));
            switch (response.code) {
                case 200:
                    if (date === null) {
                        const { mappedHomeworks, mappedUpcomingAssignments, activeHomeworkDate, activeHomeworkId } = mapUpcomingHomeworks(response.data);
                        userData.homeworks.set(mappedHomeworks, requestUserIndex);
                        userData.upcomingAssignments.set(mappedUpcomingAssignments, requestUserIndex);
                        userData.activeHomeworkDate.set(activeHomeworkDate, requestUserIndex);
                        userData.activeHomeworkId.set(activeHomeworkId, requestUserIndex);
                    } else {
                        const { mappedDay } = mapDayHomeworks(response.data);
                        if (users[requestUserIndex].id < 0) {
                            const guestDetailedTaskDate = Object.keys(mappedDay)[0];
                            if (userData.homeworks.value[date]) {
                                console.log({
                                    ...userData.homeworks.value,
                                    [date]: [
                                        ...mappedDay[guestDetailedTaskDate].map((el, index) => ({
                                            ...el,
                                            ...userData.homeworks.value[date][index],
                                            content: textPlaceholder(),
                                            sessionContent: textPlaceholder()
                                        })),
                                    ]
                                })
                                userData.homeworks.set({
                                    ...userData.homeworks.value,
                                    [date]: [
                                        ...mappedDay[guestDetailedTaskDate].map((el, index) => ({
                                            ...el,
                                            ...userData.homeworks.value[date][index],
                                            content: textPlaceholder(),
                                            sessionContent: textPlaceholder()
                                        })),
                                    ]
                                }, requestUserIndex);
                            }
                        } else {
                            userData.homeworks.set({ ...userData.homeworks.value, ...mappedDay }, requestUserIndex);
                        }
                    }
                    return HomeworksCodes.SUCCESS;
                default:
                    return { code: -1, message: response.message };
            }
        })
            .catch((error) => {
                if (error.type === "ED_ERROR") {
                    switch (error.code) {
                        case 520:
                            loginStates.set(LoginStates.REQUIRE_LOGIN);
                            return HomeworksCodes.INVALID_TOKEN;
                        case 525:
                            loginStates.set(LoginStates.REQUIRE_LOGIN);
                            return HomeworksCodes.EXPIRED_TOKEN;
                        default:
                            return { code: -1, message: error.message };
                    }
                }
                if (error.name !== "AbortError") {
                    console.error(error);
                    return { code: -1, message: error.message };
                }
            })
    }

    async function getTimeline(schoolYear, controller = (new AbortController())) {
        const requestUserIndex = selectedUserIndex.value;
        let response;
        if (selectedUser.id === -1) {
            response = import(/* @vite-ignore */ guestDataPath.timeline)
        } else {
            response = fetchTimeline(schoolYear, token, selectedUser.id, controller)
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
                if (error.type === "ED_ERROR") {
                    switch (error.code) {
                        case 520:
                            loginStates.set(LoginStates.REQUIRE_LOGIN);
                            return GradesCodes.INVALID_TOKEN;
                        case 525:
                            loginStates.set(LoginStates.REQUIRE_LOGIN);
                            return GradesCodes.EXPIRED_TOKEN;
                        default:
                            return { code: -1, message: error.message };
                    }
                }
                if (error.name !== "AbortError") {
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
            get: {
                grades: getGrades,
                timeline: getTimeline,
                homeworks: getHomeworks,
            },
        },
        account,
        logout,
    }
}