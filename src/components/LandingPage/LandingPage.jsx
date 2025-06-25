import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { AppContext, SettingsContext } from "../../App";
import { currentPeriodEvent } from "../generic/events/setPeriodEvent";
import Snowfall from "../generic/events/christmas/Snowfall";
import OutlineEffectDiv from "../generic/CustomDivs/OutlineEffectDiv";

// graphics
import HoverFollowDiv from "../generic/CustomDivs/HoverFollowDiv";
import DiscordFullLogo from "../graphics/DiscordFullLogo";
import EDPLogo from "../graphics/EDPLogo";
import EDPLogoFullWidth from "../graphics/EDPLogoFullWidth";
import EdpuLogo from "../graphics/EdpuLogo";
import GitHubFullLogo from "../graphics/GitHubFullLogo";
import InfoTypoIcon from "../graphics/InfoTypoIcon";
import UpArrow from "../graphics/UpArrow";

import "./LandingPage.css";
import "../generic/events/christmas/snow.css";

export default function LandingPage({ isLoggedIn }) {
    const { isMobileLayout, isTabletLayout, usedDisplayTheme } = useContext(AppContext);
    const settings = useContext(SettingsContext);
    const { displayTheme, displayMode, isPartyModeEnabled, isPeriodEventEnabled } = settings.user;
    const isChristmasEventEnabled = isPartyModeEnabled.value && isPeriodEventEnabled && currentPeriodEvent === "christmas";

    const [isTop, setIsTop] = useState(true);
    const homeSectionRef = useRef(null);
    const communitySectionRef = useRef(null);
    const openSourceSectionRef = useRef(null);

    const location = useLocation();
    const navigate = useNavigate();

    const changeTheme = () => {
        displayTheme.set(usedDisplayTheme === "light" ? "dark" : "light");
    };

    useEffect(() => {
        const observer = new IntersectionObserver((intersections) => {
            for (const intersection of intersections) {
                if (intersection.isIntersecting) {
                    const elementChildren = intersection.target.children
                    const elements = [elementChildren[0], elementChildren[1].children[0], elementChildren[1].children[1]].flat();
                    for (let i = 0; i <= elements.length; ++i) {
                        setTimeout(() => {
                            if (elements[i]) {
                                // elements[i].style.opacity = 1
                                elements[i].classList.toggle("visible", true);
                            }
                        }, i * 200)
                    }
                }
            }
        }, {
            rootMargin: "0px 0px -250px 0px",
            threshold: 0.1,
        })

        if (communitySectionRef.current && openSourceSectionRef.current) {
            observer.observe(communitySectionRef.current);
            observer.observe(openSourceSectionRef.current);
            return () => {
                if (communitySectionRef.current) observer.unobserve(communitySectionRef.current)
                if (openSourceSectionRef.current) observer.unobserve(openSourceSectionRef.current)
            }
        }
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsTop(window.scrollY === 0);
        };
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    useEffect(() => {
        if (!location.hash) {
            navigate("#home", { replace: true });
        }
        const section = document.getElementById(location.hash.slice(1));
        if (section) {
            section.scrollIntoView({ block: (location.hash === "#home" ? "start" : "center") })
        }
    }, [location.hash]);

    useEffect(() => {
        const handleScroll = () => {
            const parallaxItems = document.querySelectorAll(".parallax-item");
            let scrollPosition = window.scrollY;

            parallaxItems.forEach((item) => {
                let speed = item.getAttribute("data-speed");
                let yPos = -(scrollPosition * speed);
                item.style.transform = `translateY(${yPos}px)`;
            });
        };

        document.addEventListener("scroll", handleScroll);

        return () => {
            document.removeEventListener("scroll", handleScroll);
        }

    }, [])

    return (<div className="landing-page">
        {<header id="nav-bar" className="top-section">
            <span className={`nav-logo ${isChristmasEventEnabled ? "snowy-element" : ""}`}>
                <EDPLogo className="landing-logo" id="outside-container" alt="Logo Ecole Directe Plus" />Ecole Directe Plus
            </span>
            {!isTabletLayout && !isMobileLayout && <nav className="nav-links">
                <Link to="#home" className={location.hash === "#home" ? "selected" : ""} replace={true} >Accueil</Link>
                <Link to="#community" className={location.hash === "#community" ? "selected" : ""} replace={true} >Communauté</Link>
                <Link to="#open-source" className={location.hash === "#open-source" ? "selected" : ""} replace={true} >Open-Source</Link>
                <Link to="/edp-unblock" className={location.hash === "#edp-unblock" ? "selected" : ""} >EDP Unblock <EdpuLogo className="edpu-logo" /> </Link>
            </nav>}
            <div className="nav-buttons">
                <Link className={`nav-login ${isChristmasEventEnabled ? "snowy-element" : ""}`} to={isLoggedIn ? "/app" : "/login"}>{isLoggedIn ? "Ouvrir l'app" : "Se connecter"}</Link>
                <button className="change-theme" onClick={changeTheme} />
            </div>
        </header>}
        {
            isChristmasEventEnabled
            && <Snowfall />
        }
        <section id="home" ref={homeSectionRef}>
            <Link to="" className={`go-to-top ${isTop ? "unactive" : "active"}`}><UpArrow className="up-arrow" /></Link>
            <div className="affiliation-disclaimer"> <InfoTypoIcon />Service open source non-affilié à Aplim</div>
            <div className="text-center">
                <h1>Découvrez <strong className="heading-emphasis">Ecole Directe Plus</strong></h1>
                <p>EDP augmente EcoleDirecte, avec une interface moderne et intuitive, enrichie de fonctionnalités exclusives, le tout de façon gratuite, libre et open-source.</p>
                <Link to="/login" className="login-call-to-action">{isLoggedIn ? "Ouvrir l'app" : "Se connecter"}</Link>
            </div>
            <div className="fade-out-image">
                <img src={isTabletLayout ? (isMobileLayout ? `/images/EDP-preview-mobile-${usedDisplayTheme}.jpeg` : `/images/EDP-preview-tablet-${usedDisplayTheme}.jpeg`) : `/images/EDP-preview-${usedDisplayTheme}.jpeg`} className={isTabletLayout ? (isMobileLayout ? "mobile" : "tablet") : "dekstop"} alt="Capture d'écran du site" />
            </div>

        </section>
        <section id="features">
            {(displayMode !== "performance") && <>
                {/* <div className="parallax-item blob1" data-speed="-0.5">
                    <svg className="blob" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path d="M40.6,-32.9C51.8,-18.3,59.7,-1.4,56.8,13.7C53.9,28.9,40.4,42.3,25.3,47.7C10.3,53,-6.3,50.2,-24.2,44C-42.1,37.8,-61.4,28.1,-65.9,13.6C-70.4,-0.9,-60,-20.3,-46.6,-35.4C-33.1,-50.6,-16.5,-61.6,-0.9,-60.9C14.7,-60.1,29.3,-47.6,40.6,-32.9Z" transform="translate(100 100)" />
                    </svg>
                </div> */}
                <div className="parallax-item blob1" data-speed="-0.5">
                    <svg className="blob" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path d="M39.1,-74.1C47.7,-62.7,49.8,-46.3,53.5,-33.2C57.1,-20,62.3,-10,68.1,3.3C73.8,16.6,80.1,33.3,76.6,46.7C73.1,60.1,59.8,70.4,45.4,76.5C31,82.7,15.5,84.9,0,84.9C-15.5,84.9,-31.1,82.8,-37.3,71.9C-43.4,60.9,-40.3,41.2,-40.2,27.7C-40.2,14.3,-43.2,7.1,-47.5,-2.5C-51.7,-12.1,-57.2,-24.1,-55.1,-33.9C-53,-43.7,-43.5,-51.1,-33,-61.5C-22.6,-71.9,-11.3,-85.2,2,-88.6C15.2,-92,30.4,-85.5,39.1,-74.1Z" transform="translate(100 100)" />
                    </svg>
                </div>
                <div className="parallax-item blob2" data-speed="-0.2">
                    <svg className="blob" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path d="M29.7,-50.1C43.4,-43.6,62.8,-45.5,68.6,-38.6C74.3,-31.6,66.4,-15.8,65.5,-0.5C64.6,14.8,70.6,29.5,64.4,35.7C58.3,41.9,39.8,39.5,27.1,38.5C14.3,37.5,7.1,38,-3.7,44.4C-14.5,50.8,-29.1,63.2,-35.3,60.4C-41.4,57.5,-39.2,39.4,-45.3,26.8C-51.5,14.2,-66.1,7.1,-68,-1.1C-69.8,-9.2,-58.8,-18.4,-47.8,-22.7C-36.8,-26.9,-25.7,-26.1,-17.7,-35.8C-9.7,-45.6,-4.9,-66,1.6,-68.7C8,-71.4,16,-56.5,29.7,-50.1Z" transform="translate(100 100)" />
                    </svg>
                </div>
                {/* <div className="parallax-item blob2" data-speed="-0.2">
                    <svg className="blob" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path d="M60.2,-52.7C69.5,-36.4,62.7,-11.8,55.3,9.4C47.9,30.7,40,48.7,26.4,55.5C12.7,62.4,-6.6,58.1,-18.9,48.6C-31.2,39.1,-36.5,24.3,-39.2,9.8C-41.8,-4.8,-41.8,-19,-34.8,-34.9C-27.9,-50.7,-13.9,-68.1,5.8,-72.7C25.5,-77.3,50.9,-69.1,60.2,-52.7Z" transform="translate(100 100)" />
                    </svg>
                </div> */}
            </>}
            <div id="bento" className="text-center">
                <h2 className="section-title">Une multitude de <br /><strong className="heading-emphasis">fonctionnalités inédites</strong></h2>
                <div className="bento-grid">
                    <HoverFollowDiv displayMode={displayMode} className="bento-card div1">
                        <OutlineEffectDiv className="bento-outline-effect">
                            <h4>Points forts</h4>
                            <p>Découvrez vos talents cachés grâce à un aperçu rapide de vos points forts. Parce que vous méritez de savoir à quel point vous êtes incroyable, nous mettons en lumière les matières dans lesquelles vous excellez.</p>
                        </OutlineEffectDiv>


                    </HoverFollowDiv>
                    <HoverFollowDiv displayMode={displayMode} className="bento-card div2">
                        <OutlineEffectDiv className="bento-outline-effect">
                            <h4>Calcul automatique et instantané des moyennes</h4>
                            <p>Fini les calculs laborieux à la main. EDP fait tout le boulot pour vous. Parce que votre temps est précieux et doit être consacré à des choses plus importantes, comme procrastiner efficacement.</p>
                        </OutlineEffectDiv>


                    </HoverFollowDiv>
                    <HoverFollowDiv displayMode={displayMode} className="bento-card div3">
                        <OutlineEffectDiv className="bento-outline-effect">
                            <div>
                                <h4>Thème de couleur</h4>
                                <p>Choisissez votre camp : clair comme le jour ou sombre comme votre âme. Passez du mode Clair au mode Sombre en un clic et offrez à vos yeux le repos qu'ils méritent. Parce que même votre interface se doit d'avoir du style.</p>
                            </div>
                            {/* <div className="theme-buttons">
                                <button onClick={() => theme.set("light")} className={theme.get() == "light" ? "activated" : ""}>
                                    <SunIcon />
                                </button>
                                <button onClick={() => theme.set("dark")} className={theme.get() == "dark" ? "activated" : ""}>
                                    <MoonIcon />
                                </button>
                            </div> */}
                        </OutlineEffectDiv>

                    </HoverFollowDiv>
                    <HoverFollowDiv displayMode={displayMode} className="bento-card div4">
                        <OutlineEffectDiv className="bento-outline-effect">
                            <h4>Dernières notes</h4>
                            <p>Un coup d'œil et vous saurez tout. Avec l'aperçu rapide des dernières notes, regarder vos résultats en vif pendant l'intercours sera plus rapide que la formule 1 de Max Verstappen.</p>
                        </OutlineEffectDiv>

                    </HoverFollowDiv>
                    <HoverFollowDiv displayMode={displayMode} className="bento-card div5">
                        <OutlineEffectDiv className="bento-outline-effect">
                            <h4>Score de Streak</h4>
                            <p>Atteignez le nirvana académique avec le Score de streak. Surpassez vous, cumulez les bonnes notes et débloquez des badges ! N'hésitez pas à flex quand vous avez une meilleure streak que vos amis.</p>
                        </OutlineEffectDiv>


                    </HoverFollowDiv>
                    <HoverFollowDiv displayMode={displayMode} className="bento-card div6">
                        <OutlineEffectDiv className="bento-outline-effect">
                            <h4>Contrôles à venir</h4>
                            <p>Restez aux aguets avec l'aperçu des prochains contrôles. Anticipez les futurs contrôles et organisez vos révisions comme un pro. Enfin, en théorie… on ne peut pas vous garantir que vous ne procrastinerez pas quand même.</p>
                        </OutlineEffectDiv>


                    </HoverFollowDiv>
                    <HoverFollowDiv displayMode={displayMode} className="bento-card div7">
                        <OutlineEffectDiv className="bento-outline-effect">
                            <h4>Sécurité et confidentialité</h4>
                            <p>Votre sécurité, notre priorité, parce qu’il n’y a que vous et votre conscience qui devez connaître vos petits secrets académiques. EDP ne collecte AUCUNE information personnelle ou personnellement identifiable sur les utilisateurs du service. En tant que service non-affilié à Aplim, nous utilisons l'API d'EcoleDirecte pour que vous ayez accès à vos informations.</p>
                        </OutlineEffectDiv>


                    </HoverFollowDiv>
                </div>
            </div>
        </section>
        <section id="community" className="floating-section" ref={communitySectionRef}>
            <h2 className="section-title">Une communauté <strong className="heading-emphasis">passionnée</strong> et <strong className="heading-emphasis">bienveillante</strong></h2>
            <div>
                <a href="https://discord.gg/AKAqXfTgvE" target="_blank"><DiscordFullLogo /></a>
                <p>Rejoignez notre <a href="https://discord.gg/AKAqXfTgvE" target="_blank"><strong>serveur Discord</strong></a> !<br />Vous pourrez y rencontrer les développeurs et discuter avec les membres les plus investis d'Ecole Directe Plus !</p>
            </div>
        </section>
        <section id="open-source" className="floating-section" ref={openSourceSectionRef}>
            <h2 className="section-title">Un projet développé <strong className="heading-emphasis">par des élèves</strong>, <strong className="heading-emphasis">pour les élèves</strong></h2>
            <div>
                <p>EDP est un projet open source distribué sous licence MIT, n'importe qui peut participer !<br />Nous partageons en toute transparence le code source d'EDP sur notre <a href="https://github.com/Magic-Fishes/Ecole-Directe-Plus" target="_blank"><strong>dépôt GitHub</strong></a>. Ainsi, n'importe qui peut contribuer au projet, rapporter des bugs, ou auditer le code à la recherche de failles. C'est une garantie de sécurité, de fiabilité et de résilience.</p>
                <a href="https://github.com/Magic-Fishes/Ecole-Directe-Plus" target="_blank"><GitHubFullLogo /></a>
            </div>
        </section>
        <div className="last-call-to-action">
            <OutlineEffectDiv>
                <h3>Prêt à basculer sur Ecole Directe Plus ?</h3>
                <p>Il vous suffit d'identifiants EcoleDirecte</p>
                <Link to="/login" className="login-call-to-action">{isLoggedIn ? "Ouvrir l'app" : "Se connecter"}</Link>
            </OutlineEffectDiv>
        </div>
        <footer>
            <EDPLogoFullWidth className="footer-logo" />
            <ul className="sitemap">
                <li><Link to="/login">Connexion</Link></li>
                <li><Link to="/login#policy">Confidentialité</Link></li>
                <li><Link to="/login#policy">Conditions d'utilisation</Link></li>
                <li><Link to="/feedback">Faire un retour</Link></li>
                <li><Link to="/app/dashboard" tabIndex={isLoggedIn ? "0" : "-1"}>Tableau de bord</Link></li>
                <li><Link to="/app/grades" tabIndex={isLoggedIn ? "0" : "-1"}>Notes</Link></li>
                <li><Link to="/app/homeworks" tabIndex={isLoggedIn ? "0" : "-1"}>Cahier de texte</Link></li>
                <li><Link to="/app/timetable" tabIndex={isLoggedIn ? "0" : "-1"}>Emploi du temps</Link></li>
                <li><Link to="/app/messaging" tabIndex={isLoggedIn ? "0" : "-1"}>Messagerie</Link></li>
                <li><Link to="/app/settings" tabIndex={isLoggedIn ? "0" : "-1"}>Paramètres</Link></li>
                <li><Link to="/app/account" tabIndex={isLoggedIn ? "0" : "-1"}>Compte</Link></li>
                <li><Link to="/edp-unblock">EDP Unblock</Link></li>
            </ul>

        </footer>
    </div>);
}
