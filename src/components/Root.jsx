
import { useState, useEffect, useRef, useContext } from "react";
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';

import PatchNotes from "./generic/PatchNotes";
import WelcomePopUp from "./generic/WelcomePopUp";
import ProxyErrorNotification from "./Errors/ProxyErrorNotification";

import { useCreateNotification } from "./generic/PopUps/Notification";
import DoubleAuthLogin from "./Login/DoubleAuthLogin";

import { EDPVersion } from "../utils/constants/configs";
import { AccountContext, SettingsContext, UserDataContext } from "../App";

export default function Root({ get, accountsList, fakeLogin, resetUserData, syncSettings, createFolderStorage, displayTheme, displayMode, setDisplayModeState, activeAccount, setActiveAccount, setIsFullScreen, globalSettings, entryURL, logout, isStandaloneApp, isTabletLayout, proxyError, fetchHomeworks, handleEdBan, isEDPUnblockInstalled, setIsEDPUnblockInstalled, setRequireDoubleAuth, isEDPUnblockActuallyInstalled, setIsEDPUnblockActuallyInstalled, }) {

    const { requireDoubleAuth } = useContext(AccountContext)
    const {
        isSepiaEnabled: { value: isSepiaEnabled },
        isHighContrastEnabled: { value: isHighContrastEnabled },
        isGrayscaleEnabled: { value: isGrayscaleEnabled },
        isLucioleFontEnabled: { value: isLucioleFontEnabled },
    } = useContext(SettingsContext).user;

    const userData = useContext(UserDataContext);
    const {
        homeworks: { value: homeworks },
        activeHomeworkDate: { value: activeHomeworkDate, set: setActiveHomeworkDate },
        activeHomeworkId: { value: activeHomeworkId, set: setActiveHomeworkId },
    } = userData;

    const createNotification = useCreateNotification();

    const [isNewUser, setIsNewUser] = useState(false);
    const [isNewEDPVersion, setIsNewEDPVersion] = useState(false);
    const [popUp, setPopUp] = useState(false);
    const [isAdmin, setIsAdmin] = useState((!process.env.NODE_ENV || process.env.NODE_ENV === "development"));

    const navigate = useNavigate();
    const location = useLocation();
    const urlParams = new URLSearchParams(location.search);

    const commandInputs = useRef([]);
    
    function redirectToFeedback() {
        navigate("/feedback");
    }

    function redirectToApp() {
        navigate(`/app/${activeAccount}/dashboard`, { replace: true });
    }

    function redirectToLab() {
        navigate("/lab");
    }

    function redirectToMuseum() {
        navigate("/museum");
    }

    function redirectToLogin() {
        navigate("/login");
    }

    function redirectToLandingPage() {
        navigate("/")
    }

    function changeFont() {
        let font = prompt("Enter the font name:", document.documentElement.style.getPropertyValue("--font-family"));
        if (!(font == null || font == "")) {
            document.documentElement.style.setProperty("--font-family", font);
        }
    }

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsAdmin(false);
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        }
    }, [])


    // welcome pop-up
    useEffect(() => {
        function necessaryResets(oldVersion) {
            const parsedOldVersion = parseInt(oldVersion.split(".").join(""));
            if (parsedOldVersion <= 7) { // v0.0.7
                resetUserData();
            } else if (parsedOldVersion <= 15) { // v0.1.5
                localStorage.removeItem("userIds");
                localStorage.removeItem("encryptedUserIds");
                return 0;
            } else if (parsedOldVersion <= 21) { // v0.2.1
                localStorage.removeItem("encryptedUserIds");
                return 0;
            } else if (parsedOldVersion <= 22) { // v0.2.2
                return 0;
            } else if (parsedOldVersion <= 23) { // v0.2.3
                return 0;
            } else if (parsedOldVersion <= 24) { // v0.2.4
                return 0;
            } else if (parsedOldVersion <= 25) { // v0.2.5
                return 0;
            } else {
                localStorage.clear();
                localStorage.setItem("EDPVersion", EDPVersion);
            }
        }

        // localStorage.clear();
        if (localStorage.getItem("EDPVersion") !== EDPVersion) {
            if (localStorage.getItem("EDPVersion") === null) {
                if (location.pathname !== "/") {
                    setIsNewUser(true);
                } else {
                    localStorage.setItem("EDPVersion", EDPVersion);
                    setIsNewEDPVersion(true);
                    necessaryResets(localStorage.getItem("EDPVersion"));
                }
            } else {
                setIsNewEDPVersion(true);
                necessaryResets(localStorage.getItem("EDPVersion"));
            }
        }
    }, []);

    useEffect(() => {
        if (homeworks) {
            const urlParamDate = urlParams.get("homework_date");
            const urlParamId = parseInt(urlParams.get("homework_id"));
            
            if (urlParamDate || urlParamId) {
                let urlActiveHomeworkDate = null;
                let urlActiveHomeworkId = null;
                
                if (Object.keys(homeworks).includes(urlParamDate)) {
                    urlActiveHomeworkDate = urlParamDate;
                    if (homeworks[urlActiveHomeworkDate].some((task) => task.id === urlParamId)) {
                        urlActiveHomeworkId = urlParamId;
                    }
                }
                setActiveHomeworkDate(urlActiveHomeworkDate);
                setActiveHomeworkId(urlActiveHomeworkId);
                navigate(location.pathname);
            }
        }
    }, [urlParams, homeworks]);

    useEffect(() => {
        if (isNewUser) {
            setPopUp("newUser")
        } else if (isNewEDPVersion) {
            setPopUp("newEDPVersion");
        } else {
            setPopUp(false);
        }
    }, [isNewUser, isNewEDPVersion]);

    // redirect to /edp-unblock
    useEffect(() => {
        if (!isEDPUnblockInstalled) {
            if (location.pathname === "/login") {
                navigate("/edp-unblock");
            } else {
                handleEdBan();
            }
            setIsEDPUnblockInstalled(true);
        }
    }, [isEDPUnblockInstalled]);

    // devChannel management
    useEffect(() => {
        function handleDevChannel() {
            if (location.pathname === "/unsubscribe-emails" || window.location.hostname === "localhost" || !window.location.hostname) {
                return 0;
            }
            if (process.env.NODE_ENV !== "development") {
                const url = new URL(entryURL.current);
                const params = url.searchParams;
                const isVerifiedOrigin = Boolean(params.get("verifiedOrigin"));
                console.log("url.href:", url.href)
                console.log("isVerifiedOrigin:", isVerifiedOrigin);
                if (isVerifiedOrigin || isStandaloneApp) {
                    console.log("verified origin");
                    entryURL.current = window.location.origin;

                    if (window.location.hostname === "dev.ecole-directe.plus") {
                        globalSettings.isDevChannel.set(true);
                    } else {
                        globalSettings.isDevChannel.set(false);
                    }

                    navigate(window.location.pathname);
                } else {
                    if (globalSettings.isDevChannel.value) {
                        if (window.location.hostname !== "dev.ecole-directe.plus") {
                            window.location.href = "https://dev.ecole-directe.plus/?verifiedOrigin=true";
                        }
                    } else {
                        if (window.location.hostname !== "ecole-directe.plus") {
                            window.location.href = "https://ecole-directe.plus/?verifiedOrigin=true";
                        }
                    }
                }
            }
        }

        handleDevChannel();
    }, [globalSettings.isDevChannel.value]);


    // filters management
    useEffect(() => {
        let filters = "";
        let fontFamily = ""
        if (isSepiaEnabled) {
            filters += "sepia(.5) ";
        }
        if (isHighContrastEnabled) {
            filters += "contrast(1.5) ";
        }
        if (isGrayscaleEnabled) {
            filters += "grayscale(1) ";
        }
        if (isLucioleFontEnabled) {
            fontFamily = "Luciole, sans-serif";
        }


        document.documentElement.style.setProperty("--font-family", fontFamily);
        document.documentElement.style.filter = filters;
    }, [isSepiaEnabled, isHighContrastEnabled, isGrayscaleEnabled, isLucioleFontEnabled])


    // - - - - - - - - - - - - - - - - - - - - //
    //               Raccourcis                //
    // - - - - - - - - - - - - - - - - - - - - //
    useEffect(() => {
        const commandPattern = ["Control", "Alt"];
        const shortcuts = [
            { keys: ["t", "T"], trigger: switchDisplayTheme },
            { keys: ["d", "D"], trigger: switchDisplayMode, message: (insert) => <span>Le mode d'affichage a basculé sur <span className="emphasis">{insert}</span> avec succès</span> },
            { keys: ["f", "F"], trigger: toggleFullScreen, message: (insert) => <span>Plein écran <span className="emphasis">{insert ? "activé" : "désactivé"}</span> avec succès</span> },
            { keys: ["m", "M"], trigger: focusAccountSelector },
            { keys: ["ArrowRight"], trigger: () => changePageIdBy(1, location, navigate) },
            { keys: ["ArrowLeft"], trigger: () => changePageIdBy(-1, location, navigate) },
            { keys: ["ArrowUp"], trigger: () => changeAccountIdxBy(-1, location, navigate) },
            { keys: ["ArrowDown"], trigger: () => changeAccountIdxBy(1, location, navigate) },
            { keys: ["1", "&"], trigger: () => navigate(`/app/${activeAccount}/dashboard`) },
            { keys: ["2", "é", "~"], trigger: () => navigate(`/app/${activeAccount}/grades`) },
            { keys: ["3", "#", "\""], trigger: () => navigate(`/app/${activeAccount}/homeworks`) },
            { keys: ["4", "{", "'"], trigger: () => navigate(`/app/${activeAccount}/timetable`) },
            { keys: ["5", "[", "("], trigger: () => navigate(`/app/${activeAccount}/messaging`) },
            { keys: ["6", "|", "-"], trigger: () => navigate(`/app/${activeAccount}/settings`) },
            { keys: ["7", "`", "è"], trigger: () => navigate(`/app/${activeAccount}/account`) },
        ]

        function handleKeyDown(event) {
            function isAskingForShortcut() {
                for (let element of commandPattern) {
                    if (!commandInputs.current.includes(element)) {
                        return false;
                    }
                }
                return true;
            }

            if (commandPattern.includes(event.key) && !commandInputs.current.includes(event.key)) {
                commandInputs.current.push(event.key);
            } else if (isAskingForShortcut()) {
                for (let shortcut of shortcuts) {
                    if (shortcut.keys.includes(event.key)) {
                        event.preventDefault();
                        const value = shortcut.trigger();
                        if (shortcut.message) {
                            createNotification(shortcut.message(value ?? ""))
                        }
                    }
                }
            }
        }

        function handleKeyUp(event) {
            if (commandInputs.current.includes(event.key)) {
                const keyIndex = commandInputs.current.indexOf(event.key)
                commandInputs.current.splice(keyIndex, 1);
            }
        }

        function handleUnfocusing() {
            commandInputs.current = []; // malheureusement j'ai l'impression qu'on peut pas get les touches appuyées à un moment présent dcp je pense que clear c'est le mieux
        }

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
        window.addEventListener("blur", handleUnfocusing)

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener("blur", handleUnfocusing)
        }
    }, [location, navigate, activeAccount]);

    const getSiteMap = (extended) => {
        let siteMap;
        if (isTabletLayout) {
            siteMap = ["grades", "homeworks", "dashboard", "timetable", "messaging"];
        } else {
            siteMap = ["dashboard", "grades", "homeworks", "timetable", "messaging"];
        }

        if (extended ?? false) {
            siteMap = siteMap.concat(["settings", "account"]);
        }

        return siteMap
    }

    // changement de compte
    const changeAccountIdxBy = (delta, location, navigate) => {
        let newActiveAccount = activeAccount;
        newActiveAccount += delta;
        if (newActiveAccount < 0) {
            newActiveAccount = 0;
        } else if (newActiveAccount > accountsList.length - 1) {
            newActiveAccount = accountsList.length - 1;
        }
        switchAccount(newActiveAccount, location, navigate)
    }

    const switchAccount = (value, location, navigate) => {
        const account = value;
        const siteMap = getSiteMap(true);
        const currentLocation = location?.pathname.split("/");
        const activePage = currentLocation[currentLocation.length - 1];
        let pageId = siteMap.indexOf(activePage);
        if (pageId !== -1) {
            // l'utilisateur est pas sur une page du header
            navigate(`/app/${account}/${activePage}`);
        }
        setActiveAccount(account);
    }

    // changement de page
    const changePageIdBy = (delta, location, navigate) => {
        const siteMap = getSiteMap();
        const currentLocation = location?.pathname.split("/");
        const activePage = currentLocation[currentLocation.length - 1];
        let pageId = siteMap.indexOf(activePage);
        if (pageId === -1) {
            // l'utilisateur n'est pas sur une page du header
            pageId = siteMap.indexOf("dashboard");
        } else {
            pageId += delta;
        }
        if (pageId < 0) {
            pageId = 0;
        } else if (pageId >= siteMap.length) {
            pageId = siteMap.length - 1;
        }
        navigate(`/app/${activeAccount}/${siteMap[pageId]}`);
        // document.querySelector("main.content").focus();
    }

    // thème
    const switchDisplayTheme = () => {
        if (displayTheme === "dark") {
            displayTheme.set("light");
            return "clair";
        } else if (displayTheme === "light") {
            displayTheme.set("dark");
            return "sombre";
        } else {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                displayTheme.set("light");
                return "clair";
            } else {
                displayTheme.set("dark");
                return "sombre";
            }
        }
    }

    const updateDisplayTheme = (event) => {
        displayTheme.set(event.target.value);
    }

    // display mode
    const setDisplayMode = (value) => {
        setDisplayModeState(value);
    }

    const switchDisplayMode = () => {
        if (displayMode === "quality") {
            setDisplayMode("performance");
            return "performance";
        } else if (displayMode === "performance") {
            setDisplayMode("balanced");
            return "équilibré";
        } else {
            setDisplayMode("quality");
            return "qualité";
        }
    }

    const updateDisplayMode = (event) => {
        setDisplayMode(event.target.value);
    }

    // full screen
    const toggleFullScreen = () => {
        let fullScreenState;
        setIsFullScreen(oldValue => { fullScreenState = !oldValue; return !oldValue });
        if (fullScreenState) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
        return fullScreenState;
    }

    // focus account selector
    const focusAccountSelector = () => {
        const accountSelector = document.querySelector("#active-account");
        if (accountSelector) {
            accountSelector.focus();
        }
    }

    return (
        <>
            <div id="admin-controls" style={{ position: "fixed", zIndex: "999", top: "0", left: "0" }}>
                {isAdmin && <input type="button" onClick={redirectToLogin} value="LOGIN" />}
                {isAdmin && <input type="button" onClick={redirectToLandingPage} value="LANDING PAGE" />}
                {isAdmin && <input type="button" onClick={redirectToFeedback} value="FEEDBACK" />}
                {isAdmin && <input type="button" onClick={redirectToLab} value="LAB" />}
                {isAdmin && <input type="button" onClick={redirectToMuseum} value="MUSEUM" />}
                {isAdmin && <input type="button" onClick={() => localStorage.clear()} value="CLEAR LS" />}
                {isAdmin && <input type="button" onClick={() => resetUserData(false)} value="RESET USER DATA" />}
                {(!process.env.NODE_ENV || process.env.NODE_ENV === "development") && <input type="button" onClick={fakeLogin} value="LOGIN AS GUEST" style={(!isAdmin ? { opacity: 0.2 } : {})} />}
                {isAdmin && <select title="Display theme" value={displayTheme} name="display-theme" id="display-theme-select" onChange={updateDisplayTheme}>
                    <option value="auto">THEME: AUTO</option>
                    <option value="dark">THEME: DARK</option>
                    <option value="light">THEME: LIGHT</option>
                </select>}
                {isAdmin && <select title="Display mode" value={displayMode} name="display-mode" id="display-mode-select" onChange={updateDisplayMode}>
                    <option value="quality">DISPLAY: QUALITY</option>
                    <option value="balanced">DISPLAY: BALANCED</option>
                    <option value="performance">DISPLAY: PERF</option>
                </select>}
                {isAdmin && <input type="button" onClick={() => { document.documentElement.classList.remove("dark"); document.documentElement.classList.remove("light"); document.documentElement.classList.add("tritanopia") }} value="TRITANOPIA" />}
                {isAdmin && <input type="button" onClick={syncSettings} value="SYNC SETTINGS" />}
                {isAdmin && <input type="button" onClick={() => { createFolderStorage("123test123") }} value="FOLDER" />}
                {isAdmin && <form action="https://docs.google.com/document/d/1eiE_DTuimyt7r9pIe9ST3ppqU9cLYashXm9inhBIC4A/edit" method="get" target="_blank" style={{ display: "inline" }}>
                    <button type="submit" style={{ display: "inline" }}>G DOCS</button>
                </form>}
                {isAdmin && <form action="https://github.com/Magic-Fishes/Ecole-Directe-Plus" method="get" target="_blank" style={{ display: "inline" }}>
                    <button type="submit" style={{ display: "inline" }}>REPO GITHUB</button>
                </form>}
                {isAdmin && <input type="button" onClick={changeFont} value="CHANGE FONT" />}
                {isAdmin && <input type="button" onClick={() => setIsEDPUnblockActuallyInstalled(!isEDPUnblockActuallyInstalled)} value={"EDPU INSTALLED: " + isEDPUnblockActuallyInstalled} />}
                {isAdmin && <input type="button" onClick={handleEdBan} value="EDPU NOTIF" />}
                {/* {isAdmin && <input type="button" onClick={() => { fetchHomeworks((new AbortController()), new Date("2024-05-27")) }} value="FETCH DAY HOMEWORKS" />} */}
                {isAdmin && <input type="button" onClick={() => { setIsAdmin(false) }} value="HIDE CONTROLS" />}
                {(!isAdmin && (!process.env.NODE_ENV || process.env.NODE_ENV === "development")) && <input type="button" onClick={() => { setIsAdmin(true) }} value="-->" style={(!isAdmin ? { opacity: 0.2 } : {})} />}
            </div>
            {/* {isLoggedIn && location.pathname.endsWith("/login") && <Navigate to="/dashboard"/>}
            {isLoggedIn ? "true" : "false"}
            {location.pathname.endsWith("/login") ? "true" : "false"} */}
            {popUp === "newUser" && <WelcomePopUp EDPVersion={EDPVersion} onClose={() => { setIsNewUser(false); localStorage.setItem("EDPVersion", EDPVersion); }} />}
            {popUp === "newEDPVersion" && <PatchNotes EDPVersion={EDPVersion} onClose={() => { setIsNewEDPVersion(false); localStorage.setItem("EDPVersion", EDPVersion); }} />}
            {proxyError && <ProxyErrorNotification />}
            <Outlet />
            {requireDoubleAuth && <DoubleAuthLogin />}
        </>
    );
}