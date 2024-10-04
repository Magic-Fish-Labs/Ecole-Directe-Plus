import { useState, useEffect, useRef, createContext, useContext, useMemo, lazy, Suspense } from "react";
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
import { getGradeValue, calcAverage, findCategory, calcCategoryAverage, calcGeneralAverage } from "./utils/gradesTools";
import { areOccurenciesEqual, createUserLists, encrypt, decrypt, getBrowser } from "./utils/utils";
import { getCurrentSchoolYear } from "./utils/date";
import { getProxiedURL } from "./utils/requests";
import EdpuLogo from "./components/graphics/EdpuLogo";
import useUserSession from "./utils/edpHooks/useUserSession";

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


function consoleLogEDPLogo() {
    console.log(`%c
                   /%&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&    
               #&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&    
            /&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&    
           &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&    
         /&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&    
         %&&&&%/                                            
        /&&/                                                
        %/    /#&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&    
           /%&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&    
          %&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&    
         %&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&    
        (&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&    
        &&&&&&&&&&&&/                                       
        &&&&&&&&&&&&\\                                       
        (&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&    
         %&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&    
          %&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&    
           \\&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&    
              \\%&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&    
    
                Looking for curious minds. Are you in?      
          https://github.com/Magic-Fishes/Ecole-Directe-Plus 
`, `color: ${window.matchMedia('(prefers-color-scheme: dark)').matches ? "#B8BEFD" : "#4742df"}`);
    console.log("%cWarning!\n%cUsing this console may allow attackers to impersonate you and steal your information using an attack called Self-XSS. Do not enter or paste code that you do not understand.",
        `color:${window.matchMedia('(prefers-color-scheme: dark)').matches ? "rgb(223, 98, 98)" : "rgb(200, 80, 80)"};font-size:1.5rem;-webkit-text-stroke: 1px black;font-weight:bold`, "");
}

consoleLogEDPLogo();

const currentEDPVersion = "0.4.0";
const apiVersion = "4.60.5";

// secret webhooks
const carpeConviviale = "CARPE_CONVIVIALE_WEBHOOK_URL";
const sardineInsolente = "SARDINE_INSOLENTE_WEBHOOK_URL";
const thonFrustre = "THON_FRUSTRE_WEBHOOK_URL";

// const lsIdName = encrypt("userIds")
const lsIdName = "encryptedUserIds"
const WINDOW_WIDTH_BREAKPOINT_MOBILE_LAYOUT = 450; // px
const WINDOW_WIDTH_BREAKPOINT_TABLET_LAYOUT = 869; // px

const defaultSettings = {
    keepLoggedIn: false,
    displayTheme: "auto",
    displayMode: "quality",
    isSepiaEnabled: false,
    isHighContrastEnabled: false,
    isGrayscaleEnabled: false,
    isPhotoBlurEnabled: false,
    isPartyModeEnabled: true,
    isStreamerModeEnabled: false,
    gradeScale: 20,
    isGradeScaleEnabled: false,
    schoolYear: getCurrentSchoolYear(),
    isSchoolYearEnabled: false,
    lucioleFont: false,
    windowArrangement: [],
    allowWindowsArrangement: true,
    dynamicLoading: true,
    shareSettings: true,
    negativeBadges: false,
    allowAnonymousReports: true,
    isDevChannel: false
}

const browserExtensionDownloadLink = {
    Opera: "https://chromewebstore.google.com/detail/ecole-directe-plus-unbloc/jglboadggdgnaicfaejjgmnfhfdnflkb?hl=fr",
    Chromium: "https://chromewebstore.google.com/detail/ecole-directe-plus-unbloc/jglboadggdgnaicfaejjgmnfhfdnflkb?hl=fr",
    Chrome: "https://chromewebstore.google.com/detail/ecole-directe-plus-unbloc/jglboadggdgnaicfaejjgmnfhfdnflkb?hl=fr",
    Firefox: "https://unblock.ecole-directe.plus/edpu-0.1.4.xpi",
    Edge: "https://microsoftedge.microsoft.com/addons/detail/ecole-directe-plus-unbloc/bghggiemmicjhglgnilchjfnlbcmehgg",
    Safari: "/edp-unblock"
}

const userBrowser = getBrowser();

const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)');

// get data from localstorage
const tokenFromLs = localStorage.getItem("token") ?? "";
const accountListFromLs = JSON.parse(localStorage.getItem("accountsList") ?? "[]");
const oldActiveAccountFromLs = parseInt(localStorage.getItem("oldActiveAccount") ?? 0);
let userSettingsFromLs = JSON.parse((localStorage.getItem("userSettings") ?? "[{}]"));
const keepLoggedInFromLs = getSetting("keepLoggedIn", 0, true);
const A2FInfoFromLS = JSON.parse((localStorage.getItem("A2FInfo") ?? "{}"));
let userIdsFromLs;
if (keepLoggedInFromLs) {
    userIdsFromLs = JSON.parse(decrypt(localStorage.getItem(lsIdName)) ?? "{}");
} else {
    userIdsFromLs = {};
}

function getSetting(setting, accountIdx, isGlobal = false) {
    if (isGlobal) {
        const globalSettingsFromLs = JSON.parse((localStorage.getItem("globalSettings") ?? "{}"));
        return globalSettingsFromLs[setting] ?? defaultSettings[setting];
    } else if (userSettingsFromLs[accountIdx]) {
        userSettingsFromLs = JSON.parse((localStorage.getItem("userSettings") ?? "{}"));
        return ((userSettingsFromLs[accountIdx] && userSettingsFromLs[accountIdx][setting]) ?? defaultSettings[setting]);
    }
    return defaultSettings[setting];
}


function initSettings(accountList) {
    // comment ajouter un setting :
    // userSettings ici ; defaultSettings
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
            lucioleFont: {
                value: getSetting("lucioleFont", i),
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
                value: getSetting("allowAnonymousReports", i)
            }
        })
    }
    return userSettings;
}

function initData(length) {
    return Array.from({ length: length }, (_) => ({
        badges: {
            star: 0,
            bestStudent: 0,
            greatStudent: 0,
            stonks: 0,
            keepOnFire: 0,
            meh: 0,
        },
    }))
}

// optimisation possible avec useCallback
export const AppContext = createContext(null);
export const LoginContext = createContext(null);

