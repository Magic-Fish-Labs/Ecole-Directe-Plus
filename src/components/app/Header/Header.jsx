
import { useState, useRef, useEffect, useContext, Suspense } from "react";
import { Link, useLocation, useNavigate, useParams, Outlet } from "react-router-dom";

import HeaderNavigationButton from "./HeaderNavigationButton";
import AccountSelector from "./AccountSelector";

import EDPLogo from "../../graphics/EDPLogo";
import DashboardIcon from "../../graphics/DashboardIcon";
import HomeworksIconOfficial from "../../graphics/HomeworksIconOfficial";
import GradesIcon from "../../graphics/GradesIcon";
import TimetableIcon from "../../graphics/TimetableIcon";
import MessagingIcon from "../../graphics/MessagingIcon";
import BottomSheet from "../../generic/PopUps/BottomSheet";
import FeedbackForm from "../../Feedback/FeedbackForm";
import PatchNotes from "../../generic/PatchNotes";
import Policy from "../../generic/Policy";

import { EDPVersion } from "../../../utils/constants/configs";

import { AppContext, SettingsContext, UserDataContext } from "../../../App";

import { currentPeriodEvent } from "../../generic/events/setPeriodEvent";
import Snowfall from "../../generic/events/christmas/Snowfall";
import "../../generic/events/christmas/garland.css";

import "./Header.css";


