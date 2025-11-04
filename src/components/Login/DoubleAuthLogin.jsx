
import { useState, useEffect, useRef, useContext } from "react";
import ContentLoader from "react-content-loader";
import PopUp from "../generic/PopUps/PopUp";
import RadioButton from "../generic/UserInputs/RadioButton";
import { decodeBase64 } from "../../utils/utils";
import Button from "../generic/UserInputs/Button";
import ScrollShadedDiv from "../generic/CustomDivs/ScrollShadedDiv";
import { AccountContext } from "../../App";

import "./DoubleAuthLogin.css";

export default function DoubleAuthLogin({ ...props }) {

    const {
        getDoubleAuthQuestions,
        sendDoubleAuthAnswer,
        requestLogin
    } = useContext(AccountContext);

    const [doubleAuthForm, setDoubleAuthForm] = useState({});
    const [isOpen, setIsOpen] = useState(true);
    const [choice, setChoice] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const answerAbortController = useRef(new AbortController());

    useEffect(() => {
        const controller = new AbortController();
        if (Object.keys(doubleAuthForm).length < 1) {
            getDoubleAuthQuestions(controller)
                .then((response) => {
                    if (!controller.signal.aborted) {
                        switch (response.code) {
                            case 0:
                                setDoubleAuthForm(response.data);
                                return;
                            case 1:
                                setErrorMessage("Le formulaire a mis trop de temps à être demandé.");
                                return;
                            case -1:
                                setErrorMessage("Une erreur inattendue s'est produite.");
                                return;
                        }
                    }
                })
        }

        return () => {
            controller.abort();
            answerAbortController.current.abort()
        }
    }, []);

    const handleDoubleAuthSubmit = (event) => {
        event.preventDefault();
        sendDoubleAuthAnswer(choice).then((response) => {
            switch (response.code) {
                case 0:
                    requestLogin();
                    return;
                case 1:
                    setErrorMessage("Vous avez mis trop de temps à répondre au formulaire.")
                    return;
                case 2:
                    setErrorMessage("Une erreur inattendue s'est produite."); // cas où le token est invalide (!= d'expiré, le case 1), c'est donc une erreur côté EDP donc non prévue
                    return;
                case 3:
                    setErrorMessage("Votre compte EcoleDirecte a peut être été bloqué suite à une réponse incorrecte au défi de sécurité. Consultez vos emails pour les instructions de déblocage.");
                    return;
                case -1:
                    setErrorMessage("Une erreur inattendue s'est produite.");
                    return;
            }
        })
    }

    // JSX
    return (
        <PopUp className="double-auth-login" forceClose={!isOpen} {...props}>
            <h2>Authentification à deux facteurs</h2>
            <p className="explanation">Ce formulaire est une mesure de sécurité mise en place par EcoleDirecte afin de vérifier votre identité.</p>
            <form id="double-auth-login-form" onSubmit={handleDoubleAuthSubmit}>
                {doubleAuthForm.question ? <h3>{decodeBase64(doubleAuthForm.question)}</h3> : <h3><ContentLoader
                    speed={1}
                    backgroundColor="#63638c"
                    foregroundColor="#7e7eb2"
                    height="25"
                    width="300"
                >
                    <rect x="0" y="0" rx="10" ry="10" style={{ width: "100%", height: "100%" }} />
                </ContentLoader></h3>}
                <ScrollShadedDiv className="double-auth-answers-container">
                    {Object.keys(doubleAuthForm).length > 0
                        ? <div className="double-auth-answers">
                            {doubleAuthForm.choices.map((choice, index) => <RadioButton id={`double-auth-login-${index}`} name="double-auth-fieldset" key={choice.value} data-value={choice.value} onChange={(event) => setChoice(event.target.dataset.value)}>{choice.display}</RadioButton>)}
                        </div>
                        : <div className="double-auth-answers">
                            {Array.from({ length: 11 }, (_, index) => <div className="double-auth-content-loader-container" key={crypto.randomUUID()}>
                                <ContentLoader
                                    speed={1}
                                    backgroundColor="#63638c"
                                    foregroundColor="#7e7eb2"
                                    height="20"
                                    width="20"
                                >
                                    <rect x="0" y="0" rx="10" ry="10" style={{ width: "100%", height: "100%" }} />
                                </ContentLoader>
                                <ContentLoader
                                    speed={1}
                                    backgroundColor="#63638c"
                                    foregroundColor="#7e7eb2"
                                    height="25"
                                    width="100"
                                >
                                    <rect x="0" y="0" rx="10" ry="10" style={{ width: "100%", height: "100%" }} />
                                </ContentLoader>
                            </div>)}
                        </div>
                    }
                </ScrollShadedDiv>
                {errorMessage && <p className="double-auth-error-message">{errorMessage}</p>}
                <div className="double-auth-buttons">
                    <Button className="cancel-double-auth" onClick={() => setIsOpen(false)}>Annuler</Button>
                    <Button className="submit-double-auth" type="submit">Valider</Button>
                </div>
            </form>
        </PopUp>
    );
}