import { useState, useEffect, useRef, createContext, useMemo, lazy, Suspense } from "react";
import {
    Navigate,
    createBrowserRouter,
    RouterProvider
} from "react-router-dom";

import { getISODate } from "./utils/utils";

import "./App.css";

import Root from "./components/Root";
import Login from "./components/Login/Login";
import ErrorPage from "./components/Errors/ErrorPage";
import Canardman from "./components/Canardman/Canardman";
import AppLoading from "./components/generic/Loading/AppLoading";
import LandingPage from "./components/LandingPage/LandingPage";
import EdpUnblock from "./components/EdpUnblock/EdpUnblock"
import { useCreateNotification } from "./components/generic/PopUps/Notification";
import { getBrowser } from "./utils/utils";
import { getInitialEcoleDirecteSessions } from "./utils/edpUtils"
import { getCurrentSchoolYear } from "./utils/date";
import EdpuLogo from "./components/graphics/EdpuLogo";
import useEcoleDirecteSession from "./EcoleDirecteHandlerCore/hooks/useEcoleDirecteSession";

import { logEDPLogo } from "./edpConfig";
import { defaultAccountSettings, defaultGlobalSettings } from "./utils/constants/default";
import useSettings from "./utils/hooks/useSettings";
import useAccountSettings from "./utils/hooks/useAccountSettings";
import { Browsers, LocalStorageKeys } from "./utils/constants/constants";
import { useLocalStorageEffect, useDisplayModeEffect, useDisplayThemeEffect, useBrowserDisplayThemeChange } from "./utils/hooks/useCustomEffect";
import NavigateSave from "./components/generic/router/NavigateSave";

// CODE-SPLITTING - DYNAMIC IMPORTS
const Lab = lazy(() => import("./components/app/CoreApp").then((module) => { return { default: module.Lab } }));
const Museum = lazy(() => import("./components/app/CoreApp").then((module) => { return { default: module.Museum } }));
const UnsubscribeEmails = lazy(() => import("./components/app/CoreApp").then((module) => { return { default: module.UnsubscribeEmails } }));
const Header = lazy(() => import("./components/app/CoreApp").then((module) => { return { default: module.Header } }));
const Dashboard = lazy(() => import("./components/app/CoreApp").then((module) => { return { default: module.Dashboard } }));
const Grades = lazy(() => import("./components/app/CoreApp").then((module) => { return { default: module.Grades } }));
const Homeworks = lazy(() => import("./components/app/CoreApp").then((module) => { return { default: module.Homeworks } }));
const Timetable = lazy(() => import("./components/app/CoreApp").then((module) => { return { default: module.Timetable } }));
const Messaging = lazy(() => import("./components/app/CoreApp").then((module) => { return { default: module.Messaging } }));
const Settings = lazy(() => import("./components/app/CoreApp").then((module) => { return { default: module.Settings } }));
const Account = lazy(() => import("./components/app/CoreApp").then((module) => { return { default: module.Account } }));
const Feedback = lazy(() => import("./components/app/CoreApp").then((module) => { return { default: module.Feedback } }));
const LoginBottomSheet = lazy(() => import("./components/app/CoreApp").then((module) => { return { default: module.LoginBottomSheet } }));

const apiVersion = "4.64.0";

// secret webhooks
const carpeConviviale = "CARPE_CONVIVIALE_WEBHOOK_URL";
const sardineInsolente = "SARDINE_INSOLENTE_WEBHOOK_URL";
const thonFrustre = "THON_FRUSTRE_WEBHOOK_URL";

const lsIdName = "encryptedUserIds"
const WINDOW_WIDTH_BREAKPOINT_MOBILE_LAYOUT = 450; // px
const WINDOW_WIDTH_BREAKPOINT_TABLET_LAYOUT = 869; // px

const userBrowser = getBrowser();

// get data from localstorage
const accountListFromLs = JSON.parse(localStorage.getItem("accountsList") ?? "[]");
let userSettingsFromLs = JSON.parse((localStorage.getItem("userSettings") ?? "[{}]"));

/*
function initSettings(accountList) {
    // comment ajouter un setting :
    // userSettings ici ; defaultAccountSettings
    const userSettings = [];
    for (let i = 0; i < (accountList?.length || 1); i++) { //Si au login, il y a aucun compte d'enregistré on considère qu'il y a un seul compte
        userSettings.push({
            displayTheme: {
                value: getSetting("displayTheme", i),
                values: ["light", "auto", "dark"]
            },
            displayMode: {
                value: getSetting("displayMode", i),
                values: ["quality", "balanced", "performance"]
            },
            selectedChart: {
                value: getSetting("selectedChart", i),
                values: [0, 1, 2]
            },
            isSepiaEnabled: {
                value: getSetting("isSepiaEnabled", i),
            },
            isHighContrastEnabled: {
                value: getSetting("isHighContrastEnabled", i),
            },
            isGrayscaleEnabled: {
                value: getSetting("isGrayscaleEnabled", i),
            },
            isPhotoBlurEnabled: {
                value: getSetting("isPhotoBlurEnabled", i),
            },
            isPartyModeEnabled: {
                value: getSetting("isPartyModeEnabled", i),
            },
            isPeriodEventEnabled: {
                value: getSetting("isPeriodEventEnabled", i),
            },
            isStreamerModeEnabled: {
                value: getSetting("isStreamerModeEnabled", i),
            },
            gradeScale: {
                value: getSetting("gradeScale", i),
                min: 1,
                max: 100,
            },
            isGradeScaleEnabled: {
                value: getSetting("isGradeScaleEnabled", i),
            },
            schoolYear: {
                value: getSetting("schoolYear", i),
            },
            isSchoolYearEnabled: {
                value: getSetting("isSchoolYearEnabled", i),
            },
            isLucioleFontEnabled: {
                value: getSetting("isLucioleFontEnabled", i),
            },
            windowArrangement: {
                value: getSetting("windowArrangement", i),
            },
            allowWindowsArrangement: {
                value: getSetting("allowWindowsArrangement", i),
            },
            dynamicLoading: {
                value: getSetting("dynamicLoading", i),
            },
            negativeBadges: {
                value: getSetting("negativeBadges", i),
            },
            allowAnonymousReports: {
                value: getSetting("allowAnonymousReports", i),
            }
        })
    }
    return userSettings;
}
*/
// optimisation possible avec useCallback
export const AppContext = createContext(null);
export const AccountContext = createContext(null);
export const SettingsContext = createContext(null);
export const UserDataContext = createContext(null);

