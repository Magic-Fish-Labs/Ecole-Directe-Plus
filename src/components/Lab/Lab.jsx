
import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DropDownMenu from "../generic/UserInputs/DropDownMenu";
import Button from "../generic/UserInputs/Button";
import ScrollShadedDiv from "../generic/CustomDivs/ScrollShadedDiv";
import EDPLogo from "../graphics/EDPLogo"
import BottomSheet from "../generic/PopUps/BottomSheet";
import HeaderNavigationButton from "../app/Header/HeaderNavigationButton";
import AccountIconMain from "../graphics/AccountIcon";
import { Tooltip, TooltipTrigger, TooltipContent } from "../generic/PopUps/Tooltip";
import KeyboardKey from "../generic/KeyboardKey";
import AppLoading from "../generic/Loading/AppLoading";
import ShiningDiv from "../generic/CustomDivs/ShiningDiv";
import Star from "../graphics/Star";
import WalkingCanardman from "../graphics/WalkingCanardman"
import { useCreateNotification } from "../generic/PopUps/Notification"
import StoreCallToAction from "../generic/StoreCallToAction"
import {
    BadgePlusInfo,
    BadgeStarInfo,
    BadgeCheckInfo,
    BadgeStonkInfo,
    BadgeStreakInfo,
    BadgeMehInfo,
} from "../generic/badges/BadgeInfo"
import HolographicDiv from "../generic/CustomDivs/HolographicDiv"
import InfoPopUp from "../generic/PopUps/InfoPopUp";
import PopUp from "../generic/PopUps/PopUp";
import NumberInput from "../generic/UserInputs/NumberInput";

import ProxyErrorNotification from "../Errors/ProxyErrorNotification";

import "./Lab.css";
import RadioButton from "../generic/UserInputs/RadioButton";
import ToggleSwitch from "../generic/UserInputs/ToggleSwitch";
import { getBrowser, getOS } from "../../utils/utils";
import TextInput from "../generic/UserInputs/TextInput";
import { clearHTML } from "../../utils/html";
import EncodedHTMLDiv from "../generic/CustomDivs/EncodedHTMLDiv";
import { textToHSL } from "../../utils/utils"
import DefaultFileIcon from "../graphics/file/DefaultFileIcon"
import OutlineEffectDiv from "../generic/CustomDivs/OutlineEffectDiv";
import useInitializer from "../../EcoleDirecteHandlerCore/hooks/utils/useInitializer";
import { BrowserLabels, OperatingSystemLabels } from "../../utils/constants/constants";
import LinkableButton from "../generic/buttons/LinkableButton";
import { AppContext, UserDataContext } from "../../App";

const subjectArray = [
    "FRANC",
    "MATHS",
    "AGL1",
    "ESP2",
    "HIGEO",
    "SCIEN",
    "PH-CH",
    "SVT",
    "TECHN",
    "HIGCV",
    "EPS",
    "EDMUS",
    "A-PLA",
    "OR",
];

