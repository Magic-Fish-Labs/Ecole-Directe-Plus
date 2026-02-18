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
import { apiVersion } from "./api/apiConfigs";

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


// !:! Bouger ca :
// secret webhooks
const carpeConviviale = "CARPE_CONVIVIALE_WEBHOOK_URL";
const sardineInsolente = "SARDINE_INSOLENTE_WEBHOOK_URL";
const thonFrustre = "THON_FRUSTRE_WEBHOOK_URL";

// !:! Bouger ca :
const WINDOW_WIDTH_BREAKPOINT_MOBILE_LAYOUT = 450; // px
const WINDOW_WIDTH_BREAKPOINT_TABLET_LAYOUT = 869; // px

const userBrowser = getBrowser();

// !:! bouger les contexte en dehors de l'App
export const AppContext = createContext(null);
export const AccountContext = createContext(null);
export const SettingsContext = createContext(null);
export const UserDataContext = createContext(null);

// !:! Bouger ca :
let promptInstallPWA = () => { };
window.addEventListener("beforeinstallprompt", (event) => { event.preventDefault(); promptInstallPWA = () => event.prompt() });
window.addEventListener("appinstalled", () => { promptInstallPWA = null });

logEDPLogo();

export default function App() {
    const {
        userSettings,
        handlers: {
            initialize: initAccountSettings,
            setSelectedUserSettingIndex
        }
    } = useAccountSettings([defaultAccountSettings], defaultAccountSettings);

    const {
        displayTheme,
        displayMode
    } = userSettings;

    const userSession = useEcoleDirecteSession(getInitialEcoleDirecteSessions(), {
        onLogin: (users) => {
            initAccountSettings(users.length);
        },
        onUserChange: (_, userIndex) => {
            setSelectedUserSettingIndex(userIndex);
        }
    });

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
    const accountsListState = userSession.account.users.value;

    const globalSettings = useSettings(defaultGlobalSettings);
    const { isDevChannel, keepLoggedIn } = globalSettings;

    // user settings
    // paramètres propre à chaque profil du compte

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
    //                                                                                  Data Functions                                                                                  //
    //                                                                                                                                                                                  //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
                content: null
            }
        });

        return sortedMessages;
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
        </>, { className: "extension-warning", timeToLive: "infinite" })
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

    // routing system
    const router = createBrowserRouter([
        {
            path: "/",
            element:
                <Root
                    isLoggedIn={isLoggedIn}
                    token={tokenState}
                    accountsList={accountsListState}
                    resetUserData={resetUserData} // could be in appContext

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
                    element: <NavigateSave to={`/app/${selectedUserIndex.value}/dashboard`} saveQueryParams />,
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
                            element: <Settings accountsList={accountsListState} resetUserData={resetUserData}  /* could be in appContext */ />,
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
                            element: <Messaging isLoggedIn={isLoggedIn} activeAccount={selectedUserIndex.value} renameFolder={renameFolder} deleteFolder={deleteFolder} createFolder={createFolder} />,
                            path: ":userId/messaging"
                        },
                    ],
                },
            ],
        },
    ]);

    const appContextValue = useMemo(() => ({
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
