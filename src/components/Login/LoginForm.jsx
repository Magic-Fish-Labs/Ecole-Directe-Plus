
import { useState, useEffect, useContext, useRef } from "react";
import { LoginCodes } from "../../EcoleDirecteHandlerCore/constants/codes";

import TextInput from "../generic/UserInputs/TextInput";
import CheckBox from "../generic/UserInputs/CheckBox";
import Button, { ButtonStates, ButtonTypes } from "../generic/UserInputs/Button";
import { Tooltip, TooltipTrigger, TooltipContent } from "../generic/PopUps/Tooltip";

import AccountIcon from "../graphics/AccountIcon"
import KeyIcon from "../graphics/KeyIcon"

import "./LoginForm.css";
import { AccountContext } from "../../App";

const today = new Date();
const april = (today.getMonth() === 3) && (today.getDate() < 2);

const displayStates = {
    [LoginCodes.SUCCESS.code]: {
        submitState: ButtonStates.SUBMITTED,
        submitButtonText: "Connecté",
        errorMessage: "",
    },
    [LoginCodes.INVALID_CREDENTIALS.code]: {
        submitState: ButtonStates.INVALID,
        submitButtonText: "Échec de la connexion",
        errorMessage: "Identifiant et/ou mot de passe invalide",
    },
    [LoginCodes.REQUIRE_DOUBLE_AUTH.code]: {
        submitState: ButtonStates.SUBMITTING,
        submitButtonText: "A2F requise",
        errorMessage: "",
    },
    [LoginCodes.SERVER_ERROR.code]: {
        submitState: ButtonStates.INVALID,
        submitButtonText: "Échec de la connexion",
        errorMessage: "La connexion avec le serveur a échoué, réessayez dans quelques minutes",
    },
    [LoginCodes.ACCOUNT_CREATION_ERROR.code]: {
        submitState: ButtonStates.INVALID,
        submitButtonText: "Échec de la connexion",
        errorMessage: "Il semblerait que votre compte EcoleDirecte ne soit pas encore valide, renseignez vous auprès de votre établissement ou d'EcoleDirecte. On vous attend avec impatience !",
    },
    [LoginCodes.EMPTY_RESPONSE.code]: {
        submitState: ButtonStates.INVALID,
        submitButtonText: "Échec de la connexion",
        errorMessage: "La connexion avec le serveur nécessite l'extension EDPUnblock",
    },
    [LoginCodes.NO_EXT_RESPONSE.code]: {
        submitState: ButtonStates.INVALID,
        submitButtonText: "Échec de la connexion",
        errorMessage: "Nous n'avons pas réussi à communiquer avec l'extension EDP Unblock, vérifiez qu'elle soit à jour et/ou qu'elle ait les permissions nécessaires.",
    },
    [LoginCodes.EXT_NO_GTK_COOKIE.code]: {
        submitState: ButtonStates.INVALID,
        submitButtonText: "Échec de la connexion",
        errorMessage: "L'extension EDP Unblock n'a pas réussi à accéder aux cookies nécessaires pour votre connexion, vérifiez qu'elle soit à jour et/ou qu'elle ait les permissions nécessaires.",
    },
    [LoginCodes.EXT_NO_COOKIE.code]: {
        submitState: ButtonStates.INVALID,
        submitButtonText: "Échec de la connexion",
        errorMessage: "L'extension EDP Unblock n'a pas réussi à accéder aux cookies nécessaires pour votre connexion, vérifiez qu'elle soit à jour et/ou qu'elle ait les permissions nécessaires.",
    }
}