export default function Lab({ fetchGrades }) {
    const { usedDisplayTheme } = useContext(AppContext);
    // const userData = useContext(UserDataContext);
    // const {
    //     grades: {value: grades}
    // } = userData;
    // const subjectArray = Object.keys(Object.values(grades)[0].subjects);
    // console.log(JSON.stringify(subjectArray));
    const addNotification = useCreateNotification()
    // States
    const [jsp, rerenderer] = useState(0);
    const [test, setTest] = useState(["Signaler un bug", "Suggestion", "Retour d'expérience", "Autre", "Celui qui ne se souvient pas du passé est condamné à le répéter.", "option1", "option2", "option3", "option4", "option5", "option6", "option7", "option8", "option10 OH non j'ai oublié option9"]);
    const [test2, setTest2] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const [testState, setTestState] = useState(false);
    const [initializer, setInitializer] = useInitializer("StartValue", "defaultValue", (old, newValue) => { console.log("state has been initialized to", newValue); return newValue });

    const [isInputPopUpOpen, setIsInputPopUpOpen] = useState(false);
    const [number1, setNumber1] = useState(0)
    const [isInputPopUp2Open, setIsInputPopUp2Open] = useState(false);
    const [number2, setNumber2] = useState(0)
    const [formNumber2, setFormNumber2] = useState(0)
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [displayProxyErrorNotification, setDisplayProxyErrorNotification] = useState(false);
    const [toggleSwitchState, setToggleSwitchState] = useState(false)
    const [targetURL, setTargetURL] = useState("");
    const [testHash, setTestHash] = useState("");
    const [fileExtension, setFileExtension] = useState("PNG");
    const [linkableButton1, setLinkableButton1] = useState(0);
    const [linkableButton2, setLinkableButton2] = useState(0);
    const [colorSeed, setColorSeed] = useState("");
    const [colorSeedVIMax, setColorSeedVIMax] = useState(32);
    const [colorSeedVIMin, setColorSeedVIMin] = useState(52);
    const [colorSeedVLMax, setColorSeedVLMax] = useState(63);
    const [colorSeedVLMin, setColorSeedVLMin] = useState(83);

    const initialTestState2 = {
        a: {
            b: "123"
        },
        b: 123
    }
    const [testState2, setTestState2] = useState(initialTestState2);
    const navigate = useNavigate();

    // Behavior
    useEffect(() => {
        // document.title = "Ecole Directe Plus • Lab";
        // document.title = "EDP Lab";
        document.title = "Lab • Ecole Directe Plus";
    }, []);


    function testOnChange(a) {
        setTest2(a)
    }

    function customNavigate(url) {
        navigate(url);
    }

    const testHSLValues = textToHSL(testHash)
    // JSX
    return (
        <div id="lab-page">
            <h1 id="lab-page-heading">Lab</h1>
            {/* Insérer élément à test ici */}
            <h3>Drop Down Menu</h3>
            <DropDownMenu name="feedback-type-choice" options={test} selected={test2} onChange={testOnChange} />
            <h3>Scroll Shaded Div</h3>
            <ScrollShadedDiv id="scroll-shaded-div">
                <ul>
                    <li>Lorem ipsum dolor sit amet</li>
                    <li>Consectetur adipiscing elit</li>
                    <li>Sed do eiusmod tempor incididunt</li>
                    <li>Ut labore et dolore magna aliqua</li>
                    <li>Ut enim ad minim veniam</li>
                    <li>Quis nostrud exercitation ullamco</li>
                    <li>Laboris nisi ut aliquip ex ea commodo consequat</li>
                    <li>Duis aute irure dolor in reprehenderit</li>
                    <li>Voluptate velit esse cillum dolore</li>
                    <li>Eu fugiat nulla pariatur</li>
                    <li>Excepteur sint occaecat cupidatat non proident</li>
                    <li>Sunt in culpa qui officia deserunt mollit</li>
                    <li>Anim id est laborum</li>
                    <li>Lorem ipsum dolor sit amet</li>
                    <li>Consectetur adipiscing elit</li>
                    <li>Sed do eiusmod tempor incididunt</li>
                    <li>Ut labore et dolore magna aliqua</li>
                    <li>Ut enim ad minim veniam</li>
                    <li>Quis nostrud exercitation ullamco</li>
                    <li>Laboris nisi ut aliquip ex ea commodo consequat</li>
                    <li>Duis aute irure dolor in reprehenderit</li>
                    <li>Voluptate velit esse cillum dolore</li>
                    <li>Eu fugiat nulla pariatur</li>
                    <li>Excepteur sint occaecat cupidatat non proident</li>
                    <li>Sunt in culpa qui officia deserunt mollit</li>
                    <li>Anim id est laborum</li>
                </ul>
            </ScrollShadedDiv>
            <h3>Avertissement de sécurité</h3>
            <Button value="! DANGER !" onClick={() => { setIsOpen(true) }} />
            {isOpen && <InfoPopUp type="warning" header="Avertissement de sécurité" subHeader="Veuillez lire attentivement" contentTitle="Rester connecté, un danger ?" onClose={() => { setIsOpen(false) }} >
                <div>
                    <p>La fonctionnalité "rester connecté" peut présenter des failles de sécurité dans certaines circonstances. Nous souhaitons attirer votre attention sur ces éventuels dangers afin que vous puissiez prendre une décision éclairée concernant l'activation de cette fonctionnalité :</p>
                    <ol>
                        <li>D'abord, il est impératif de noter que vos identifiants sont stockés exclusivement sur votre propre appareil. Cela implique donc que nous ne conservons pas vos informations d'identification sur un serveur distant. Ainsi, toute violation de vos données est dûe à une vulnérabilité de l'appareil lui-même.</li>
                        <li>Quels sont les facteurs à risque ? En surfant sur la vaste toile kaléidoscopique que représente internet, vous vous exposez à de nombreux dangers : virus, ammeçonnage, rançongiciel... Au cours de votre navigation, il est possible que vous installiez involontairement de tels logiciels malveillants, rendant vos données personnelles vulnérables. Parmi ces données, vos informations d'identification Ecole Directe Plus, si vous choisissez de rester connecté.</li>
                        <li>Par conséquent, si votre appareil n'est pas infecté par un tel malware, vos données personnelles sont en sécurité et vous pouvez activer l'option "rester connecté", toutefois, si vous pensez être infecté ou êtes inquiet à l'égard de vos données, il est préférable de désactiver cette option.</li>
                        <li>Il convient de noter que les risques associés à une telle attaque sont généralement très limités, notamment sur smartphone et tablette. De plus, l'activation de la fonction "rester connecté" est entièrement à la discrétion de l'utilisateur, Ecole Directe Plus déclinant toute responsabilité en cas de fuite de données.</li>
                    </ol>
                    <p>En somme, si vous êtes un utilisateur éclairé et maniez avec dextérité la langue de turing, vous pouvez assurément activer "rester connecté". Si ce n'est pas le cas cependant, il est peut-être préférable de sacrifier un peu d'expérience utilisateur au profit de la garantie de la sécurité de votre compte</p>
                    <p>Chez Ecole Directe Plus, la transparence et la confiance que l'on entretient avec nos utilisateurs est une priorité.</p>
                </div>
            </InfoPopUp>}
            <h3>BottomSheet vide</h3>
            <Button value="Open BottomSheet" onClick={() => { setIsBottomSheetOpen(true) }} />
            {isBottomSheetOpen && <BottomSheet heading="prout" onClose={() => setIsBottomSheetOpen(false)}>
                <h4>Yo les rBG</h4>
                <p>ça n'a ni queue ni tête</p>
                <p>Les roues adhèrent au bitume comme les bigorneaux adhèrent aux rochers</p>
                <Tooltip>
                    <TooltipTrigger>Tooltipipi</TooltipTrigger>
                    <TooltipContent>Conifère</TooltipContent>
                </Tooltip>
            </BottomSheet>}
            <h3>Kaléidoscope hypnotique du sharingan</h3>
            <div id="test">
                aaa
                <div id="testcancer">
                    bbb
                </div>
            </div>
            <h3>Tooltip fractalisée</h3>
            <div tabIndex={1}>
                <Tooltip tabIndex="-1" id="lab-tooltip">
                    <TooltipTrigger>
                        Fractal Tooltip
                    </TooltipTrigger>
                    <TooltipContent>
                        <Tooltip>
                            <TooltipTrigger>
                                Fractal Tooltip 1
                            </TooltipTrigger>
                            <TooltipContent>
                                <Tooltip>
                                    <TooltipTrigger>
                                        Fractal Tooltip 2
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                Fractal Tooltip 3
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        Fractal Tooltip 4
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                Fractal Tooltip 5
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                Fractal Tooltip END
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipContent>
                </Tooltip>
            </div>
            <h3>HeaderNavigationButton</h3>
            <HeaderNavigationButton link="/login" label="login" icon={<AccountIconMain />} />
            <h3>Fetch function</h3>
            <Button value="Grades" onClick={fetchGrades} />
            <h3 id="keyboard-key">KeyboardKey</h3>
            <KeyboardKey keyName="a">a</KeyboardKey> <KeyboardKey keyName="z">z</KeyboardKey> <KeyboardKey keyName="e">e</KeyboardKey> <KeyboardKey keyName="r">r</KeyboardKey> <KeyboardKey keyName="t">t</KeyboardKey> <KeyboardKey keyName="y">y</KeyboardKey> <KeyboardKey keyName="Control">Crtl</KeyboardKey>  <KeyboardKey keyName="Shift">Shift</KeyboardKey>
            <br />
            <KeyboardKey keyName="Enter">Entrer</KeyboardKey>
            <br />
            <KeyboardKey keyName="*">Cyberpunk+minecraft:blowjob69</KeyboardKey>
            <br />
            <KeyboardKey keyName="Tab">Tab</KeyboardKey>
            <br />
            <KeyboardKey keyName="AltGraph">Alt gr</KeyboardKey>
            <h3 id="lab-app-loading">AppLoading</h3>
            <AppLoading EDPVersion={"0.6.9"} />
            <h3>ShiningDiv</h3>
            {/* Juste prcq le border radius de l'écran de mon tel m'empêche de tout voir bien*/}
            <div id="shining-test">
                <ShiningDiv id="shining-div-test" shiningIconsList={[Star]} growSize={15}>
                    <p>Ca se voit Saumon est un véritable stoïcien doté d'une rigueur militaire qui lui permet de monter des projets avant-gardistes afin de collecter des richesses dont il fait don à 99% par pure charité et amour de son prochain</p>
                </ShiningDiv>
            </div>
            <h3>Notifications</h3>
            <div>
                <Button value="New notification" onClick={() => { addNotification(<h1>NOTIFICATION TRÈS PERTINENTE</h1>) }} />
            </div>
            <h3>StoreCallToAction</h3>
            <div id="store-call-to-action">
                <StoreCallToAction companyLogoSrc="/images/apple-logo.svg" companyLogoAlt="Logo de Apple" targetURL="https://youtu.be/uHgt8giw1LY" />
                <StoreCallToAction companyLogoSrc="/images/google-logo.svg" companyLogoAlt="Logo de Google" targetURL="https://youtu.be/uHgt8giw1LY" />
                <StoreCallToAction companyLogoSrc="/images/microsoft-logo.svg" companyLogoAlt="Logo de Microsoft" targetURL="https://youtu.be/uHgt8giw1LY" />
            </div>
            {/* <h3>GameOfLife</h3>
            <canvas id="gameOfLife"></canvas> */}
            <script src="./GoL.js"></script>
            <h3>Badges</h3>
            <div style={{ display: "flex", justifyContent: "space-evenly" }}>
                <BadgeStarInfo />
                <BadgePlusInfo />
                <BadgeCheckInfo />
                <BadgeStonkInfo />
                <BadgeStreakInfo />
                <BadgeMehInfo />
            </div>

            <h3>HolographicDiv</h3>
            <HolographicDiv style={{ width: "500px", height: "800px", margin: "0 auto", marginBottom: "50px", border: "1px solid rgb(27, 31, 58)", borderRadius: "48px", background: "url('http://allyourhtml.club/carousel/image.webp') center / 80%" }}>
            </HolographicDiv>

            <HolographicDiv style={{ width: "800px", height: "500px", margin: "0 auto", border: "2px solid rgb(27, 31, 58)", borderRadius: "48px", backgroundColor: "rgba(var(--background-color-0), 1)" }}>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Saepe aut illo aliquam accusantium assumenda ducimus nostrum dolorum, ratione enim ut esse perferendis omnis fugiat officiis repudiandae necessitatibus perspiciatis deserunt facilis vero possimus? Consectetur magnam amet similique est, dolorum magni reprehenderit.</p>
            </HolographicDiv>

            <div style={{ height: "100px" }}></div>

            <h3>New PopUp</h3>
            <Button onClick={() => { setIsInputPopUpOpen(true) }} value="number1" />
            {isInputPopUpOpen && <PopUp onClose={() => { setIsInputPopUpOpen(false) }}>
                <NumberInput min={0} max={20} value={number1} onChange={setNumber1} step={0.1} />
            </PopUp>}
            {number1}


            <Button onClick={() => { setIsInputPopUp2Open(true) }} value="number2" />
            {isInputPopUp2Open && <PopUp onClose={() => { setIsInputPopUp2Open(false); setIsFormSubmitted(false) }} externalClosing={isFormSubmitted}>
                <form onSubmit={(event) => { event.preventDefault(); setNumber2(formNumber2); setIsFormSubmitted(true) }}>
                    <NumberInput min={0} max={20} value={formNumber2} onChange={setFormNumber2} />
                    <Button type="submit" />
                </form>
            </PopUp>}

            <h3>ProxyErrorNotification</h3>
            <Button onClick={() => setDisplayProxyErrorNotification((v) => !v)}>Display ProxyErrorNotification</Button>
            {displayProxyErrorNotification && <ProxyErrorNotification />}

            <h3>RadioButtons</h3>
            <div className="radio-buttons-test">
                <RadioButton id="dilemme-cornelien-1" name="dilemme">Choix 1</RadioButton>
                <RadioButton id="dilemme-cornelien-2" name="dilemme">Choix 2</RadioButton>
                <RadioButton id="dilemme-cornelien-3" name="dilemme">Choix 3</RadioButton>
                <RadioButton id="dilemme-cornelien-4" name="dilemme">Choix 4</RadioButton>
                <RadioButton id="dilemme-cornelien-5" name="dilemme">Choix 5</RadioButton>
                <RadioButton id="dilemme-cornelien-6" name="dilemme">Choix 6</RadioButton>
                <RadioButton id="dilemme-cornelien-7" name="dilemme">Choix 7</RadioButton>
                <RadioButton id="dilemme-cornelien-8" name="dilemme">Choix 8</RadioButton>
                <RadioButton id="dilemme-cornelien-9" name="dilemme">Choix 9</RadioButton>
                <RadioButton id="dilemme-cornelien-10" name="dilemme">Choix 10</RadioButton>
                <RadioButton id="dilemme-cornelien-11" name="dilemme">Choix 11</RadioButton>
                <RadioButton id="dilemme-cornelien-12" name="dilemme">Choix 12</RadioButton>
            </div>

            <h3>TOGGLE SWITCH</h3>
            <p>{toggleSwitchState ? "true" : "false"}</p>
            <ToggleSwitch value={toggleSwitchState} onChange={(value) => setToggleSwitchState(!value)} />

            <h2>OS - BROWSER</h2>
            <p>userOs: {OperatingSystemLabels[getOS()]}</p>
            <p>userBrowser: {BrowserLabels[getBrowser()]}</p>

            <h3>Dynamic navigate</h3>
            <TextInput textType="text" placeholder="Target url" value={targetURL} onChange={(e) => setTargetURL(e.target.value)} />
            <Button onClick={() => customNavigate(targetURL)}>Navigate to {targetURL}</Button>

            <h3>clearHTML</h3>
            <h4>Vanilla:</h4>
            <p className="inner-html-test" dangerouslySetInnerHTML={{
                __html: clearHTML(`PHA+PHNwYW4gc3R5bGU9ImZvbnQtc2l6ZToxOHB4Ij48c3BhbiBzdHlsZT0iY29sb3I6IzI5ODBiOSI+Qm9uam91ciAmYWdyYXZlOyB0b3VzLDwvc3Bhbj48L3NwYW4+PC9wPgoKPHA+PHNwYW4gc3R5bGU9ImZvbnQtc2l6ZToxOHB4Ij48c3BhbiBzdHlsZT0iY29sb3I6IzI5ODBiOSI+TWVyY3JlZGkgMTQgZiZlYWN1dGU7dnJpZXIgYXVyYSBsaWV1ICZhZ3JhdmU7IDEwaDEwIGxhIG1lc3NlIGRlcyBDZW5kcmVzLiBOb3VzIG5vdXMgcmV0cm91dmVyb25zICZhZ3JhdmU7IGxhIGNoYXBlbGxlLiA8L3NwYW4+PC9zcGFuPjwvcD4KCjxwPjxzcGFuIHN0eWxlPSJmb250LXNpemU6MThweCI+PHNwYW4gc3R5bGU9ImNvbG9yOiMyOTgwYjkiPkxlIG1lcmNyZWRpIGRlcyBDZW5kcmVzIGVzdCBsZSBqb3VyIG8mdWdyYXZlOyBkZXMgY2hyJmVhY3V0ZTt0aWVucyBlbnRyZW50IGRhbnMgbGUgY2FyJmVjaXJjO21lLiA8L3NwYW4+PC9zcGFuPjwvcD4KCjxwPjxzcGFuIHN0eWxlPSJmb250LXNpemU6MThweCI+PHNwYW4gc3R5bGU9ImNvbG9yOiMyOTgwYjkiPlNpIHZvdXMgdm91cyBzb3VoYWl0ZXogeSBwYXJ0aWNpcGVyLCA8c3Ryb25nPm1lcmNpIGRlIHZvdXMgaW5zY3JpcmUgYXZhbnQgbGUgbWFyZGkgMTMgJmFncmF2ZTsgMThoPC9zdHJvbmc+LCBhdXByJmVncmF2ZTtzIGRlIE1tZSBYWFhYWCBvdSBhdXByJmVncmF2ZTtzIGRlIG1vaS1tJmVjaXJjO21lKiAoZGlyZWN0ZW1lbnQgb3UgZW4gciZlYWN1dGU7cG9uZGFudCAmYWdyYXZlOyBjZSBtYWlsKS48L3NwYW4+PC9zcGFuPjwvcD4KCjxwPjxzcGFuIHN0eWxlPSJmb250LXNpemU6MThweCI+PHNwYW4gc3R5bGU9ImNvbG9yOiMyOTgwYjkiPkJvbm5lIGpvdXJuJmVhY3V0ZTtlICZhZ3JhdmU7IHRvdXMsPC9zcGFuPjwvc3Bhbj48L3A+Cgo8cD4qSmUgc3VpcyBhYnNlbnQgcG91ciBmb3JtYXRpb24gbHVuZGkgZXQgbWFyZGkgMTIgZXQgMTMgZiZlYWN1dGU7dnJpZXIuPC9wPg==`)
            }}></p>
            <br />
            <h4>Contrasts improved:</h4>
            <EncodedHTMLDiv className="inner-html-test">{`PHA+PHNwYW4gc3R5bGU9ImZvbnQtc2l6ZToxOHB4Ij48c3BhbiBzdHlsZT0iY29sb3I6IzI5ODBiOSI+Qm9uam91ciAmYWdyYXZlOyB0b3VzLDwvc3Bhbj48L3NwYW4+PC9wPgoKPHA+PHNwYW4gc3R5bGU9ImZvbnQtc2l6ZToxOHB4Ij48c3BhbiBzdHlsZT0iY29sb3I6IzI5ODBiOSI+TWVyY3JlZGkgMTQgZiZlYWN1dGU7dnJpZXIgYXVyYSBsaWV1ICZhZ3JhdmU7IDEwaDEwIGxhIG1lc3NlIGRlcyBDZW5kcmVzLiBOb3VzIG5vdXMgcmV0cm91dmVyb25zICZhZ3JhdmU7IGxhIGNoYXBlbGxlLiA8L3NwYW4+PC9zcGFuPjwvcD4KCjxwPjxzcGFuIHN0eWxlPSJmb250LXNpemU6MThweCI+PHNwYW4gc3R5bGU9ImNvbG9yOiMyOTgwYjkiPkxlIG1lcmNyZWRpIGRlcyBDZW5kcmVzIGVzdCBsZSBqb3VyIG8mdWdyYXZlOyBkZXMgY2hyJmVhY3V0ZTt0aWVucyBlbnRyZW50IGRhbnMgbGUgY2FyJmVjaXJjO21lLiA8L3NwYW4+PC9zcGFuPjwvcD4KCjxwPjxzcGFuIHN0eWxlPSJmb250LXNpemU6MThweCI+PHNwYW4gc3R5bGU9ImNvbG9yOiMyOTgwYjkiPlNpIHZvdXMgdm91cyBzb3VoYWl0ZXogeSBwYXJ0aWNpcGVyLCA8c3Ryb25nPm1lcmNpIGRlIHZvdXMgaW5zY3JpcmUgYXZhbnQgbGUgbWFyZGkgMTMgJmFncmF2ZTsgMThoPC9zdHJvbmc+LCBhdXByJmVncmF2ZTtzIGRlIE1tZSBYWFhYWCBvdSBhdXByJmVncmF2ZTtzIGRlIG1vaS1tJmVjaXJjO21lKiAoZGlyZWN0ZW1lbnQgb3UgZW4gciZlYWN1dGU7cG9uZGFudCAmYWdyYXZlOyBjZSBtYWlsKS48L3NwYW4+PC9zcGFuPjwvcD4KCjxwPjxzcGFuIHN0eWxlPSJmb250LXNpemU6MThweCI+PHNwYW4gc3R5bGU9ImNvbG9yOiMyOTgwYjkiPkJvbm5lIGpvdXJuJmVhY3V0ZTtlICZhZ3JhdmU7IHRvdXMsPC9zcGFuPjwvc3Bhbj48L3A+Cgo8cD4qSmUgc3VpcyBhYnNlbnQgcG91ciBmb3JtYXRpb24gbHVuZGkgZXQgbWFyZGkgMTIgZXQgMTMgZiZlYWN1dGU7dnJpZXIuPC9wPg==`}</EncodedHTMLDiv>

            <TextInput textType={"text"} onChange={(e) => setTestHash(e.target.value)} value={testHash} style={{ backgroundColor: `hsl(${testHSLValues[0]}, ${testHSLValues[1]}%, ${testHSLValues[2]}%)` }} />

            <h4>Default File Icon</h4>
            <DefaultFileIcon extension={fileExtension} style={{ height: "500px" }} />
            <TextInput textType={"text"} onChange={(e) => setFileExtension(e.target.value)} value={fileExtension} ></TextInput>

            <h4>OutlineEffectDiv</h4>
            <OutlineEffectDiv className="outline-effect-div-test">
                ac ut consequat semper viverra nam libero justo laoreet sit amet cursus sit amet dictum sit amet justo donec enim diam vulputate ut pharetra sit amet aliquam id diam maecenas ultricies mi eget mauris pharetra et ultrices neque ornare aenean euismod elementum nisi quis eleifend quam adipiscing vitae proin sagittis nisl rhoncus mattis rhoncus urna neque viverra justo nec ultrices dui sapien eget mi proin sed libero enim sed
            </OutlineEffectDiv>

            <h4>InitializerHook</h4>
            <Button onClick={() => {
                const newValue = ["test0", "test1", "test2", "defaultValue"][Math.floor(Math.random() * 4)];
                setInitializer(() => newValue);
                console.log(newValue);
            }}>Change initializer value</Button>
            {initializer}
            <Button onClick={() => {
                initialTestState2.b += 1;
                setTestState2(testState2)
            }}>change initial value</Button>
            <Button onClick={() => {
                setTestState2((old) => {
                    const next = { ...old };
                    next.a.b += "+";
                    return next;
                });
            }}>set value</Button>
            {JSON.stringify(initialTestState2)}
            <br />
            {JSON.stringify(testState2)}
            <h4>Linkable Button</h4>
            <p>
                this component uses {"<a>"} tag to allow user to copy a link
                from a button that he could share (like a homework) without
                needing to redirect to it when clicked. what it mean it that
                the button will do stuffs like redirect the user or select a
                grade or homework but without changing the link (less edge case
                and error prone). However if he wants to copy the link to
                navigate to the same data on another browser or to share with
                friend he will be able to do it by copying the link.
            </p>
            <LinkableButton onClick={() => {
                setLinkableButton1(69);
                setLinkableButton2(42);
            }} to={"?param_1=69&param_2=42"}>CLICK ME OR COPY ME</LinkableButton>
            <p>param_1: {linkableButton1}</p>
            <p>param_2: {linkableButton2}</p>

            <h4>Couleurs de matières en fonction du préfixe</h4>
            <NumberInput min={0} max={100} onChange={(e) => setColorSeedVIMin(parseInt(e))} value={colorSeedVIMin} ></NumberInput>
            <NumberInput min={0} max={100} onChange={(e) => setColorSeedVIMax(parseInt(e))} value={colorSeedVIMax} ></NumberInput>
            <NumberInput min={0} max={Math.min(50, colorSeedVIMin)} onChange={(e) => setColorSeedVLMin(parseInt(e))} value={colorSeedVLMin} ></NumberInput>
            <NumberInput min={0} max={Math.min(50, colorSeedVIMax)} onChange={(e) => setColorSeedVLMax(parseInt(e))} value={colorSeedVLMax} ></NumberInput>
            <TextInput textType={"n"} onChange={(e) => setColorSeed(e.target.value)} value={colorSeed} ></TextInput>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, 300px)',
                    gap: '5px',
                    marginInline: "500px"
                }}
            >
                {subjectArray.map((subject, i) => {
                    const taskColor = textToHSL(colorSeed + subject);
                    const primaryColor = usedDisplayTheme === "dark" ? `hsl(${taskColor[0]}, ${taskColor[1]}%, ${taskColor[2]}%)` : `hsl(${taskColor[0]}, ${taskColor[1] - 20}%, ${taskColor[2] - 30}%)`;
                    const secondaryColor = usedDisplayTheme === "dark" ? `hsla(${taskColor[0]}, ${taskColor[1]}%, ${taskColor[2]}%, .2)` : `hsla(${taskColor[0]}, ${taskColor[1] - 20}%, ${taskColor[2] - 30}%, .2)`;
                    return <div
                        key={i}
                        style={{
                            width: '300px',
                            height: '105px',
                            backgroundColor: secondaryColor,
                            color: primaryColor,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontWeight: "600",
                            borderRadius: "4px",
                            border: "1px solid " + primaryColor
                        }}
                    >{subject}</div>
                })}
            </div>
            {/* FOOTER */}
            <div style={{ height: "100px" }}></div>
        </div>
    )
}
