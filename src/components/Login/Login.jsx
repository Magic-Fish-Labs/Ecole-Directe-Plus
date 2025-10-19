import { Link, Outlet, useLocation, Navigate } from "react-router-dom";
import EDPVersionButton from "../generic/buttons/EDPVersionButton";
import Policy from "../generic/Policy";
import LoginForm from "./LoginForm";
import InfoButton from "../generic/Informative/InfoButton";
import DiscordLink from "../generic/buttons/DiscordLink";
import GithubLink from "../generic/buttons/GithubLink";

import EDPLogo from "../graphics/EDPLogo";
import EDPLogoFullWidth from "../graphics/EDPLogoFullWidth";

import "./Login.css";
import ExtensionIcon from "../graphics/ExtensionIcon";

const today = new Date;
const april = (today.getMonth() === 3) && (today.getDate() < 2)

if (april) {
    import("./april.css").then((_) => {
        console.log("April fools styles loaded");
    })
}

export default function Login({ logout, isEDPUnblockInstalledActuallyInstalled }) {
    const location = useLocation();

    if (localStorage.userSettings) {
        if (((JSON.parse(localStorage.userSettings)[0].displayTheme) !== "dark") && april) {
            document.body.style.backgroundColor = "white";
        } else {
            document.body.style.backgroundColor = "";
        }
    }

    // JSX
    return (
        <div id="login">
            <Link to="/">
                <EDPLogoFullWidth className="login-logo" id="outside-container" alt="Logo Ecole Directe Plus" />
            </Link>
            {!isEDPUnblockInstalledActuallyInstalled
                ? <Link to="/edp-unblock" id="edp-unblock-ad">
                    <ExtensionIcon className="extension-icon" />
                    <span>Installez l'extension EDP Unblock pour accéder en continu à Ecole Directe Plus ! <span className="edpu-explanation">Ecole Directe Plus a besoin de son extension pour accéder au contenu fourni par l’API d’EcoleDirecte.</span></span>
                    <span to="/edp-unblock#about">En savoir plus</span>
                </Link>
                : null
            }
            <span className="login-social">
                <DiscordLink />
                <GithubLink />
            </span>
            <div className="login-box">
                <EDPLogo className="login-logo" id="inside-container" alt="Logo Ecole Directe Plus" />
                <InfoButton>Pour vous connecter, utilisez vos identifiants EcoleDirecte</InfoButton>
                <h1>Connexion</h1>
                <LoginForm logout={logout} />
            </div>
            <p className="not-affiliated-mention">
                Service non-affilié à Aplim
            </p>
            <p className="policy">
                En vous connectant, vous confirmez avoir lu et accepté notre <Link to="#policy" replace={true} className="policy-link" id="legal-notice">Politique de confidentialité et Conditions d'utilisation</Link>.
            </p>
            {location.hash === "#policy" && <Policy onCloseNavigateURL={""} />}
            <EDPVersionButton />
            <Navigate />
            <Outlet />
        </div>
    );
}