let promptInstallPWA = () => { };
window.addEventListener("beforeinstallprompt", (event) => { event.preventDefault(); promptInstallPWA = () => event.prompt() });
window.addEventListener("appinstalled", () => { promptInstallPWA = null });

logEDPLogo();
export default function App() {
    const userSession = useEcoleDirecteSession(getInitialEcoleDirecteSessions());

    const {
        userData,
    } = userSession;

    const {
        token,
        loginStates,
        selectedUserIndex,
        selectedUser,
    } = userSession.account;

    const { isLoggedIn, requireDoubleAuth, doubleAuthAcquired } = loginStates;

    const tokenState = token.value;
    const setTokenState = token.set;
    const accountsListState = userSession.account.users;
    const globalSettings = useSettings(defaultGlobalSettings);
    // !:! pour le default, store les valeurs en js, et quand on les get, on regarde si elles existent sinon on prend celle par dfaut du config.json
    const { isDevChannel, keepLoggedIn } = globalSettings;

    // user settings
    // paramètres propre à chaque profil du compte

    const userSettings = useAccountSettings(selectedUserIndex.value, [defaultAccountSettings]); // !:! je pense que ca marche pas quand le nombre d'utilisateur change

    const { displayTheme, displayMode } = userSettings;

    // user data (chaque information relative à l'utilisateur est stockée dans un State qui lui est propre)
    const [timeline, setTimeline] = useState([]);
    const [schoolLife, setSchoolLife] = useState([]);

    // utils
    const [isMobileLayout, setIsMobileLayout] = useState(() => window.matchMedia(`(max-width: ${WINDOW_WIDTH_BREAKPOINT_MOBILE_LAYOUT}px)`).matches); // permet de modifier le layout en fonction du type d'écran pour améliorer le responsive
    const [isTabletLayout, setIsTabletLayout] = useState(() => window.matchMedia(`(max-width: ${WINDOW_WIDTH_BREAKPOINT_TABLET_LAYOUT}px)`).matches);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isEDPUnblockInstalled, setIsEDPUnblockInstalled] = useState(true);
    const [isEDPUnblockActuallyInstalled, setIsEDPUnblockActuallyInstalled] = useState(false);
    const [isStandaloneApp, setIsStandaloneApp] = useState(((window.navigator.standalone ?? false) || window.matchMedia('(display-mode: standalone)').matches)); // détermine si l'utilisateur a installé le site comme application, permet également de modifier le layout en conséquence
    const [appKey, setAppKey] = useState(() => crypto.randomUUID());
    const [proxyError, setProxyError] = useState(false); // en cas d'erreur sur le serveur proxy d'EDP (toutes les requêtes passent par lui pour contourner les restrictions d'EcoleDirecte)

    // diverse
    const abortControllers = useRef([]); // permet d'abort tous les fetch en cas de déconnexion de l'utilisateur pendant une requête
    const entryURL = useRef(window.location.href);
    const usedDisplayTheme = displayTheme.value === "auto" // thème d'affichage réel (ex: dark ou light, et non pas auto)
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? "dark"
            : "light"
        : displayTheme.value;
    const createNotification = useCreateNotification();

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                                                                                  //
    //                                                                                  Gestion Storage                                                                                 //
    //                                                                                                                                                                                  //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    useLocalStorageEffect(userSession, keepLoggedIn);

    // !:! IL faut gérer le changement de storage

    // useEffect(() => {
    //     const lsGlobalSettings = {};
    //     for (const i in globalSettings) {
    //         lsGlobalSettings[i] = globalSettings[i].value ?? defaultAccountSettings[i];
    //     }
    //     localStorage.setItem("globalSettings", JSON.stringify(lsGlobalSettings));

    //     const handleStorageChange = () => {
    //         const newLsGlobalSettings = JSON.parse(localStorage.getItem("globalSettings"))
    //         if (!areOccurenciesEqual(newLsGlobalSettings, globalSettings)) {
    //             for (const i in globalSettings) {
    //                 globalSettings[i].set(newLsGlobalSettings[i])
    //             }
    //         }
    //     }
    //     window.addEventListener("storage", handleStorageChange)

    //     return (() => {
    //         window.removeEventListener("storage", handleStorageChange);
    //     });
    // }, [keepLoggedIn.value,
    //     shareSettings,
    //     isDevChannel])

    // useEffect(() => {
    //     const handleStorageChange = () => {
    //         // logout if the user has logout in any tab
    //         if (accountsListState?.length > 0 && localStorage.getItem("accountsList") === null) {
    //             logout();
    //             return 0;
    //         }
    //         // handle getting from localStorage if it changes
    //         if (accountsListState?.length > 0) {
    //             const newSettings = initSettings(accountsListState)
    //             if (!areOccurenciesEqual(newSettings, userSettings)) {
    //                 setUserSettings(newSettings);
    //             }
    //         }
    //     }

    //     const timeoutHandleStorageChange = () => {
    //         setTimeout(() => handleStorageChange(), 0); // timeout to prevent issues due to react async behavior
    //     }

    //     window.addEventListener("storage", timeoutHandleStorageChange)

    //     return (() => {
    //         window.removeEventListener("storage", timeoutHandleStorageChange);
    //     });
    // }, [accountsListState, userSettings, tokenState]);

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data.type === "EDP_UNBLOCK") {
                console.log("EDP Unblock v" + event.data.payload.version + " installed");
                setIsEDPUnblockActuallyInstalled(true);
            }
        };

        window.addEventListener("message", handleMessage, false);
        return () => {
            window.removeEventListener("message", handleMessage, false);
        }
    }, [])

    /////////// USER DATA ///////////


    // TABLET / MOBILE LAYOUT MANAGEMENT
    useEffect(() => {
        // gère l'état de isMobileLayout en fonction de la largeur de l'écran
        const handleWindowResize = () => {
            // setIsMobileLayout(window.innerWidth <= WINDOW_WIDTH_BREAKPOINT_MOBILE_LAYOUT);
            // setIsTabletLayout(window.innerWidth <= WINDOW_WIDTH_BREAKPOINT_TABLET_LAYOUT);
            setIsMobileLayout(window.matchMedia(`(max-width: ${WINDOW_WIDTH_BREAKPOINT_MOBILE_LAYOUT}px)`).matches);
            setIsTabletLayout(window.matchMedia(`(max-width: ${WINDOW_WIDTH_BREAKPOINT_TABLET_LAYOUT}px)`).matches);

            if (userBrowser !== Browsers.FIREFOX) {
                // gestion du `zoom` sur petits écrans afin d'améliorer la lisibilité et le layout global
                if (window.innerWidth >= 869 && window.innerWidth < 1250) {
                    if (window.innerWidth >= 995) {
                        document.documentElement.style.zoom = (.2 / 170) * window.innerWidth - .47;
                    } else {
                        document.documentElement.style.zoom = .7;
                    }

                    if (userBrowser === Browsers.SAFARI) {
                        const newFontSize = (.125 / 170) * window.innerWidth - .294;
                        if (newFontSize < 8) {
                            document.documentElement.style.fontSize = "8px";
                        } else if (newFontSize > 10) {
                            document.documentElement.style.fontSize = "";
                        } else {
                            document.documentElement.style.fontSize = newFontSize + "em";
                        }
                    }
                } else if (window.innerHeight < 900) {
                    if (window.innerHeight >= 650) {
                        document.documentElement.style.zoom = (.35 / 350) * window.innerHeight + .1;
                    } else {
                        document.documentElement.style.zoom = .75;
                    }
                } else {
                    document.documentElement.style.fontSize = "";
                    document.documentElement.style.zoom = "";
                }
            }
        }

        window.addEventListener("resize", handleWindowResize);
        handleWindowResize();

        return () => {
            window.removeEventListener("resize", handleWindowResize);
        }
    }, []);

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                                                                                  //
    //                                                                                  Data Functions                                                                                 //
    //                                                                                                                                                                                  //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function removeSimulatedGrade(UUID, subjectKey, periodKey) {
        const newGrades = { ...userData.grades }
        newGrades[periodKey].subjects[subjectKey].grades = newGrades[periodKey].subjects[subjectKey].grades.filter((el) => el.id !== UUID)
        userData.set("grades", newGrades);
        updatePeriodGrades(periodKey);
    }

    function sortNextHomeworks(homeworks) { // This function will sort (I would rather call it translate) the EcoleDirecte response to a better js object
        const upcomingAssignments = []
        const sortedHomeworks = Object.fromEntries(Object.entries(homeworks).map((day) => {
            return [day[0], day[1].map((homework, i) => {
                const { codeMatiere, aFaire, donneLe, effectue, idDevoir, interrogation, matiere, /* rendreEnLigne, documentsAFaire // I don't know what to do with that for now */ } = homework;
                const task = {
                    id: idDevoir,
                    type: aFaire ? "task" : "sessionContent",
                    subjectCode: codeMatiere,
                    subject: matiere,
                    addDate: donneLe,
                    isInterrogation: interrogation,
                    isDone: effectue,
                }

                if (interrogation && upcomingAssignments.length < 3) {
                    upcomingAssignments.push({
                        date: day[0],
                        id: idDevoir,
                        index: i,
                        subject: matiere,
                        subjectCode: codeMatiere,
                    });
                }

                return task;
            })]
        }))

        if (upcomingAssignments.length > 0) {
            let i = 0;
            while (upcomingAssignments.length < 3) {
                upcomingAssignments.push({
                    id: "dummy" + i,
                });
                i++;
            }
        }
        userData.set("upcomingAssignments", upcomingAssignments)
        return sortedHomeworks
    }

    function sortDayHomeworks(homeworks) { // This function will sort (I would rather call it translate) the EcoleDirecte response to a better js object 
        const sortedHomeworks = Object.fromEntries(Object.entries(homeworks).map((day) => {
            return [day[0], day[1].map((homework) => {
                const { aFaire, codeMatiere, id, interrogation, matiere, nomProf } = homework;
                var contenuDeSeance = homework.contenuDeSeance;
                if (!aFaire && !contenuDeSeance) {
                    return null;
                }

                if (!contenuDeSeance) {
                    contenuDeSeance = aFaire.contenuDeSeance;
                }

                if (aFaire) {

                    const { donneLe, effectue, contenu, documents } = aFaire;

                    return {
                        id: id,
                        type: "task",
                        subjectCode: codeMatiere,
                        subject: matiere,
                        addDate: donneLe,
                        isInterrogation: interrogation,
                        isDone: effectue,
                        teacher: nomProf,
                        content: contenu,
                        files: documents.map((e) => (new File(e.id, e.type, e.libelle))),
                        sessionContent: contenuDeSeance.contenu,
                        sessionContentFiles: contenuDeSeance.documents.map((e) => (new File(e.id, e.type, e.libelle)))
                    }
                }
                else {
                    // This handles the case where there is no homework but there is a session content. I think it can be improved but for now it's fine
                    return {
                        id: id,
                        type: "sessionContent",
                        subjectCode: codeMatiere,
                        subject: matiere,
                        addDate: day[0],
                        teacher: nomProf,
                        sessionContent: contenuDeSeance.contenu,
                        sessionContentFiles: contenuDeSeance.documents.map((e) => (new File(e.id, e.type, e.libelle)))
                    }
                }
            }).filter((item) => item)]
        }))
        return sortedHomeworks
    }


    function sortMessageFolders(messages, origin = 0) {
        const oldMessageFolders = useUserData("messageFolders").get();
        let sortedMessageFolders = messages.classeurs.filter((folder) => (oldMessageFolders === undefined || !oldMessageFolders.some((oldFolder) => oldFolder.id === folder.id))).map((folder) => {
            return {
                id: folder.id,
                name: folder.libelle,
                fetchInitiated: false,
                fetched: origin === folder.id
            }
        });
        if (oldMessageFolders === undefined) {
            sortedMessageFolders.unshift({
                id: 0,
                name: "Boîte de réception",
                fetchInitiated: true,
                fetched: origin === 0
            })
        } else {
            sortedMessageFolders.unshift(oldMessageFolders.map((folder) => { folder.id === origin && (folder.fetched = true); return folder }));
            sortedMessageFolders = sortedMessageFolders.flat();
        }
        // Add hardcoded folders
        if (!sortedMessageFolders.some((folder) => folder.id === -1)) {
            sortedMessageFolders.push({
                id: -1,
                name: "Envoyés",
                fetchInitiated: false,
                fetched: origin === -1
            })
        }
        if (!sortedMessageFolders.some((folder) => folder.id === -2)) {
            sortedMessageFolders.push({
                id: -2,
                name: "Archivés",
                fetchInitiated: false,
                fetched: origin === -2
            })
        }
        if (!sortedMessageFolders.some((folder) => folder.id === -3)) {
            sortedMessageFolders.push({
                id: -3,
                name: "Nouveau dossier",
                // This is a virtual folder (it doesn't exist at all, it's just a button to create a new folder so it doesn't need to be fetched)
                fetchInitiated: true,
                fetched: true
            })
        }
        if (!sortedMessageFolders.some((folder) => folder.id === -4)) {
            sortedMessageFolders.push({
                id: -4,
                name: "Brouillons",
                fetchInitiated: false,
                fetched: origin === -4
            })
        }

        return sortedMessageFolders;
    }


    function sortMessages(messages) {
        const sortedMessages = messages.messages.received.map((message) => {
            return {
                date: message.date,
                files: structuredClone(message.files)?.map((file) => new File(file.id, file.type, file.libelle)),
                from: message.from,
                id: message.id,
                folderId: message.idClasseur,
                read: message.read,
                subject: message.subject,
                content: null,
                // ...
            }
        });

        return sortedMessages;
    }

    function sortMessageContent(messageContent) {
        if (!messageContent) {
            return;
        }
        const oldSortedMessages = useUserData("sortedMessages").get();
        const targetMessageIdx = oldSortedMessages.findIndex((item) => item.id === messageContent.id);
        oldSortedMessages[targetMessageIdx].read = true;
        oldSortedMessages[targetMessageIdx].files = messageContent.files.map((file) => new File(file.id, file.type, file.libelle));
        oldSortedMessages[targetMessageIdx].content = {
            id: messageContent.id,
            subject: messageContent.subject,
            date: messageContent.subject,
            content: messageContent.content
            // ...
        };
        useUserData("sortedMessages").set(oldSortedMessages);
    }

    function sortSchoolLife(schoolLife, activeAccount) {
        const sortedSchoolLife = {
            delays: [],
            absences: [],
            sanctions: [],
            incidents: []
        };
        schoolLife[activeAccount]?.absencesRetards.concat(schoolLife[activeAccount].sanctionsEncouragements ?? []).forEach((item) => {
            const newItem = {};
            newItem.type = item.typeElement;
            newItem.id = item.id;
            newItem.isJustified = item.justifie;
            newItem.date = new Date(item.date);
            newItem.displayDate = item.displayDate;
            newItem.duration = item.libelle;
            newItem.reason = item.motif;
            newItem.comment = item.commentaire;
            newItem.todo = item.aFaire;
            newItem.by = item.par;
            switch (newItem.type) {
                case "Retard":
                    sortedSchoolLife.delays.push(newItem);
                    break;

                case "Absence":
                    sortedSchoolLife.absences.push(newItem);
                    break;

                case "Punition":
                    sortedSchoolLife.sanctions.push(newItem);
                    break;
                case "Incident":
                    sortedSchoolLife.incidents.push(newItem);
                    break;

                default:
                    break;
            }
        });

        userData.set("sortedSchoolLife", sortedSchoolLife);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                                                                                  //
    //                                                                                  Fetch Functions                                                                                 //
    //                                                                                                                                                                                  //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    function handleEdBan() {
        // Will summon a notification with JSX in it
        createNotification(<>
            <h4>
                Installez Ecole Directe Plus Unblock
            </h4>
            <hr />
            <div className="edpu-notification-description">
                <EdpuLogo />
                <p>Ecole Directe Plus a besoin de son extension de navigateur pour fonctionner. (fourni un accès continu à l'API d'EcoleDirecte)</p>
            </div>
            <hr />
            <div className="extension-download-link">
                <a href="/edp-unblock#about">En savoir plus</a>
                <a href={browserExtensionDownloadLink[userBrowser]} target={(![Browsers.SAFARI, Browsers.FIREFOX].includes(userBrowser) ? "_blank" : "")}>Télécharger</a>
            </div>
        </>, { customClass: "extension-warning", timer: "infinite" })
    }

    async function fetchHomeworksSequentially(controller = new AbortController(), date = "incoming") {
        abortControllers.current.push(controller);
        const userId = selectedUserIndex.value;

        let endpoint;
        if (date === "incoming") {
            endpoint = "cahierdetexte";
        } else {
            endpoint = "cahierdetexte/" + getISODate(date);
        }

        if (selectedUser.id === -1) {
            if (date === "incoming") {
                const module = await import("./data/guest/homeworks.json");
                userData.set("homeworks", sortNextHomeworks(module.data));
            } else {
                const module = await import("./data/guest/detailed_homeworks.json");
                userData.set("homeworks", {
                    ...userData.sortedHomeworks,
                    ...sortDayHomeworks({ [module.data.date]: module.data.matieres })
                });
            }
            abortControllers.current.splice(abortControllers.current.indexOf(controller), 1);
        } else {
            try {
                const response = await fetch(
                    `https://api.ecoledirecte.com/v3/Eleves/${accountsListState[userId].id}/${endpoint}.awp?verbe=get&v=${apiVersion}`,
                    {
                        method: "POST",
                        headers: {
                            "x-token": tokenState
                        },
                        body: "data={}",
                        signal: controller.signal
                    },
                    "json"
                );
                const responseData = await response;
                const code = responseData.code;
                if (code === 200) {
                    if (date === "incoming") {
                        userData.set("homeworks", {
                            ...sortNextHomeworks(responseData.data),
                            ...userData.sortedHomeworks
                        });
                    } else {
                        userData.set("homeworks", {
                            ...userData.sortedHomeworks,
                            ...sortDayHomeworks({ [responseData.data.date]: responseData.data.matieres })
                        });
                    }
                } else if (code === 520 || code === 525) {
                    console.log("INVALID TOKEN: LOGIN REQUIRED");
                    requireLogin();
                }
                setTokenState(old => responseData?.token || old);
            } finally {
                abortControllers.current.splice(abortControllers.current.indexOf(controller), 1);
            }
        }
    }

    async function fetchMessages(folderId = 0, controller = (new AbortController())) {
        const oldMessageFolders = useUserData("messageFolders").get();
        if (oldMessageFolders && oldMessageFolders?.length > 0) {
            if (oldMessageFolders.find((item) => item.id === folderId)?.fetchInitiated) {
                return;
            } else {
                oldMessageFolders.find((item) => item.id === folderId).fetchInitiated = true;
                userData.set("messageFolders", oldMessageFolders)
            }
        }

        abortControllers.current.push(controller);
        const userId = selectedUserIndex.value;
        const data = {
            anneeMessages: userSettings.isSchoolYearEnabled.value ? userSettings.schoolYear.value.join("-") : getCurrentSchoolYear().join("-"),
        }
        // handle special folders (this is done that way because special folders are not considered as folders by EcoleDirecte but need to be fetched differently)
        let specialFolderType = "received";
        if (folderId === -1) {
            specialFolderType = "sent";
            // set the folderId to 0 to avoid errors
            folderId = 0;
        } else if (folderId === -2) {
            specialFolderType = "archived";
            folderId = 0;
        } else if (folderId === -4) {
            specialFolderType = "draft";
            folderId = 0;
        }
        fetch(
            `https://api.ecoledirecte.com/v3/${accountsListState[userId].accountType === "E" ? "eleves/" + accountsListState[userId].id : "familles/" + accountsListState[userId].familyId}/messages.awp?force=false&typeRecuperation=${specialFolderType}&idClasseur=${folderId}&orderBy=date&order=desc&query=&onlyRead=&getAll=1&verbe=get&v=${apiVersion}`,
            {
                method: "POST",
                headers: {
                    "x-token": tokenState
                },
                body: `data=${JSON.stringify(data)}`,
                signal: controller.signal,
                referrerPolicy: "no-referrer",
            },
            "json"
        )
            .then((response) => {
                let code;
                if (selectedUser.id === -1) {
                    code = 49969;
                } else {
                    code = response.code;
                }
                if (code === 200) {
                    let oldSortedMessages = userData.sortedMessages;
                    if (oldSortedMessages === undefined) {
                        oldSortedMessages = [];
                    }

                    // we've added the specialFolderType to the function to handle the special folders (to handle different data path for special folders and special folderId)
                    oldSortedMessages.push(sortMessages(response.data, specialFolderType));
                    // if in oldSortedMessages there is multiple times the same message, we remove the duplicates
                    console.log(oldSortedMessages)
                    oldSortedMessages = oldSortedMessages.flat().filter((item, index, self) => self.findIndex((item2) => item2.id === item.id) === index);
                    console.log(oldSortedMessages)
                    if (specialFolderType === "sent") {
                        // set the folderId back to -1 to than handle the special folders
                        folderId = -1;
                    } else if (specialFolderType === "archived") {
                        folderId = -2;
                    } else if (specialFolderType === "draft") {
                        folderId = -4;
                    }
                    userData.set("sortedMessages", oldSortedMessages.flat());
                    userData.set("messageFolders", sortMessageFolders(response.data, folderId));
                } else if (code === 520 || code === 525) {
                    // token invalide
                    requireLogin();
                } else if (code === 49969) {
                    // TODO: add data/messages.json for guest user
                    // import("./data/guest/messages.json").then((module) => {
                    //     changeUserData("sortedMessages", sortMessages(module.data));;
                    // })
                }
                setTokenState((old) => (response?.token || old));
            })
            .finally(() => {
                abortControllers.current.splice(abortControllers.current.indexOf(controller), 1);
            })
    }

    async function fetchMessageContent(id, controller) {
        const oldSortedMessages = userData.sortedMessages;
        if (oldSortedMessages && oldSortedMessages?.length > 0) {
            const targetMessageIdx = oldSortedMessages.findIndex((item) => item.id === id);
            if (oldSortedMessages[targetMessageIdx].content !== null) {
                return;
            }
        }
        abortControllers.current.push(controller);
        const userId = selectedUserIndex.value;
        const data = {
            anneeMessages: userSettings.isSchoolYearEnabled.value ? userSettings.schoolYear.value.join("-") : getCurrentSchoolYear().join("-"),
        }

        const mode = (oldSortedMessages.find((item) => item.id === id).folderId === -1 || oldSortedMessages.find((item) => item.id === id).folderId === -4) ? "expediteur" : "destinataire";

        fetch(
            `https://api.ecoledirecte.com/v3/${accountsListState[userId].accountType === "E" ? "eleves/" + accountsListState[userId].id : "familles/" + accountsListState[userId].familyId}/messages/${id}.awp?verbe=get&mode=${mode}&v=${apiVersion}`,
            {
                method: "POST",
                headers: {
                    "x-token": tokenState
                },
                body: `data=${JSON.stringify(data)}`,
                signal: controller.signal,
                referrerPolicy: "no-referrer",
            },
            "json"
        )
            .then((response) => {
                let code;
                if (selectedUser.id === -1) {
                    code = 49969;
                } else {
                    code = response.code;
                }
                if (code === 200) {
                    sortMessageContent(response.data)
                } else if (code === 520 || code === 525) {
                    // token invalide
                    requireLogin();
                } else if (code === 49969) {
                    // TODO: add data/messages.json for guest user
                    // import("./data/guest/messages.json").then((module) => {
                    //      sortMessageContent(module.data)
                    // })
                }
                setTokenState((old) => (response?.token || old));
            })
            .finally(() => {
                abortControllers.current.splice(abortControllers.current.indexOf(controller), 1);
            })
    }

    async function fetchMessageMarkAsUnread(ids = [], controller) {
        if (ids.length < 1) {
            return;
        }
        abortControllers.current.push(controller);
        const userId = selectedUserIndex.value;
        const data = {
            anneeMessages: userSettings.isSchoolYearEnabled.value ? userSettings.schoolYear.value.join("-") : getCurrentSchoolYear().join("-"),
            action: "marquerCommeNonLu",
            ids: ids
        }
        fetch(
            `https://api.ecoledirecte.com/v3/${accountsListState[userId].accountType === "E" ? "eleves/" + accountsListState[userId].id : "familles/" + accountsListState[userId].familyId}/messages.awp?verbe=put&v=${apiVersion}`,
            {
                method: "POST",
                headers: {
                    "x-token": tokenState
                },
                body: `data=${JSON.stringify(data)}`,
                signal: controller.signal,
                referrerPolicy: "no-referrer",
            },
            "json"
        )
            .then((response) => {
                let code;
                if (selectedUser.id === -1) {
                    code = 49969;
                } else {
                    code = response.code;
                }
                if (code === 200) {
                    // message successfully marked as unread
                } else if (code === 520 || code === 525) {
                    // token invalide
                    requireLogin();
                }
                setTokenState((old) => (response?.token || old));
            })
            .finally(() => {
                abortControllers.current.splice(abortControllers.current.indexOf(controller), 1);
            })
    }

    async function createFolderStorage(name) {
        const data = {
            libelle: name,
        }
        fetch("https://api.ecoledirecte.com/v3/messagerie/classeurs.awp?verbe=post%26v=4.52.0",
            {
                method: "POST",
                headers: {
                    "x-token": tokenState,
                },
                body: `data=${JSON.stringify(data)}`,
                referrerPolicy: "no-referrer"
            },
        )
    }

    async function fetchAdministrativeDocuments(selectedYear, controller = (new AbortController())) {
        abortControllers.current.push(controller);
        return fetch(
            `https://api.ecoledirecte.com/v3/${accountsListState[activeAccount].accountType === "E" ? "eleves" : "famille"}Documents.awp?archive=${selectedYear}&verbe=get&v=${apiVersion}`,
            {
                method: "POST",
                headers: {
                    "x-token": tokenState,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'data={}',
                signal: controller.signal,
                referrerPolicy: "no-referrer",
            },
            "json"
        )
            .then((response) => {
                let code = response.code;
                if (code === 200) {

                    const formatDocument = (documents) =>
                        documents.map((e) => {
                            const [year, month, day] = e.date.split('-');
                            const formattedDate = `${day}/${month}/${year}`;
                            return new File(e.id, e.type, `${e.libelle}.pdf`, undefined, { date: formattedDate });
                        });

                    const administrativeDocuments = formatDocument(response.data?.administratifs ?? []);
                    const notesDocuments = formatDocument(response.data?.notes ?? []);
                    const vieScolaireDocuments = formatDocument(response.data?.viescolaire ?? []);
                    const entrepriseDocuments = formatDocument(response.data?.entreprises ?? []);
                    const facturesDocuments = formatDocument(response.data?.factures ?? []);
                    // const insReinsDocuments = formatDocument(response.data.inscriptionsReinscriptions);


                    const responseDocuments = {
                        administratifs: administrativeDocuments,
                        notes: notesDocuments,
                        viescolaire: vieScolaireDocuments,
                        entreprises: entrepriseDocuments,
                        factures: facturesDocuments,
                        // inscriptionsReinscriptions: insReinsDocuments
                    }

                    changeUserData("administrativeDocuments", responseDocuments);
                } else if (code === 520 || code === 525) {
                    console.log("INVALID TOKEN: LOGIN REQUIRED");
                    requireLogin();
                }
                setTokenState((old) => (response?.token || old));
            })
            .finally(() => {
                abortControllers.current.splice(abortControllers.current.indexOf(controller), 1);
            });
    }

    async function renameFolder(id, name, controller = (new AbortController())) {
        abortControllers.current.push(controller);
        return fetch(
            `https://api.ecoledirecte.com/v3/messagerie/classeur/${id}.awp?verbe=put&v=${apiVersion}`,
            {
                method: "POST",
                headers: {
                    "x-token": tokenState
                },
                body: `data=${JSON.stringify({ id, type: "classeur", icon: "fa-folder", order: 1, libelle: name, expired: Date.now() + 3600000 })}`,
                referrerPolicy: "no-referrer",
            },
            "json"
        ).then(response => {
            if (response.code === 200) {
                const oldMessageFolders = useUserData("messageFolders").get();
                // the updated folder should be edited in order no modify the libelle of the correct folder
                const updatedFolders = oldMessageFolders.map(folder => {
                    if (folder.id === id) {
                        return { ...folder, name };
                    }
                    return folder;
                });
                useUserData("messageFolders").set(updatedFolders);
            }
            // TODO: handle errors
        }).finally(() => {
            abortControllers.current.splice(abortControllers.current.indexOf(controller), 1);
        });
    }

    async function deleteFolder(id, controller = new AbortController()) {
        abortControllers.current.push(controller);
        return fetch(
            `https://api.ecoledirecte.com/v3/messagerie/classeur/${id}.awp?verbe=delete&v=${apiVersion}`,
            {
                method: "POST",
                headers: {
                    "x-token": tokenState
                },
                body: "data={}",
                signal: controller.signal,
                referrerPolicy: "no-referrer",
            },
            "json"
        ).then(response => {
            if (response.code === 200) {
                const oldMessageFolders = useUserData("messageFolders").get();
                // delete the folder from the list of folders
                const updatedFolders = oldMessageFolders.filter(folder => folder.id !== id);
                useUserData("messageFolders").set(updatedFolders);
                return true;
            }
            // TODO: handle errors (ex: "Dossier non vide")
        }).finally(() => {
            abortControllers.current.splice(abortControllers.current.indexOf(controller), 1);
        });
    }

    async function createFolder(name, controller = new AbortController()) {
        abortControllers.current.push(controller);
        return fetch(
            `https://api.ecoledirecte.com/v3/messagerie/classeurs.awp?verbe=post&v=${apiVersion}`,
            {
                method: "POST",
                headers: {
                    "x-token": tokenState
                },
                body: `data=${JSON.stringify({ libelle: name })}`,
                signal: controller.signal,
                referrerPolicy: "no-referrer",
            },
            "json"
        ).then(response => {
            if (response.code === 200) {
                const oldMessageFolders = useUserData("messageFolders").get();
                const newFolder = {
                    id: response.data.id,
                    name: response.data.libelle,
                    fetchInitiated: false,
                    fetched: false
                };
                const updatedFolders = [...oldMessageFolders, newFolder];
                useUserData("messageFolders").set(updatedFolders);
                return response.data.id;
            }
        }).finally(() => {
            abortControllers.current.splice(abortControllers.current.indexOf(controller), 1);
        });
    }

    async function archiveMessage(id, controller = new AbortController()) {
        abortControllers.current.push(controller);
        return fetch(
            `https://api.ecoledirecte.com/v3/${accountsListState[activeAccount].accountType === "E" ? "eleves/" + accountsListState[activeAccount].id : "familles/" + accountsListState[activeAccount].familyId}/messages.awp?verbe=put&v=${apiVersion}`,
            {
                method: "POST",
                headers: {
                    "x-token": tokenState
                },
                body: `data=${encodeURIComponent(JSON.stringify({ action: "archiver", ids: [id], anneeMessages: getUserSettingValue("isSchoolYearEnabled") ? getUserSettingValue("schoolYear").join("-") : getCurrentSchoolYear().join("-") }))}`,
                signal: controller.signal,
                referrerPolicy: "no-referrer",
            },
            "json"
        ).then(response => {
            if (response.code === 200) {
                //move the message to the -3 folder
                const oldSortedMessages = useUserData("sortedMessages").get();
                const updatedMessages = oldSortedMessages.map(message => {
                    if (message.id === id) {
                        return { ...message, folderId: -2 };
                    }
                    return message;
                });
                updatedMessages.sort((a, b) => new Date(b.date) - new Date(a.date));
                changeUserData("sortedMessages", updatedMessages);
                console.log(updatedMessages);
                console.log("Message archivé avec succès");
                return true;
            }
        }).finally(() => {
            abortControllers.current.splice(abortControllers.current.indexOf(controller), 1);
        });
    }

    async function unarchiveMessage(id, controller = new AbortController()) {
        abortControllers.current.push(controller);
        return fetch(
            `https://api.ecoledirecte.com/v3/${accountsListState[activeAccount].accountType === "E" ? "eleves/" + accountsListState[activeAccount].id : "familles/" + accountsListState[activeAccount].familyId}/messages.awp?verbe=put&v=${apiVersion}`,
            {
                method: "POST",
                headers: {
                    "x-token": tokenState
                },
                body: `data=${encodeURIComponent(JSON.stringify({ action: "desarchiver", ids: [id], anneeMessages: getUserSettingValue("isSchoolYearEnabled") ? getUserSettingValue("schoolYear").join("-") : getCurrentSchoolYear().join("-") }))}`,
                signal: controller.signal,
                referrerPolicy: "no-referrer",
            },
            "json"
        ).then(response => {
            if (response.code === 200) {
                // move the message to the 0 folder
                const oldSortedMessages = useUserData("sortedMessages").get();
                const updatedMessages = oldSortedMessages.map(message => {
                    if (message.id === id) {
                        return { ...message, folderId: 0 };
                    }
                    return message;
                });
                // re-sort the messages by date
                updatedMessages.sort((a, b) => new Date(b.date) - new Date(a.date));
                changeUserData("sortedMessages", updatedMessages);
                console.log(updatedMessages);
                console.log("Message désarchivé avec succès");
                return true;
            }
        }).finally(() => {
            abortControllers.current.splice(abortControllers.current.indexOf(controller), 1);
        });
    }

    async function moveMessage(ids, folderId, controller = new AbortController()) {
        abortControllers.current.push(controller);
        const userId = activeAccount;
        return fetch(
            `https://api.ecoledirecte.com/v3/${accountsListState[userId].accountType === "E" ? "eleves/" + accountsListState[userId].id : "familles/" + accountsListState[userId].familyId}/messages.awp?verbe=put&v=${apiVersion}`,
            {
                method: "POST",
                headers: {
                    "x-token": tokenState
                },
                body: `data=${JSON.stringify({ action: "deplacer", idClasseur: folderId, ids: ids.map((id) => `${id}:-1`) })}`,
                signal: controller.signal,
                referrerPolicy: "no-referrer",
            },
            "json"
        ).then(response => {
            if (response.code === 200) {
                // move the message to the specified folder
                const oldSortedMessages = useUserData("sortedMessages").get();
                const updatedMessages = oldSortedMessages.map(message => {
                    if (ids.includes(message.id)) {
                        return { ...message, folderId };
                    }
                    return message;
                });
                updatedMessages.sort((a, b) => new Date(b.date) - new Date(a.date));
                changeUserData("sortedMessages", updatedMessages);
                console.log(updatedMessages);
                console.log("Message déplacé avec succès");
                return true;
            }
        }).finally(() => {
            abortControllers.current.splice(abortControllers.current.indexOf(controller), 1);
        });
    }

    async function deleteMessage(id, controller = new AbortController()) {
        abortControllers.current.push(controller);
        // the data is:
        // data = {
        //     "action": "supprimer",
        //     "ids": [
        //         16199
        //     ],
        //     "anneeMessages": "2024-2025",
        //     "idDossier": -5
        // }
        const userId = activeAccount;
        return fetch(
            `https://api.ecoledirecte.com/v3/${accountsListState[userId].accountType === "E" ? "eleves/" + accountsListState[userId].id : "familles/" + accountsListState[userId].familyId}/messages.awp?verbe=put&v=${apiVersion}`,
            {
                method: "POST",
                headers: {
                    "x-token": tokenState
                },
                body: `data=${JSON.stringify({ action: "supprimer", ids: [id], anneeMessages: getUserSettingValue("isSchoolYearEnabled") ? getUserSettingValue("schoolYear").join("-") : getCurrentSchoolYear().join("-"), idDossier: -5 })}`,
                signal: controller.signal,
                referrerPolicy: "no-referrer",
            },
            "json"
        ).then(response => {
            if (response.code === 200) {
                // delete the message from the list of messages
                const oldSortedMessages = useUserData("sortedMessages").get();
                const updatedMessages = oldSortedMessages.filter(message => message.id !== id);
                changeUserData("sortedMessages", updatedMessages);
                console.log(updatedMessages);
                console.log("Message supprimé avec succès");
                return true;
            }
        }).finally(() => {
            abortControllers.current.splice(abortControllers.current.indexOf(controller), 1);
        });
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                                                                                 //
    //                                                                              End Of Fetch Functions                                                                             //
    //                                                                                                                                                                                 //
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    /* ################################ CONNEXION/DÉCONNEXION ################################ */

    function resetUserData(hard = true) {
        if (hard) {
            selectedUserIndex.set(0);
            // localStorage.removeItem(lsIdName);
            localStorage.removeItem("encryptedUserIds");
        }
        setUserData([]);
        setTimeline([]);
        setSchoolLife([]);
    }

    function logout() {
        userSession.logout();
        // suppression des informations de connexion
        localStorage.removeItem(LocalStorageKeys.TOKEN);
        localStorage.removeItem(LocalStorageKeys.USERS);
        localStorage.removeItem(LocalStorageKeys.LAST_SELECTED_USER);
    }

    /* ################################ THEME ################################ */

    useDisplayThemeEffect(displayTheme, displayMode);
    useBrowserDisplayThemeChange(displayMode);

    /* ################################ MODE D'AFFICHAGE ################################ */

    useDisplayModeEffect(displayMode);

    /* ################################################################################### */

    const refreshApp = () => { setAppKey(crypto.randomUUID()) } // permet de refresh l'app sans F5

    // routing system
    const router = createBrowserRouter([
        {
            path: "/",
            element:
                <Root
                    isLoggedIn={isLoggedIn}
                    token={tokenState}
                    accountsList={accountsListState}
                    resetUserData={resetUserData}

                    get={userSession.get}

                    displayTheme={displayTheme}

                    setDisplayModeState={(value) => { displayMode.set(value) }}
                    displayMode={displayMode.value}

                    activeAccount={selectedUserIndex.value}
                    setActiveAccount={selectedUserIndex.set}
                    logout={logout}
                    isStandaloneApp={isStandaloneApp}
                    isTabletLayout={isTabletLayout}

                    setIsFullScreen={setIsFullScreen}
                    globalSettings={globalSettings}
                    entryURL={entryURL}
                    setting={userSettings}
                    createFolderStorage={createFolderStorage}

                    handleEdBan={handleEdBan}
                    isEDPUnblockInstalled={isEDPUnblockInstalled}
                    setIsEDPUnblockInstalled={setIsEDPUnblockInstalled}
                    isEDPUnblockActuallyInstalled={isEDPUnblockActuallyInstalled}
                    setIsEDPUnblockActuallyInstalled={setIsEDPUnblockActuallyInstalled}
                    requireDoubleAuth={requireDoubleAuth}

                    proxyError={proxyError}
                />
            ,

            errorElement: <ErrorPage sardineInsolente={sardineInsolente} />,
            children: [
                {
                    element: <LandingPage token={tokenState} isLoggedIn={isLoggedIn} />,
                    path: "/",
                },
                {
                    element: <Feedback activeUser={isLoggedIn && selectedUser} carpeConviviale={carpeConviviale} isTabletLayout={isTabletLayout} />,
                    path: "feedback",
                },
                {
                    element: <EdpUnblock isEDPUnblockActuallyInstalled={isEDPUnblockActuallyInstalled} />,
                    path: "edp-unblock",
                },
                {
                    element: <Canardman />,
                    path: "quackquack",
                },
                {
                    element: <Lab account={userSession.account} />,
                    path: "lab",
                },
                {
                    element: <Museum />,
                    path: "museum",
                },
                {
                    element: <UnsubscribeEmails activeUser={isLoggedIn && selectedUser} thonFrustre={thonFrustre} />,
                    path: "unsubscribe-emails",
                },
                {
                    element: (isLoggedIn
                        ? <NavigateSave to={`/app/${selectedUserIndex.value}/dashboard`} saveQueryParams />
                        : <Login logout={logout} isEDPUnblockInstalledActuallyInstalled={isEDPUnblockActuallyInstalled} />),
                    path: "login",
                },
                {
                    element: <NavigateSave to={`/app/${selectedUserIndex.value}/dashboard`} saveQueryParams/>,
                    path: "app",
                },
                {
                    element: (!isLoggedIn
                        ? <NavigateSave to="/login" replace={true} saveQueryParams />
                        : <>
                            <Header
                                token={tokenState}
                                accountsList={accountsListState}
                                setActiveAccount={selectedUserIndex.set}
                                activeAccount={selectedUserIndex.value}
                                carpeConviviale={carpeConviviale}
                                isLoggedIn={isLoggedIn}
                                timeline={timeline}
                                isTabletLayout={isTabletLayout}
                                isFullScreen={isFullScreen}
                                logout={logout}
                            />
                            {(!isLoggedIn && <LoginBottomSheet logout={logout} onClose={() => { }} close={true} />)} {/* // !:! changer le true ofc*/}
                        </>),
                    path: "app",
                    children: [
                        {
                            element: <NavigateSave to={`/app/${selectedUserIndex.value}/account`} replace={true} saveQueryParams />,
                            path: "account",
                        },
                        {
                            element: <Account schoolLife={schoolLife} fetchAdministrativeDocuments={fetchAdministrativeDocuments} sortSchoolLife={sortSchoolLife} isLoggedIn={isLoggedIn} activeAccount={selectedUserIndex.value} />,
                            path: ":userId/account"
                        },
                        {
                            element: <NavigateSave to={`/app/${selectedUserIndex.value}/settings`} replace={true} saveQueryParams />,
                            path: "settings",
                        },
                        {
                            element: <Settings usersSettings={userSettings[selectedUserIndex.value]} accountsList={accountsListState} getCurrentSchoolYear={getCurrentSchoolYear} resetUserData={resetUserData} />,
                            path: ":userId/settings"
                        },
                        {
                            element: <NavigateSave to={`/app/${selectedUserIndex.value}/dashboard`} replace={true} saveQueryParams />,
                            path: ":userId",
                        },
                        {
                            element: <NavigateSave to={`/app/${selectedUserIndex.value}/dashboard`} replace={true} saveQueryParams />,
                            path: "dashboard",
                        },
                        {
                            element: <Dashboard isTabletLayout={isTabletLayout} />,
                            path: ":userId/dashboard"
                        },
                        {
                            element: <NavigateSave to={`/app/${selectedUserIndex.value}/grades`} replace={true} saveQueryParams />,
                            path: "grades"
                        },
                        {
                            element: <Grades activeAccount={selectedUserIndex.value} isLoggedIn={isLoggedIn} isTabletLayout={isTabletLayout} />,
                            path: ":userId/grades"
                        },
                        {
                            element: <NavigateSave to={`/app/${selectedUserIndex.value}/homeworks`} replace={true} saveQueryParams />,
                            path: "homeworks"
                        },
                        {
                            element: <Homeworks isLoggedIn={isLoggedIn} activeAccount={selectedUserIndex.value} />,
                            path: ":userId/homeworks"
                        },
                        {
                            element: <NavigateSave to={`/app/${selectedUserIndex.value}/timetable`} replace={true} saveQueryParams />,
                            path: "timetable"
                        },
                        {
                            element: <Timetable />,
                            path: ":userId/timetable"
                        },
                        {
                            element: <NavigateSave to={`/app/${selectedUserIndex.value}/messaging`} replace={true} saveQueryParams />,
                            path: "messaging"
                        },
                        {
                            element: <Messaging isLoggedIn={isLoggedIn} activeAccount={selectedUserIndex.value} fetchMessages={fetchMessages} fetchMessageContent={fetchMessageContent} fetchMessageMarkAsUnread={fetchMessageMarkAsUnread} renameFolder={renameFolder} deleteFolder={deleteFolder} createFolder={createFolder} archiveMessage={archiveMessage} unarchiveMessage={unarchiveMessage} moveMessage={moveMessage} deleteMessage={deleteMessage} />,
                            path: ":userId/messaging"
                        },
                    ],
                },
            ],
        },
    ]);

    const appContextValue = useMemo(() => ({
        refreshApp,
        fetchHomeworksSequentially,
        promptInstallPWA,
        selectedUserIndex,
        accountsListState,
        isLoggedIn,
        isMobileLayout,
        isTabletLayout,
        isStandaloneApp,
        isDevChannel,
        globalSettings,
        usedDisplayTheme,
    }), [
        refreshApp,
        fetchHomeworksSequentially,
        promptInstallPWA,
        selectedUserIndex,
        accountsListState,
        isLoggedIn,
        isMobileLayout,
        isTabletLayout,
        isStandaloneApp,
        isDevChannel,
        usedDisplayTheme,
    ]);

    const accountContextValue = {
        ...userSession.account,
        keepLoggedIn,
        doubleAuthAcquired,
        requireDoubleAuth,
    };

    const settingsContextValue = {
        global: globalSettings,
        user: userSettings
    }

    const userDataContextValue = {
        ...userData
    }

    return (
        <AppContext.Provider value={appContextValue} key={appKey}>
            <AccountContext.Provider value={accountContextValue}>
                <SettingsContext.Provider value={settingsContextValue}>
                    <UserDataContext.Provider value={userDataContextValue}>
                        <Suspense fallback={<AppLoading />}>
                            <RouterProvider router={router} />
                        </Suspense>
                    </UserDataContext.Provider>
                </SettingsContext.Provider>
            </AccountContext.Provider>
        </AppContext.Provider>
    );
}