let promptInstallPWA = () => { };
window.addEventListener("beforeinstallprompt", (event) => { event.preventDefault(); promptInstallPWA = () => event.prompt() });
window.addEventListener("appinstalled", () => { promptInstallPWA = null });

export default function App({ edpFetch }) {
    // global account data
    // const userSession = useUserSession(localStorageSession);
    const userSession = useUserSession();
    const {
        username,
        password,
        token,
        A2FInfo,
        keepLoggedIn: keepLoggedInTemp,
        isLoggedIn,
        fetchLogin,
        fetchA2F,
    } = userSession;
    const tokenState = token.value;
    const setTokenState = token.set;
    const [accountsListState, setAccountsListState] = useState(accountListFromLs); // liste des profils sur le compte (notamment si compte parent)
    const [userIds, setUserIds] = useState(userIdsFromLs); // identifiants de connexion (username, pwd)
    const [requireA2F, setRequireA2F] = useState(false); // trigger or not the A2F pop-up
    const [temp0, setIsLoggedIn] = useState(false);
    const [activeAccount, setActiveAccount] = useState(oldActiveAccountFromLs); // compte actuellement sélectionné (utile pour les comptes parents)
    // const [keepLoggedIn, setKeepLoggedIn] = useState(getSetting("keepLoggedIn", activeAccount, true)); // fonctionnalité "rester connecté"
    const keepLoggedIn = keepLoggedInTemp.value;
    const setKeepLoggedIn = keepLoggedInTemp.set;

    // user settings
    const [userSettings, setUserSettings] = useState(initSettings(accountListFromLs)); // paramètres propre à chaque profil du compte
    const [shareSettings, setShareSettings] = useState(getSetting("shareSettings", activeAccount, true));
    const [isDevChannel, setIsDevChannel] = useState(getSetting("isDevChannel", activeAccount, true)); // canal dev: redirige vers l'URL dev.ecole-directe.plus où on déploie beaucoup plus régulièrement les mises à jour, mais qui peut être un peu instable

    // user data (chaque information relative à l'utilisateur est stockée dans un State qui lui est propre)
    const [timeline, setTimeline] = useState([]);
    const [schoolLife, setSchoolLife] = useState([]);
    const [userData, setUserData] = useState([]); // informations annexes de l'utilisateur qui ne relèvent pas directement d'un JSON issue de l'API d'ED que l'on a préalablement filtré et trié

    // utils
    const [oldTimeoutId, setOldTimeoutId] = useState(null);
    const [isMobileLayout, setIsMobileLayout] = useState(() => window.matchMedia(`(max-width: ${WINDOW_WIDTH_BREAKPOINT_MOBILE_LAYOUT}px)`).matches); // permet de modifier le layout en fonction du type d'écran pour améliorer le responsive
    const [isTabletLayout, setIsTabletLayout] = useState(() => window.matchMedia(`(max-width: ${WINDOW_WIDTH_BREAKPOINT_TABLET_LAYOUT}px)`).matches);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isEDPUnblockInstalled, setIsEDPUnblockInstalled] = useState(true);
    const [isStandaloneApp, setIsStandaloneApp] = useState(((window.navigator.standalone ?? false) || window.matchMedia('(display-mode: standalone)').matches)); // détermine si l'utilisateur a installé le site comme application, permet également de modifier le layout en conséquence
    const [appKey, setAppKey] = useState(() => crypto.randomUUID());
    const [proxyError, setProxyError] = useState(false); // en cas d'erreur sur le serveur proxy d'EDP (toutes les requêtes passent par lui pour contourner les restrictions d'EcoleDirecte)

    // diverse
    const abortControllers = useRef([]); // permet d'abort tous les fetch en cas de déconnexion de l'utilisateur pendant une requête
    const loginAbortControllers = useRef([]); // permet d'abort tous les fetch en cas de déconnexion de l'utilisateur pendant une requête
    const entryURL = useRef(window.location.href);
    const actualDisplayTheme = getActualDisplayTheme(); // thème d'affichage réel (ex: dark ou light, et non pas auto)
    const createNotification = useCreateNotification();

    class File {
        constructor(id, type, file, name = file.slice(0, file.lastIndexOf(".")), specialParams = {}) {
            /**id : 5018 / "654123546545612654984.pdf"
             * type : NODEVOIR / FICHIER_CDT
             * file : "file.pdf" / "TEST.txt"
             * name : "the_name_of_the_file_downloaded_without_extension"
             * specialParams : params needed in the URL in certains cases
             */
            this.id = id
            this.type = type
            this.name = name
            this.extension = file.slice(file.lastIndexOf(".") + 1)
            this.specialParams = specialParams
            this.state = "inactive"
        }

        fetch() {
            if (!this.blob) {
                if (this.state !== "requestForInstall") {
                    this.state = "fetching"
                }
                fetchFile(this.id, this.type, this.specialParams)
                    .then(blob => {
                        this.blob = blob;
                        if (this.state === "requestForInstall") {
                            this.install()
                        }
                    })
            }
        }

        download() {
            if (this.blob) {
                this.install();
            } else if (this.state === "fetching") {
                this.state = "requestForInstall"
            } else {
                this.state = "requestForInstall"
                this.fetch()
            }
        }

        async install() {
            const url = URL.createObjectURL(this.blob);
            const a = document.createElement('a');

            a.href = url;
            a.download = `${this.name}.${this.extension}`;

            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                                                                                  //
    //                                                                                  Gestion Storage                                                                                 //
    //                                                                                                                                                                                  //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /////////// SETTINGS ///////////

    function changeUserSettings(setting, value, accountIdx = activeAccount) {
        setUserSettings((oldSettings) => {
            const newSettings = [...oldSettings];
            newSettings[accountIdx][setting].value = value;
            return newSettings;
        })
        if (shareSettings) {
            syncSettings();
        }
    }

    function syncSettings() {
        setUserSettings((oldSettings) => {
            const selectedUserSetting = oldSettings[activeAccount]
            const newSettings = Array.from({ length: oldSettings.length }, (_) => structuredClone(selectedUserSetting));
            return newSettings;
        })
    }

    function getUserSettingValue(setting) {
        if (userSettings[activeAccount] && userSettings[activeAccount][setting]) {
            return userSettings[activeAccount][setting].value;
        } else {
            return undefined;
        }
    }

    function getUserSettingObject(setting) {
        return userSettings[activeAccount][setting]
    }

    function useUserSettings(setting = "") {
        /*
            use as a hook like location
            
            EX :
            userSettings = useUserSettings()
            console.log(userSettings.get("displayTheme"))
            > Value of displayTheme of current user


            You can pass the setting you wan in arguments of useUserSettings

            EX : 
            userDisplayTheme = useUserSettings("displayTheme")
            console.log(userDisplayTheme.get())
            > Value of displayTheme of current user
        */
        if (setting === "") {
            return {
                set: changeUserSettings, // set((oldState) => newState = oldState)
                get: getUserSettingValue, // get the value
                object: getUserSettingObject, // get the entire object
            }
        } else {
            return {
                set: (value) => { changeUserSettings(setting, value) },
                get: () => getUserSettingValue(setting),
                object: () => getUserSettingObject(setting),
            }
        }
    }


    const globalSettings = {
        keepLoggedIn: {
            value: keepLoggedIn,
            set: setKeepLoggedIn,
        },
        shareSettings: {
            value: shareSettings,
            set: setShareSettings,
        },
        isDevChannel: {
            value: isDevChannel,
            set: setIsDevChannel
        },
    }

    useEffect(() => {
        const lsGlobalSettings = {};
        for (const i in globalSettings) {
            lsGlobalSettings[i] = globalSettings[i].value ?? defaultSettings[i];
        }
        localStorage.setItem("globalSettings", JSON.stringify(lsGlobalSettings));

        const handleStorageChange = () => {
            const newLsGlobalSettings = JSON.parse(localStorage.getItem("globalSettings"))
            if (!areOccurenciesEqual(newLsGlobalSettings, globalSettings)) {
                for (const i in globalSettings) {
                    globalSettings[i].set(newLsGlobalSettings[i])
                }
            }
        }
        window.addEventListener("storage", handleStorageChange)

        return (() => {
            window.removeEventListener("storage", handleStorageChange);
        });
    }, [keepLoggedIn,
        shareSettings,
        isDevChannel])

    useEffect(() => {
        // handle storing into localStorage
        if (userSettings?.length > 0) {
            const lsUserSettings = [];
            for (let i = 0; i < userSettings.length; i++) {
                lsUserSettings[i] = {};
                for (let n in userSettings[i]) {
                    lsUserSettings[i][n] = (userSettings[i] ? (userSettings[i][n]?.value ?? defaultSettings[n]) : defaultSettings[n]);
                }
            }
            localStorage.setItem("userSettings", JSON.stringify(lsUserSettings));
        }
    }, [userSettings]);

    useEffect(() => {
        if (tokenState !== "") {
            localStorage.setItem("token", tokenState);
        }
    }, [tokenState]);

    useEffect(() => {
        if (accountsListState?.length > 0) {
            localStorage.setItem("accountsList", JSON.stringify(accountsListState));
        }
    }, [accountsListState]);

    useEffect(() => {
        const handleStorageChange = () => {
            // logout if the user has logout in any tab
            if (accountsListState?.length > 0 && localStorage.getItem("accountsList") === null) {
                logout();
                return 0;
            }
            // handle getting from localStorage if it changes
            applyConfigFromLocalStorage();
            if (accountsListState?.length > 0) {
                const newSettings = initSettings(accountsListState)
                if (!areOccurenciesEqual(newSettings, userSettings)) {
                    setUserSettings(newSettings);
                }
            }
        }

        const timeoutHandleStorageChange = () => {
            setTimeout(() => handleStorageChange(), 0); // timeout to prevent issues due to react async behavior
        }

        window.addEventListener("storage", timeoutHandleStorageChange)

        return (() => {
            window.removeEventListener("storage", timeoutHandleStorageChange);
        });
    }, [accountsListState, userSettings, tokenState]);


    useEffect(() => {
        if (shareSettings) {
            syncSettings();
        }
    }, [shareSettings])

    useEffect(() => {
        localStorage.setItem("oldActiveAccount", activeAccount)
    }, [activeAccount]);

    /////////// USER DATA ///////////

    // fonctions de type utils pour modifier le userData

    function changeUserData(data, value) {
        setUserData((oldData) => {
            const newData = [...oldData];
            if (!newData[activeAccount]) {
                newData[activeAccount] = {};
            }
            newData[activeAccount][data] = value;
            return newData;
        })
    }

    function getUserData(data) {
        return (userData ? (userData[activeAccount] ? userData[activeAccount][data] : undefined) : undefined);
    }

    function useUserData(data = "") {
        return data
            ? { set: (value) => changeUserData(data, value), get: () => getUserData(data) } // If the data is choosen, there is no need to get the full
            : { set: changeUserData, get: getUserData }
    }

    // gestion de la désactivation automatique du "rester connecté"
    useEffect(() => {
        if (!keepLoggedIn) {
            localStorage.removeItem(lsIdName);
        } else if (userIds.username && userIds.password) {
            localStorage.setItem(lsIdName, encrypt(JSON.stringify({ username: userIds.username, password: userIds.password })));
        } else {
            setIsLoggedIn(false);
        }
    }, [keepLoggedIn]);

    // réapplique les informations sauvegardées dans le localStorage (certaines ont déjà été appliquées à l'initialisation des States)
    function applyConfigFromLocalStorage() {
        // informations de connexion
        const token = localStorage.getItem("token");
        if (token && token !== "none" && token !== tokenState) {
            setTokenState(token);
        }
        const accountsList = JSON.parse(localStorage.getItem("accountsList"));
        if (accountsList && accountsList.length > 0 && !areOccurenciesEqual(accountsList, accountsListState)) {
            setAccountsListState(accountsList);
        }
    }

    // sécurité qui empêche la reconnexion automatique s'il manque au moins un identifiant
    useEffect(() => {
        if (!userIds.username || !userIds.password) {
            console.log("USERIDS EMPTY -> DISABLING KEEP LOGGED IN")
            setKeepLoggedIn(false);
        }
    }, [userIds]);

    useEffect(() => {
        // gestion synchronisatin du localStorage s'il est modifié dans un autre onglet
        applyConfigFromLocalStorage();

        // Gestion thème
        const handleOSThemeChange = () => {
            console.clear();
            consoleLogEDPLogo();
            if (getUserSettingValue("displayTheme") === "auto") {
                document.documentElement.classList.add(window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light");
                document.documentElement.classList.remove(window.matchMedia('(prefers-color-scheme: dark)').matches ? "light" : "dark");
                toggleThemeTransitionAnimation();
            }
        }
        prefersDarkMode.addEventListener('change', handleOSThemeChange);

        return (() => {
            prefersDarkMode.removeEventListener('change', handleOSThemeChange);
        });
    }, []);

    // Applique les informations du localStorage dès la première frame pour éviter certains bugs
    const isFirstFrame = useRef(true);
    if (isFirstFrame.current) {
        applyConfigFromLocalStorage();
        isFirstFrame.current = false;
    }

    // TABLET / MOBILE LAYOUT MANAGEMENT
    useEffect(() => {
        // gère l'état de isMobileLayout en fonction de la largeur de l'écran
        const handleWindowResize = () => {
            // setIsMobileLayout(window.innerWidth <= WINDOW_WIDTH_BREAKPOINT_MOBILE_LAYOUT);
            // setIsTabletLayout(window.innerWidth <= WINDOW_WIDTH_BREAKPOINT_TABLET_LAYOUT);
            setIsMobileLayout(window.matchMedia(`(max-width: ${WINDOW_WIDTH_BREAKPOINT_MOBILE_LAYOUT}px)`).matches);
            setIsTabletLayout(window.matchMedia(`(max-width: ${WINDOW_WIDTH_BREAKPOINT_TABLET_LAYOUT}px)`).matches);

            if (getBrowser() !== "Firefox") {
                // gestion du `zoom` sur petits écrans afin d'améliorer la lisibilité et le layout global
                if (window.innerWidth >= 869 && window.innerWidth < 1250) {
                    if (window.innerWidth >= 995) {
                        document.documentElement.style.zoom = (.2 / 170) * window.innerWidth - .47;
                    } else {
                        document.documentElement.style.zoom = .7;
                    }

                    let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
                    if (isSafari) {
                        const newFontSize = (.125 / 170) * window.innerWidth - .294;
                        if (newFontSize < 8) {
                            document.documentElement.style.fontSize = "8px";
                        } else if (newFontSize > 10) {
                            document.documentElement.style.fontSize = "";
                        } else {
                            document.documentElement.style.fontSize = newFontSize + "em";
                        }
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

    function addNewGrade({ value, coef, scale, name, type, subjectKey, periodKey }) {
        /** 
         * Ajoute une nouvelle note à l'utilisateur (simulation)
         * - value : valeur de la note
         * - coef : coefficient de la note
         * - scale : note maximum posible
         * - name : nom du devoir
         * - type : type de devoir (DS, DM, ...)
         */
        const grades = getUserData("grades")
        grades[periodKey].subjects[subjectKey].grades.push({
            value: value,
            coef: coef,
            scale: scale,
            name: name,
            badges: [],
            classAverage: "N/A",
            classMin: "N/A",
            classMax: "N/A",
            date: new Date(),
            elementType: "grade",
            entryDate: new Date(),
            examCorrectionSRC: "",
            examSubjectSRC: "",
            id: crypto.randomUUID(),
            isReal: false,
            skill: [],
            subjectName: grades[periodKey].subjects[subjectKey].name,
            type: type,
            upTheStreak: false,
            subjectKey: subjectKey,
            periodKey: periodKey,
        })
        changeUserData("grades", grades);
        updatePeriodGrades(periodKey)
    }

    function deleteFakeGrade(UUID, subjectKey, periodKey) {
        const newGrades = { ...getUserData("grades") }
        newGrades[periodKey].subjects[subjectKey].grades = newGrades[periodKey].subjects[subjectKey].grades.filter((el) => el.id !== UUID)
        changeUserData("grades", newGrades);
        updatePeriodGrades(periodKey)
    }

    function updatePeriodGrades(periodKey) {
        const grades = getUserData("grades");
        const period = grades[periodKey];

        for (const subject in period.subjects) {
            if (!subject.includes("category")) {
                period.subjects[subject].average = calcAverage(period.subjects[subject].grades);
            } else {
                period.subjects[subject].average = calcCategoryAverage(period, period.subjects[subject]);
            }
        }
        period.generalAverage = calcGeneralAverage(period)
        grades[periodKey] = period;
        changeUserData("grades", grades);
    }

    function setDefaultPeriod(grades = getUserData("grades")) {
        let currentPeriod = 0;
        for (let periodCode in grades) {
            if (Date.now() > grades[periodCode].endDate) {
                if (currentPeriod < Object.keys(grades).length - 1) {
                    currentPeriod++;
                }
            }
        }
        changeUserData("activePeriod", Object.keys(grades)[currentPeriod]);
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
        changeUserData("upcomingAssignments", upcomingAssignments)
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


    function sortMessageFolders(messages, origin=0) {
        const oldMessageFolders = useUserData("messageFolders").get();
        let sortedMessageFolders = messages.classeurs.filter((folder) => (oldMessageFolders === undefined || !oldMessageFolders.some((oldFolder) => oldFolder.id === folder.id))).map((folder) => { return {
            id: folder.id,
            name: folder.libelle,
            fetchInitiated: false,
            fetched: origin === folder.id
        }});
        if (oldMessageFolders === undefined) {
            sortedMessageFolders.unshift({
                id: 0,
                name: "Boîte de réception",
                fetchInitiated: true,
                fetched: origin === 0
            })
        } else {
            sortedMessageFolders.unshift(oldMessageFolders.map((folder) => {folder.id === origin && (folder.fetched = true); return folder}));
            sortedMessageFolders = sortedMessageFolders.flat();
        }

        return sortedMessageFolders;
    }


    function sortMessages(messages) {
        const sortedMessages = messages.messages.received.map((message) => { return {
            date: message.date,
            files: structuredClone(message.files)?.map((file) => new File(file.id, file.type, file.libelle)),
            from: message.from,
            id: message.id,
            folderId: message.idClasseur,
            read: message.read,
            subject: message.subject,
            content: null,
            // ...
        }});

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
            sanctions: []
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

                default:
                    break;
            }
        });

        changeUserData("sortedSchoolLife", sortedSchoolLife);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                                                                                  //
    //                                                                                  Fetch Functions                                                                                 //
    //                                                                                                                                                                                  //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function requireLogin() {
        // Affiche la BottomSheet de reconnexion
        setIsLoggedIn(false);
        localStorage.setItem("token", "none");
    }

    function loginFromOldAuthInfo(token, accountsList) {
        // En cas de rafraichissement de la page, recovery des informations à partir du token s'il n'a pas expiré
        if (!!token && token !== "none" && accountsList.length > 0) {
            console.log("LOGGED IN FROM OLD TOKEN & ACCOUNTSLIST");
            setUserInfo(token, accountsList);
            setIsLoggedIn(true);
        } else {
            console.log("NO ACCOUNTSLIST: LOGGED OUT");
            logout();
        }
    }

    const fakeLogin = () => {
        const fakeToken = "thisisafaketoken";
        const fakeAccountsList = [
            {
                accountType: "E",
                id: "0001",
                firstName: "Guest",
                lastName: "",
                email: "ecole.directe.plus@gmail.com",
                picture: "https://i.ibb.co/GC5f9RL/IMG-1124.jpg",
                schoolName: "École de la République",
                class: ["Pcpt", "Précepteur d'exception"]
            },
        ];
        resetUserData()
        setUserInfo(fakeToken, fakeAccountsList)
    }

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
                <a href={browserExtensionDownloadLink[userBrowser]} target={(!["Safari", "Firefox"].includes(userBrowser) ? "_blank" : "")}>Télécharger</a>
            </div>
        </>, { customClass: "extension-warning", timer: "infinite" })
    }

    async function fetchTimeline(controller = (new AbortController())) {
        abortControllers.current.push(controller);
        const data = {
            anneeScolaire: getUserSettingValue("isSchoolYearEnabled") ? getUserSettingValue("schoolYear").join("-") : ""
        }

        edpFetch(getProxiedURL(`https://api.ecoledirecte.com/v3/eleves/${accountsListState[activeAccount].id}/timeline.awp?verbe=get&v=${apiVersion}`, true),
            {
                method: "POST",
                headers: {
                    // "user-agent": navigator.userAgent,
                    "x-token": tokenState,
                },
                body: `data=${JSON.stringify(data)}`,
                signal: controller.signal,
                referrerPolicy: "no-referrer"
            },
            "text")
            .then((response) => {
                if (!response) {
                    setIsEDPUnblockInstalled(false);
                } else {
                    return JSON.parse(response);
                }
            })
            .then((response) => {
                let code;
                if (accountsListState[activeAccount].firstName === "Guest") {
                    code = 49969;
                } else {
                    code = response.code;
                }
                if (code === 200) {
                    const oldTimeline = structuredClone(timeline);
                    oldTimeline[activeAccount] = response.data;
                    setTimeline(oldTimeline);
                    setTokenState(response.token);
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

    async function fetchHomeworks(controller = (new AbortController()), date = "incoming") {
        /**
         * Fetch user homeworks
         * @param controller AbortController
         * @param date fetch the specified date (Date object) ; default value: "incoming": will fetch the incoming homeworks 
         */
        abortControllers.current.push(controller);
        const userId = activeAccount;

        let endpoint;
        if (date === "incoming") {
            endpoint = "cahierdetexte";
        } else {
            endpoint = "cahierdetexte/" + getISODate(date);
        }
        if (accountsListState[activeAccount].firstName === "Guest") {
            if (date === "incoming") {
                import("./data/guest/homeworks.json").then((module) => {
                    changeUserData("sortedHomeworks", sortNextHomeworks(module.data))
                })
            } else {
                import("./data/guest/detailed_homeworks.json").then((module) => {
                    changeUserData("sortedHomeworks", { ...getUserData("sortedHomeworks"), ...sortDayHomeworks({ [module.data.date]: module.data.matieres }) })
                })
            }
            abortControllers.current.splice(abortControllers.current.indexOf(controller), 1);
        } else {
            edpFetch(
                getProxiedURL(`https://api.ecoledirecte.com/v3/Eleves/${accountsListState[userId].id}/${endpoint}.awp?verbe=get&v=${apiVersion}`, true),
                {
                    method: "POST",
                    headers: {
                        "x-token": tokenState
                    },
                    body: "data={}",
                    signal: controller.signal
                },
                "json"
            )
                .then((response) => {
                    const code = response.code;
                    if (code === 200) {
                        if (date === "incoming") {
                            changeUserData("sortedHomeworks", { ...sortNextHomeworks(response.data), ...getUserData("sortedHomeworks") })
                        } else {
                            changeUserData("sortedHomeworks", { ...getUserData("sortedHomeworks"), ...sortDayHomeworks({ [response.data.date]: response.data.matieres }) })
                        }
                    } else if (code === 520 || code === 525) {
                        // token invalide
                        console.log("INVALID TOKEN: LOGIN REQUIRED");
                        requireLogin();
                    }
                    setTokenState((old) => (response?.token || old));
                })
                .catch((error) => {
                    if (error.message === "Unexpected token 'P', \"Proxy error\" is not valid JSON") {
                        setProxyError(true);
                    } else {
                        console.error(error)
                    }
                })
                .finally(() => {
                    abortControllers.current.splice(abortControllers.current.indexOf(controller), 1);
                })
        }
    }

    async function fetchHomeworksSequentially(controller = new AbortController(), date = "incoming") {
        abortControllers.current.push(controller);
        const userId = activeAccount;

        let endpoint;
        if (date === "incoming") {
            endpoint = "cahierdetexte";
        } else {
            endpoint = "cahierdetexte/" + getISODate(date);
        }

        if (accountsListState[activeAccount].firstName === "Guest") {
            if (date === "incoming") {
                const module = await import("./data/guest/homeworks.json");
                changeUserData("sortedHomeworks", sortNextHomeworks(module.data));
            } else {
                const module = await import("./data/guest/detailed_homeworks.json");
                changeUserData("sortedHomeworks", {
                    ...getUserData("sortedHomeworks"),
                    ...sortDayHomeworks({ [module.data.date]: module.data.matieres })
                });
            }
            abortControllers.current.splice(abortControllers.current.indexOf(controller), 1);
        } else {
            try {
                const response = await edpFetch(
                    getProxiedURL(`https://api.ecoledirecte.com/v3/Eleves/${accountsListState[userId].id}/${endpoint}.awp?verbe=get&v=${apiVersion}`, true),
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
                        changeUserData("sortedHomeworks", {
                            ...sortNextHomeworks(responseData.data),
                            ...getUserData("sortedHomeworks")
                        });
                    } else {
                        changeUserData("sortedHomeworks", {
                            ...getUserData("sortedHomeworks"),
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


    async function fetchHomeworksDone({ tasksDone = [], tasksNotDone = [] }, controller = (new AbortController())) {
        /**
         * Change the state of selected homeworks
         * @param tasksDone Tasks switched to true 
         * @param tasksNotDone Tasks switched to false
         * These two paramerters are in a single object 
         * @param controller AbortController
         */
        abortControllers.current.push(controller);
        const userId = activeAccount;

        return edpFetch(
            getProxiedURL(`https://api.ecoledirecte.com/v3/Eleves/${accountsListState[userId].id}/cahierdetexte.awp?verbe=put&v=${apiVersion}`, true),
            {
                method: "POST",
                headers: {
                    "x-token": tokenState
                },
                body: "data=" + JSON.stringify({ idDevoirsEffectues: tasksDone, idDevoirsNonEffectues: tasksNotDone }),
                signal: controller.signal
            },
            "json"
        )
            .then((response) => {
                let code;
                if (accountsListState[activeAccount].firstName === "Guest") {
                    code = 49969;
                } else {
                    code = response.code;
                }
                if (code === 520 || code === 525) {
                    // token invalide
                    console.log("INVALID TOKEN: LOGIN REQUIRED");
                    requireLogin();
                }
                setTokenState((old) => (response?.token || old));
            })
            .finally(() => {
                abortControllers.current.splice(abortControllers.current.indexOf(controller), 1);
            })
    }


    async function fetchMessages(folderId=0, controller = (new AbortController())) {
        const oldMessageFolders = useUserData("messageFolders").get();
        if (oldMessageFolders && oldMessageFolders?.length > 0) {
            if (oldMessageFolders.find((item) => item.id === folderId)?.fetchInitiated) {
                return;
            } else {
                oldMessageFolders.find((item) => item.id === folderId).fetchInitiated = true;
                useUserData("messageFolders").set(oldMessageFolders)
            }
        }
        
        abortControllers.current.push(controller);
        const userId = activeAccount;
        const data = {
            anneeMessages: getUserSettingValue("isSchoolYearEnabled") ? getUserSettingValue("schoolYear").join("-") : getCurrentSchoolYear().join("-"),
        }
        edpFetch(
            getProxiedURL(`https://api.ecoledirecte.com/v3/${accountsListState[userId].accountType === "E" ? "eleves/" + accountsListState[userId].id : "familles/" + accountsListState[userId].familyId}/messages.awp?force=false&typeRecuperation=received&idClasseur=${folderId}&orderBy=date&order=desc&query=&onlyRead=&page=0&itemsPerPage=100&getAll=0&verbe=get&v=${apiVersion}`, true),
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
                if (accountsListState[activeAccount].firstName === "Guest") {
                    code = 49969;
                } else {
                    code = response.code;
                }
                if (code === 200) {
                    let oldSortedMessages = useUserData("sortedMessages").get();
                    if (oldSortedMessages === undefined) {
                        oldSortedMessages = [];
                    }
                    oldSortedMessages.push(sortMessages(response.data));
                    changeUserData("sortedMessages", oldSortedMessages.flat());
                    changeUserData("messageFolders", sortMessageFolders(response.data, folderId));
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
        const oldSortedMessages = useUserData("sortedMessages").get();
        if (oldSortedMessages && oldSortedMessages?.length > 0) {
            const targetMessageIdx = oldSortedMessages.findIndex((item) => item.id === id);
            if (oldSortedMessages[targetMessageIdx].content !== null) {
                return;
            }
        }
        abortControllers.current.push(controller);
        const userId = activeAccount;
        const data = {
            anneeMessages: getUserSettingValue("isSchoolYearEnabled") ? getUserSettingValue("schoolYear").join("-") : getCurrentSchoolYear().join("-"),
        }
        edpFetch(
            getProxiedURL(`https://api.ecoledirecte.com/v3/${accountsListState[userId].accountType === "E" ? "eleves/" + accountsListState[userId].id : "familles/" + accountsListState[userId].familyId}/messages/${id}.awp?verbe=get&mode=destinataire&v=${apiVersion}`, true),
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
                if (accountsListState[activeAccount].firstName === "Guest") {
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
        const userId = activeAccount;
        const data = {
            anneeMessages: getUserSettingValue("isSchoolYearEnabled") ? getUserSettingValue("schoolYear").join("-") : getCurrentSchoolYear().join("-"),
            action: "marquerCommeNonLu",
            ids: ids
        }
        edpFetch(
            getProxiedURL(`https://api.ecoledirecte.com/v3/${accountsListState[userId].accountType === "E" ? "eleves/" + accountsListState[userId].id : "familles/" + accountsListState[userId].familyId}/messages.awp?verbe=put&v=${apiVersion}`, true),
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
                if (accountsListState[activeAccount].firstName === "Guest") {
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


    async function fetchSchoolLife(controller = (new AbortController())) {
        abortControllers.current.push(controller);
        const data = {
            anneeScolaire: getUserSettingValue("isSchoolYearEnabled") ? getUserSettingValue("schoolYear").join("-") : ""
        }

        edpFetch(getProxiedURL(`https://api.ecoledirecte.com/v3/eleves/${accountsListState[activeAccount].id}/viescolaire.awp?verbe=get&v=${apiVersion}`, true),
            {
                method: "POST",
                headers: {
                    // "user-agent": navigator.userAgent,
                    "x-token": tokenState,
                },
                body: `data=${JSON.stringify(data)}`,
                signal: controller.signal,
                referrerPolicy: "no-referrer"
            },
            "json")
            .then((response) => {
                let code;
                if (accountsListState[activeAccount].firstName === "Guest") {
                    code = 403;
                } else {
                    code = response.code;
                }
                if (code === 200 || code === 210) { // 210: quand l'utilisateur n'a pas de retard/absence/sanction
                    const oldSchoolLife = structuredClone(schoolLife);
                    oldSchoolLife[activeAccount] = response.data;
                    setSchoolLife(oldSchoolLife);
                    setTokenState(response.token);
                } else if (code === 520 || code === 525) {
                    // token invalide
                    console.log("INVALID TOKEN: LOGIN REQUIRED");
                    requireLogin();
                } else if (code === 403) {
                    setTokenState((old) => (response.token || old));
                }
            })
            .catch((error) => {
                if (error.message === "Unexpected token 'P', \"Proxy error\" is not valid JSON") {
                    setProxyError(true);
                }
            })
            .finally(() => {
                abortControllers.current.splice(abortControllers.current.indexOf(controller), 1);
            })
    }

    async function createFolderStorage(name) {
        const data = {
            libelle: name,
        }
        edpFetch(getProxiedURL("https://api.ecoledirecte.com/v3/messagerie/classeurs.awp?verbe=post%26v=4.52.0", true),
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

    async function fetchFile(id, type, specialParams) {
        const { idDevoir } = specialParams
        return await edpFetch(
            `https://api.ecoledirecte.com/v3/telechargement.awp?verbe=get&fichierId=${id}&leTypeDeFichier=${type}${idDevoir ? `&idDevoir=${idDevoir}` : ""}`,
            {
                method: "POST",
                headers: {
                    "x-token": tokenState
                },
                cors: "no-cors",
                body: `data=${JSON.stringify({ forceDownload: 0 })}`,
                referrerPolicy: "no-referrer"
            },
            "blob"
        )
            .catch(error => console.error('Erreur lors du téléchargement du fichier:', error))
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                                                                                 //
    //                                                                              End Of Fetch Functions                                                                             //
    //                                                                                                                                                                                 //
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    /* ################################ CONNEXION/DÉCONNEXION ################################ */

    function setUserInfo(token, accountsList) {
        console.log("LOGGED IN ; TOKEN & ACCOUNTSLIST GOT");
        setTokenState(token);
        setAccountsListState(accountsList);
        setTimeline(createUserLists(accountsList.length));
        setSchoolLife(createUserLists(accountsList.length));
        setUserSettings(initSettings(accountsList));
        setUserData(initData(accountsList.length));
        // localStorage.setItem("token", token);
        // localStorage.setItem("accountsList", JSON.stringify(accountsList));
    }

    function resetUserData(hard = true) {
        if (hard) {
            setUserIds({});
            setActiveAccount(0);
            // localStorage.removeItem(lsIdName);
            localStorage.removeItem("encryptedUserIds");
        }
        setUserData([])
        setTimeline([]);
        setSchoolLife([]);
        // setKeepLoggedIn(false);
    }

    function logout() {
        // suppression des informations de connexion
        localStorage.removeItem("token");
        localStorage.removeItem("accountsList");
        localStorage.removeItem("oldActiveAccount");
        // suppression des paramètres locaux et globaux
        localStorage.removeItem("userSettings");
        localStorage.removeItem("keepLoggedIn");
        // réinitialisation des States
        setTokenState("");
        setAccountsListState([]);
        resetUserData();
        setKeepLoggedIn(false);
        setIsLoggedIn(false);
        // abort tous les fetch en cours pour éviter une reconnexion à partir du nouveau token renvoyé par l'API
        for (let controller of abortControllers.current) {
            controller.abort();
        }
        abortControllers.current = [];
    }


    /* ################################ THEME ################################ */

    useEffect(() => {
        const metaThemeColor = document.getElementById("theme-color");
        if (getUserSettingValue("displayTheme") === "dark") {
            document.documentElement.classList.add("dark");
            document.documentElement.classList.remove("light");
            metaThemeColor.content = "#181829";
        } else if (getUserSettingValue("displayTheme") === "light") {
            document.documentElement.classList.add("light");
            document.documentElement.classList.remove("dark");
            metaThemeColor.content = "#e4e4ff";
        } else {
            document.documentElement.classList.add(window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light");
            document.documentElement.classList.remove(window.matchMedia('(prefers-color-scheme: dark)').matches ? "light" : "dark");
            metaThemeColor.content = (window.matchMedia('(prefers-color-scheme: dark)').matches ? "#181829" : "#e4e4ff");
        }
        toggleThemeTransitionAnimation();
    }, [getUserSettingValue("displayTheme")]);


    function getActualDisplayTheme() {
        const displayTheme = getUserSettingValue("displayTheme");
        if (displayTheme === "auto") {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
        }
        return displayTheme;
    }



    function toggleThemeTransitionAnimation() {
        if (getUserSettingValue("displayMode") === "balanced" || getUserSettingValue("displayMode") === "performance") {
            return 0;
        }
        //  vérifie l'existence d'un timeout actif
        if (oldTimeoutId) {
            // un timeout était déjà en cours, on le supprime
            clearTimeout(oldTimeoutId);
        }
        document.documentElement.classList.add("switching-theme");
        const timeoutId = setTimeout(() => { document.documentElement.classList.remove("switching-theme") }, 500);
        setOldTimeoutId(timeoutId);
    }

    /* ################################ MODE D'AFFICHAGE ################################ */

    useEffect(() => {
        document.documentElement.classList.remove("quality");
        document.documentElement.classList.remove("balanced");
        document.documentElement.classList.remove("performance");

        document.documentElement.classList.add(getUserSettingValue("displayMode"));
    }, [getUserSettingValue("displayMode")]);

    /* ################################################################################### */

    function refreshApp() {
        // permet de refresh l'app sans F5
        setAppKey(crypto.randomUUID());
    }

    // routing system
    const router = createBrowserRouter([
        {
            path: "/",
            element:
                <Root
                    currentEDPVersion={currentEDPVersion}
                    token={tokenState}
                    accountsList={accountsListState}
                    fakeLogin={fakeLogin}
                    resetUserData={resetUserData}

                    setDisplayTheme={(value) => { changeUserSettings("displayTheme", value) }}
                    displayTheme={getUserSettingValue("displayTheme")}

                    setDisplayModeState={(value) => { changeUserSettings("displayMode", value) }}
                    displayMode={getUserSettingValue("displayMode")}

                    activeAccount={activeAccount}
                    setActiveAccount={setActiveAccount}
                    logout={logout}
                    isStandaloneApp={isStandaloneApp}
                    isTabletLayout={isTabletLayout}

                    fetchHomeworks={fetchHomeworks}

                    setIsFullScreen={setIsFullScreen}
                    globalSettings={globalSettings}
                    useUserSettings={useUserSettings}
                    entryURL={entryURL}
                    setting={userSettings}
                    syncSettings={syncSettings}
                    createFolderStorage={createFolderStorage}

                    handleEdBan={handleEdBan}
                    isEDPUnblockInstalled={isEDPUnblockInstalled}
                    setIsEDPUnblockInstalled={setIsEDPUnblockInstalled}
                    requireA2F={requireA2F}
                    setRequireA2F={setRequireA2F}
                    fetchA2F={fetchA2F}

                    proxyError={proxyError}
                />
            ,

            errorElement: <ErrorPage sardineInsolente={sardineInsolente} />,
            children: [
                {
                    element: <LandingPage token={tokenState} accountsList={accountsListState} />,
                    path: "/",
                },
                {
                    element: <Feedback activeUser={(accountsListState.length > 0 && accountsListState[activeAccount])} carpeConviviale={carpeConviviale} isTabletLayout={isTabletLayout} />,
                    path: "feedback",
                },
                {
                    element: <EdpUnblock />,
                    path: "edp-unblock",
                },
                {
                    element: <Canardman />,
                    path: "quackquack",
                },
                {
                    element: <Lab />,
                    path: "lab",
                },
                {
                    element: <Museum />,
                    path: "museum",
                },
                {
                    element: <UnsubscribeEmails activeUser={(accountsListState.length > 0 && accountsListState[activeAccount])} thonFrustre={thonFrustre} />,
                    path: "unsubscribe-emails",
                },
                {
                    element: <Login logout={logout} loginFromOldAuthInfo={loginFromOldAuthInfo} currentEDPVersion={currentEDPVersion} />,
                    path: "login",
                },
                {
                    element: <Navigate to={`/app/${activeAccount}/dashboard`} />,
                    path: "app",
                },
                {
                    element: ((!tokenState || accountsListState.length < 1)
                        ? <Navigate to="/login" replace={true} />
                        : <>
                            <Header
                                currentEDPVersion={currentEDPVersion}
                                token={tokenState}
                                accountsList={accountsListState}
                                setActiveAccount={setActiveAccount}
                                activeAccount={activeAccount}
                                carpeConviviale={carpeConviviale}
                                isLoggedIn={isLoggedIn}
                                fetchTimeline={fetchTimeline}
                                timeline={timeline}
                                isTabletLayout={isTabletLayout}
                                isFullScreen={isFullScreen}
                                logout={logout}
                            />
                            {(!isLoggedIn && <LoginBottomSheet logout={logout} loginFromOldAuthInfo={loginFromOldAuthInfo} backgroundTask={keepLoggedIn && !!userIds.username && !!userIds.password && !requireA2F} onClose={() => setIsLoggedIn(true)} close={keepLoggedIn && !!userIds.username && !!userIds.password && !requireA2F} />)}
                        </>),
                    path: "app",
                    children: [
                        {
                            element: <Navigate to={`/app/${activeAccount}/account`} replace={true} />,
                            path: "account",
                        },
                        {
                            element: <Account schoolLife={schoolLife} fetchSchoolLife={fetchSchoolLife} sortSchoolLife={sortSchoolLife} isLoggedIn={isLoggedIn} activeAccount={activeAccount} />,
                            path: ":userId/account"
                        },
                        {
                            element: <Navigate to={`/app/${activeAccount}/settings`} replace={true} />,
                            path: "settings",
                        },
                        {
                            element: <Settings usersSettings={userSettings[activeAccount]} accountsList={accountsListState} getCurrentSchoolYear={getCurrentSchoolYear} resetUserData={resetUserData} />,
                            path: ":userId/settings"
                        },
                        {
                            element: <Navigate to={`/app/${activeAccount}/dashboard`} replace={true} />,
                            path: ":userId",
                        },
                        {
                            element: <Navigate to={`/app/${activeAccount}/dashboard`} replace={true} />,
                            path: "dashboard",
                        },
                        {
                            element: <Dashboard fetchHomeworks={fetchHomeworks} activeAccount={activeAccount} isLoggedIn={isLoggedIn} useUserData={useUserData} isTabletLayout={isTabletLayout} />,
                            path: ":userId/dashboard"
                        },
                        {
                            element: <Navigate to={`/app/${activeAccount}/grades`} replace={true} />,
                            path: "grades"
                        },
                        {
                            element: <Grades activeAccount={activeAccount} isLoggedIn={isLoggedIn} useUserData={useUserData} isTabletLayout={isTabletLayout} />,
                            path: ":userId/grades"
                        },
                        {
                            element: <Navigate to={`/app/${activeAccount}/homeworks`} replace={true} />,
                            path: "homeworks"
                        },
                        {
                            element: <Homeworks isLoggedIn={isLoggedIn} activeAccount={activeAccount} fetchHomeworks={fetchHomeworks} />,
                            path: ":userId/homeworks"
                        },
                        {
                            element: <Navigate to={`/app/${activeAccount}/timetable`} replace={true} />,
                            path: "timetable"
                        },
                        {
                            element: <Timetable />,
                            path: ":userId/timetable"
                        },
                        {
                            element: <Navigate to={`/app/${activeAccount}/messaging`} replace={true} />,
                            path: "messaging"
                        },
                        {
                            element: <Messaging isLoggedIn={isLoggedIn} activeAccount={activeAccount} fetchMessages={fetchMessages} fetchMessageContent={fetchMessageContent} fetchMessageMarkAsUnread={fetchMessageMarkAsUnread} />,
                            path: ":userId/messaging"
                        },
                    ],
                },
            ],
        },
    ]);

    const appContextValue = useMemo(() => ({
        useUserData,
        useUserSettings,
        refreshApp,
        addNewGrade,
        deleteFakeGrade,
        fetchHomeworksDone,
        fetchHomeworks,
        fetchHomeworksSequentially,
        promptInstallPWA,
        activeAccount,
        accountsListState,
        isLoggedIn,
        isMobileLayout,
        isTabletLayout,
        isStandaloneApp,
        isDevChannel,
        globalSettings,
        actualDisplayTheme,
        currentEDPVersion,
    }), [
        useUserData,
        useUserSettings,
        refreshApp,
        addNewGrade,
        deleteFakeGrade,
        fetchHomeworksDone,
        fetchHomeworks,
        fetchHomeworksSequentially,
        promptInstallPWA,
        activeAccount,
        accountsListState,
        isLoggedIn,
        isMobileLayout,
        isTabletLayout,
        isStandaloneApp,
        isDevChannel,
        globalSettings,
        actualDisplayTheme,
        currentEDPVersion,
    ]);

    const loginData = {
        username,
        password,
        keepLoggedInTemp,
        fetchLogin,
        fetchA2F,
    }

    return (
        <AppContext.Provider value={appContextValue} key={appKey}>
            <LoginContext.Provider value={loginData}>
                <Suspense fallback={<AppLoading currentEDPVersion={currentEDPVersion} />}>
                    <RouterProvider router={router} />
                </Suspense>
            </LoginContext.Provider>
        </AppContext.Provider>
    );
}