export default function Header({ accountsList, setActiveAccount, activeAccount, carpeConviviale, isLoggedIn, timeline, isFullScreen, isTabletLayout, logout }) {
    const { globalSettings, isStandaloneApp } = useContext(AppContext);

    const userData = useContext(UserDataContext);
    const { notifications } = userData;
    
    const settings = useContext(SettingsContext);
    const { isPartyModeEnabled, isPeriodEventEnabled } = settings.user;

    const isChristmasEventEnabled = isPartyModeEnabled.value && isPeriodEventEnabled.value && currentPeriodEvent

    const navigate = useNavigate();
    const location = useLocation();

    const { userId } = useParams();

    const [easterEggCounter, setEasterEggCounter] = useState(0);
    const [easterEggTimeoutId, setEasterEggTimeoutId] = useState(null);
    const [closeFeedbackBottomSheet, setCloseFeedbackBottomSheet] = useState(false);

    const headerLogoRef = useRef(null);
    // const isFirstFrame = useRef(true);


    const handleUserId = (userId) => {
        if (userId >= 0 && userId < accountsList.length) {
            setActiveAccount(parseInt(userId));
        } else {
            setActiveAccount(parseInt(localStorage.getItem("oldActiveAccount") ?? 0));
        }
    }

    useEffect(() => {
        if (userId !== undefined) {
            handleUserId(parseInt(userId));
        }
    }, [userId]);

    // handle notifications
    useEffect(() => {
        const controller = new AbortController();
        if (isLoggedIn) {
            if (timeline === undefined) {
                userData.get.timeline(controller);
            }
        }

        return () => {
            // console.log("controller.abort")
            controller.abort();
        }
    }, [timeline, isLoggedIn, activeAccount]);


    // if (isFirstFrame.current) {
    //     handleUserId(parseInt(userId));
    //     isFirstFrame.current = false;
    // }

    // - - - Discodo easter egg - - -
    const handleClick = () => {
        if (easterEggTimeoutId !== null) {
            clearTimeout(easterEggTimeoutId);
        }
        setEasterEggCounter((lastValue) => lastValue + 1);
        const REQUIRED_CPS = 2;
        const timeoutId = setTimeout(setEasterEggCounter, 1 / REQUIRED_CPS * 1000, 0);
        setEasterEggTimeoutId(timeoutId);
    }

    useEffect(() => {
        let audio;
        if (easterEggCounter >= 8) {
            // preload the audio to prevent the ping
            const audios = ["/sfx/quick-fart-reverb.mp3", "/sfx/heavy-fart-reverb.mp3"]
            audio = new Audio(audios[Math.floor(Math.random() * 2)]);
        }
        if (easterEggCounter >= 16) {
            setEasterEggCounter(0);
            audio.play();
        }
    }, [easterEggCounter]);
    
    const headerNavigationButtons = [
        {
            enabled: true,
            id: 1,
            name: "dashboard",
            title: "Accueil",
            link: `/app/${activeAccount}/dashboard`,
            icon: <DashboardIcon />,
            notifications: notifications?.dashboard || 0,
            isNew: false
        },
        {
            enabled: accountsList[activeAccount]?.modules?.filter((item) => item.code === "NOTES").map((item) => item.enable).includes(true) ?? true,
            id: 2,
            name: "grades",
            title: "Notes",
            link: `/app/${activeAccount}/grades`,
            icon: <GradesIcon />,
            notifications: notifications?.grades || 0,
            isNew: false
        },
        {
            enabled: accountsList[activeAccount]?.modules?.filter((item) => item.code === "CAHIER_DE_TEXTES").map((item) => item.enable).includes(true) ?? true,
            id: 3,
            name: "homeworks",
            title: "Cahier de texte",
            link: `/app/${activeAccount}/homeworks`,
            icon: <HomeworksIconOfficial />,
            notifications: notifications?.homeworks || 0,
            isNew: false
        },
        {
            enabled: accountsList[activeAccount]?.modules?.filter((item) => item.code === "EDT").map((item) => item.enable).includes(true) ?? true,
            id: 4,
            name: "timetable",
            title: "Emploi du temps",
            link: `/app/${activeAccount}/timetable`,
            icon: <TimetableIcon />,
            notifications: notifications?.timetable || 0,
            isNew: false
        },
        {
            enabled: accountsList[activeAccount]?.modules?.filter((item) => item.code === "MESSAGERIE").map((item) => item.enable).includes(true) ?? true,
            id: 5,
            name: "messaging",
            title: "Messagerie",
            link: `/app/${activeAccount}/messaging`,
            icon: <MessagingIcon />,
            notifications: notifications?.messaging || 0,
            isNew: false
        }
    ];
    // Behavior

    const handleCloseAnchorLinks = () => {
        setCloseFeedbackBottomSheet(false);
        navigate("", { replace: false, relative: "path" });
    }

    // JSX
    return (
        <div id="app">
            {isChristmasEventEnabled && (
                <ul className="lightrope">
                    {Array(150).fill(0).map((_, index) => <li key={index} />)}
                </ul>
            )}
            {!isFullScreen && <div className={`header-container${isStandaloneApp ? " standalone" : ""}`}>
                <header className="header-menu">
                    <div className="header-logo-container">
                        <Link to="dashboard" tabIndex="-1" ref={headerLogoRef} onClick={handleClick}>
                            <EDPLogo id="header-logo" />
                            <div id="version-tag">{globalSettings.isDevChannel.value ? "DEV" : EDPVersion}</div>
                        </Link>
                    </div>

                    <nav className="navbar">
                        <ul className="header-button-list">
                            {headerNavigationButtons.map((headerButton) => (headerButton.enabled &&
                                <li className={`header-button-container`} key={headerButton.id} id={headerButton.name}>
                                    <HeaderNavigationButton className={location.pathname === headerButton.link ? " selected" : ""} link={headerButton.link} icon={headerButton.icon} title={headerButton.title} notifications={headerButton.notifications} isNew={headerButton.isNew} />
                                </li>
                            )
                            )}
                        </ul>
                    </nav>
                    {isTabletLayout === false &&
                        <div className="account-selection">
                            <AccountSelector accountsList={accountsList} activeAccount={activeAccount} setActiveAccount={setActiveAccount} isTabletLayout={isTabletLayout} logout={logout} />
                        </div>
                    }
                </header>
            </div>}

            <main className="content">
                <Suspense>
                    {isTabletLayout === true &&
                        <div className="account-selection">
                            <AccountSelector accountsList={accountsList} activeAccount={activeAccount} setActiveAccount={setActiveAccount} isTabletLayout={isTabletLayout} logout={logout} />
                        </div>
                    }
                    <Outlet />
                </Suspense>
            </main>
            {location.hash === "#feedback" && <BottomSheet className="feedback-bottom-sheet" heading="Faire un retour" onClose={handleCloseAnchorLinks} close={closeFeedbackBottomSheet} ><FeedbackForm activeUser={accountsList[activeAccount]} onSubmit={() => setCloseFeedbackBottomSheet(true)} carpeConviviale={carpeConviviale} /></BottomSheet>}
            {location.hash === "#patch-notes" && <PatchNotes version={EDPVersion} onClose={() => { handleCloseAnchorLinks(); localStorage.setItem("EDPVersion", EDPVersion) }} />}
            {location.hash === "#policy" && <Policy onCloseNavigateURL="#" />}
            {
                isChristmasEventEnabled
                && <Snowfall />
            }
        </div>
    )
}