export default function LoginForm({ logout, disabledKeepLoggedInCheckBox = false, ...props }) {

    const {
        userCredentials,
        keepLoggedIn,
        requestLogin,
        doubleAuthAcquired,
    } = useContext(AccountContext);

    const [username, setUsername] = useState(userCredentials.username.value);
    const [password, setPassword] = useState(userCredentials.password.value);
    const [localKeepLoggedIn, setLocalKeepLoggedIn] = useState(keepLoggedIn.value);
    const [displayState, setDisplayState] = useState({
        submitState: ButtonStates.NEUTRAL,
        submitButtonText: "Se connecter",
        errorMessage: "",
    })

    const loginRef = useRef({ username, password, keepLoggedIn: localKeepLoggedIn });

    function resetDisplayState() {
        setDisplayState((old) => ({
            ...old,
            submitState: ButtonStates.NEUTRAL,
            submitButtonText: "Se connecter",
        }))
    }

    function updateUsername(event) {
        setUsername(event.target.value);
        resetDisplayState();
    }

    function updatePassword(event) {
        setPassword(event.target.value);
        resetDisplayState();
    }

    function updateKeepLoggedIn(event) {
        setLocalKeepLoggedIn(event.target.checked);
    }

    function handleSubmit(event) {
        event.preventDefault();
        // empêche la connexion si déjà connecté ou formulaire invalide
        if (displayState.submitState === ButtonStates.SUBMITTED) {
            return;
        }
        // UI
        setDisplayState({
            submitState: ButtonStates.SUBMITTING,
            submitButtonText: "Connexion...",
            errorMessage: "",
        })

        // Process login
        requestLogin(username, password, localKeepLoggedIn)
            .then((result) => {
                if (displayStates[result.code]) {
                    setDisplayState(displayStates[result.code]);
                } else {
                    setDisplayState({
                        submitState: ButtonStates.INVALID,
                        submitButtonText: "Échec de la connexion",
                        errorMessage: "Une erreur inattendue s'est produite",
                    });
                }
            });
    }

    useEffect(() => {
        if (doubleAuthAcquired) {
            requestLogin(username, password, localKeepLoggedIn)
                .then((result) => {
                    // !:!
                    setDisplayState({
                        submitState: result.code ? ButtonStates.INVALID : ButtonStates.SUBMITTED,
                        submitButtonText: result.code ? "Échec de la connexion" : "Connecté",
                        errorMessage: result.message ?? "",
                    });
                });
        }
    }, [doubleAuthAcquired])


    // We store username/password/keepLoggedIn values in a ref to 
    useEffect(() => {
        loginRef.current = { username, password, keepLoggedIn: localKeepLoggedIn };
    }, [username, password, localKeepLoggedIn]);

    useEffect(() => () => {
        userCredentials.username.set(loginRef.current.username);
        userCredentials.password.set(loginRef.current.password);
        keepLoggedIn.set(loginRef.current.keepLoggedIn);
    }, []);

    if (localStorage.userSettings) {
        if (((JSON.parse(localStorage.userSettings)[0].displayTheme) !== "dark") && (april)) {
            document.body.setAttribute('style', 'background-color: white;')
        } else {
            document.body.style.backgroundColor = "";
        }
    } else {
        if ((document.documentElement.getAttribute('class').indexOf('dark') < 0) && (april)) {
            document.body.setAttribute('style', 'background-color: white;')
        }
    }

    return (
        <form onSubmit={handleSubmit} {...props} id="login-form">
            <TextInput
                textType="text"
                value={username}
                onChange={updateUsername}
                name={"edp-login-username"}
                onWarning={() => setDisplayState((old) => ({ submitState: ButtonStates.INVALID, ...old }))}
                disabled={displayState.submitState === ButtonStates.SUBMITTING}
                className={"login-input"}
                placeholder={april ? "Nom d'Utilisateur" : "Identifiant"}
                isRequired={true}
                autoComplete="username"
                warningMessage="Veuillez entrer votre identifiant"
                icon={<AccountIcon />}
            />
            <TextInput
                textType="password"
                value={password}
                onChange={updatePassword}
                name={"edp-login-password"}
                onWarning={() => setDisplayState((old) => ({ submitState: ButtonStates.INVALID, ...old }))}
                disabled={displayState.submitState === ButtonStates.SUBMITTING}
                className={"login-input"}
                placeholder={april ? "•••••••••••" : "Mot de passe"}
                isRequired={true}
                autoComplete="current-password"
                warningMessage="Veuillez entrer votre mot de passe"
                icon={<KeyIcon />}
            />
            <p className="error-message">{displayState.errorMessage}</p>
            <div className="login-option">
                <Tooltip delay={400}>
                    <TooltipTrigger>
                        <CheckBox disabled={disabledKeepLoggedInCheckBox || displayState.submitState === ButtonStates.SUBMITTING} id="keep-logged-in" label="Rester connecté" checked={localKeepLoggedIn} onChange={updateKeepLoggedIn} />
                    </TooltipTrigger>
                    <TooltipContent className="fdisclaimer">
                        Avertissement : cette fonctionnalité peut présenter des risques, notamment si vous êtes infecté par un logiciel malveillant
                    </TooltipContent>
                </Tooltip>
                <a id="password-forgotten-link" href="https://api.ecoledirecte.com/mot-de-passe-oublie.awp" target="blank">Mot de passe oublié ?</a>
            </div>
            <Button id="submit-login" state={displayState.submitState} type={ButtonTypes.SUBMIT} >
                {april ? "Ok" : displayState.submitButtonText}
            </Button>
        </form>
    )
}
