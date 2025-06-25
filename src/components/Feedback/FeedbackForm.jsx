
import { useState, useEffect, useRef, useContext } from "react";
import { getBrowser, getOS } from "../../utils/utils";
import { BrowserLabels, OperatingSystemLabels } from "../../utils/constants/constants";
import { EDPVersion } from "../../utils/constants/configs";

import SegmentedControl from "../generic/UserInputs/SegmentedControl";
import DropDownMenu from "../generic/UserInputs/DropDownMenu";
import TextInput from "../generic/UserInputs/TextInput";
import Button from "../generic/UserInputs/Button";
import CheckBox from "../generic/UserInputs/CheckBox";
import WarningMessage from "../generic/Informative/WarningMessage";
import InfoButton from "../generic/Informative/InfoButton";

import { AppContext, SettingsContext } from "../../App";

// graphics
import PasteIcon from "../graphics/PasteIcon"
import AtWhite from "../graphics/AtWhite"

import "./FeedbackForm.css";


export default function FeedbackForm({ activeUser, carpeConviviale, onSubmit=() => {} }) {
    const allowedExtensions = /(\jpg|\jpeg|\png|\bmp|\gif|\tif|\webp|\heic|\pdf)$/i; // la regex cancérigène ; je comprends mm pas comment ca marche ; moi nn plus tqt
    const feedbackTips = [
        `### Description du problème :

### Comportement attendu :

### Étapes pour reproduire :

### Navigateur/OS/Appareil :
${BrowserLabels[getBrowser()]} ; ${OperatingSystemLabels[getOS()]} ; <inconnu> (Complété automatiquement. Modifiable)
`,
        `### Description de la fonctionnalité :

### Quel(s) problème(s) cette fonctionnalité pourrait régler ?

### Expliquez ce que vous essayiez de faire lorsque vous avez rencontré le problème menant à cette demande de fonctionnalité :
`,
        `### Ce que vous aimez :

### Ce que vous aimez moins :

### Pistes de progression :
`,
        `### Type de retour :

### Description :
`,
    ]
    const submitButtonAvailableStates = {
        "Envoi...": "submitting",
        "Envoyé": "submitted",
        "Échec de l'envoi": "invalid",
        "Invalide": "invalid"
    }
    const feedbackTypes = ["Signaler un bug", "Suggestion", "Retour d'expérience", "Autre"];

    // States
    // pire nom de variable mais il y a FF et SS
    const FFCFromSS = JSON.parse(sessionStorage.getItem("feedbackFormContent") ?? "{}");
    const [selectedFeedbackType, setSelectedFeedbackType] = useState(FFCFromSS.selectedFeedbackType ?? "");
    const [windowInnerWidth, setWindowInnerWidth] = useState(window.innerWidth);
    const [subject, setSubject] = useState(FFCFromSS.subject ?? ""); // Objet du feedback
    const [feedbackContent, setFeedbackContent] = useState(FFCFromSS.feedbackContent ?? feedbackTips[0]);
    const [isAnonymous, setIsAnonymous] = useState(FFCFromSS.isAnonymous ?? false);
    const [userEmail, setUserEmail] = useState(FFCFromSS.userEmail ?? "");
    const [feedbackContentWarningMessage, setFeedbackContentWarningMessage] = useState("");
    const [attachedFile, setAttachedFile] = useState(null);
    const [warningMessage, setWarningMessage] = useState(""); // pour input file
    const [errorMessage, setErrorMessage] = useState("");
    const [submitButtonText, setSubmitButtonText] = useState("Envoyer");
    const [allowSharing, setAllowSharing] = useState(true);

    const { isDevChannel } = useContext(AppContext);

    const settings = useContext(SettingsContext);

    // Refs
    const imgRef = useRef(null);
    const labelRef = useRef(null);
    const fileInputRef = useRef(null);


    useEffect(() => {
        const feedbackFormContent = {
            selectedFeedbackType,
            subject,
            feedbackContent,
            isAnonymous,
            userEmail
        }
        sessionStorage.setItem("feedbackFormContent", JSON.stringify(feedbackFormContent));
    }, [selectedFeedbackType, subject, feedbackContent, isAnonymous, userEmail])

    // update la valeur de la largeur du viewport pour savoir si afficher dropdown ou segmentedcontrol

    useEffect(() => {
        function handleResize() {
            setWindowInnerWidth(window.innerWidth)
        }

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, []);

    const [isFileInputHovered, setIsFileInputHovered] = useState(false);
    function handleDragOver() {
        setIsFileInputHovered(true);
    }

    function handleDragOverStop() {
        setIsFileInputHovered(false);
    }

    // réinitialise le texte dans le submit input quand le contenu du feedback change (pour quand le feedback a déjà été envoyé et que le submit est en "Envoyé")
    useEffect(() => {
        setSubmitButtonText("Envoyer");
    }, [selectedFeedbackType, subject, feedbackContent, attachedFile, isAnonymous, userEmail]);

    // Behavior
    const updateSubject = (event) => { setSubject(event.target.value) }
    const udpateFeedbackContent = (event) => {
        setFeedbackContent(event.target.value);
        setFeedbackContentWarningMessage("");
    }
    const updateIsAnonymous = (event) => { setIsAnonymous(event.target.checked) }
    const updateUserEmail = (event) => { setUserEmail(event.target.value) }
    const handleFeedbackTypeChange = (feedbackType) => {
        setSelectedFeedbackType(feedbackType);
        if (feedbackTips.includes(feedbackContent) || feedbackContent === "") {
            setFeedbackContent(feedbackTips[feedbackTypes.indexOf(feedbackType)]);
        }
    }

    // Si le content est vide (triggered sur onInvalid de la textarea)
    const handleInvalidFeedbackContent = (event) => {
        event.preventDefault();
        setFeedbackContentWarningMessage("Veuillez décrire avec exhaustivité votre retour");
        setSubmitButtonText("Invalide");
    }

    // Si le content est plein (donc assigné au onInvalid du form et au onSubmit du form pour détecter si il est invalid dans le cas ou les autres inputs sont bon ou non) Si vous ne comprenez pas contactzer le developpeur que vous n'êtes pas (si vous êtes Saumon_brulé par exemple contactez Truite_séchée)
    const detectInvalidFeedBackContent = () => {
        if (feedbackTips.includes(feedbackContent)) {
            setFeedbackContentWarningMessage("Veuillez décrire avec exhaustivité votre retour");
            setSubmitButtonText("Invalide");
            return true;
        } else {
            return false;
        }
    }
    
    // ----------------
    // https://pipedream.com/workflows
    async function imageToURL(file) {
        // TODO: Gérer les erreurs status_code
        const apiKey = "5943cbf06cfb78251f2db28082951e01";
        const apiURL = `https://api.imgbb.com/1/upload?key=${apiKey}`;
        // const apiURL = "http://bit.ly/43iQj4d";

        let body = new FormData();
        body.append('image', file);

        let data = null;

        await fetch(apiURL, {
            method: "POST",
            body: body
        })
            .then(response => response.json())
            .then(response => data = response.data)
            .catch(error => {
                setErrorMessage(error.message);
                setSubmitButtonText("Échec de l'envoi");
            })

        return data;
    }


    const handleFile = (event) => {
        setAttachedFile(event.target.files[0]); // récupère le fichier
        // voir useEffect ↓↓
    }
    useEffect(() => {
        // gère l'extraction ou la réinitialisation de l'image jointe
        if (attachedFile !== null) {
            if (typeof attachedFile !== "undefined" && allowedExtensions.exec(attachedFile.name) && attachedFile.size <= 32_000_000) {
                setWarningMessage("");
                let reader = new FileReader();
                reader.onload = () => {
                    // Affiche la preview de l'image
                    labelRef.current.style.display = "none";
                    imgRef.current.src = reader.result;
                    imgRef.current.style.display = "block";
                }
                reader.readAsDataURL(attachedFile);
            } else {
                // gestion des erreurs et reset
                if (typeof attachedFile !== "undefined") {
                    setWarningMessage(attachedFile.size > 32_000_000 ? "Fichier trop volumineux" : "Format de fichier invalide");
                }
                imgRef.current.src = "";
                imgRef.current.style.display = "none";
                labelRef.current.style.display = "block";
                fileInputRef.current.value = "";
                setAttachedFile(null);
            }
        }
    }, [attachedFile]);



    const handlePaste = async () => {
        if (!navigator.clipboard.read) {
            setWarningMessage("Votre navigateur ne supporte pas la lecture du presse-papiers");
        }

        try {
            try {
                const permission = await navigator.permissions.query({
                    name: "clipboard-read",
                });
                if (permission.state === "denied") {
                    setWarningMessage("Non autorisé à lire le presse-papiers");
                    throw new Error("Not allowed to read clipboard.");
                }
            } catch (error) {
                console.error(error.message);
            }
            const clipboardContents = await navigator.clipboard.read();
            for (const item of clipboardContents) {
                if (!allowedExtensions.exec(item.types)) {
                    setWarningMessage("Le presse-papiers ne contient pas d'image");
                    throw new Error("Clipboard contains non-image data.");
                }
                const blob = await item.getType(item.types);

                const file = new File([blob], "attached-file.png");

                const event = {
                    target: {
                        files: [file]
                    }
                }
                handleImageRemoving();
                handleFile(event);
            }
        } catch (error) {
            console.error(error.message);
        }
    }

    const handleImageRemoving = () => {
        imgRef.current.src = "";
        imgRef.current.style.display = "none";
        labelRef.current.style.display = "block";
        fileInputRef.current.value = "";
        setAttachedFile(null);
    }


    const handleSubmit = async (event) => {
        event.preventDefault();
        sessionStorage.removeItem("feedbackFormContent");
        // empêche le renvoi si déjà envoyé et le contenu n'a pas changé ou formulaire invalide
        if (submitButtonText === "Envoyé" || submitButtonAvailableStates[submitButtonText] === "invalid") {
            return 0;
        }
        // empêche l'envoi si le contenu est un tip non modifié
        if (detectInvalidFeedBackContent()) {
            return 0;
        }
        setSubmitButtonText("Envoi...");
        const data = (attachedFile ? await imageToURL(attachedFile) : null);

        // Envoyer to webhook
        const date = new Date();
        const options = { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: "numeric" }
        const readableDate = date.toLocaleDateString('fr-FR', options);
        const colors = {
            "Signaler un bug": "FF0000",
            "Suggestion": "FFFF00",
            "Retour d'expérience": "00FF00",
            "Autre": "4B48D9",
        }
        let color = colors[selectedFeedbackType];
        fetch(
            carpeConviviale,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: `botActions:[VERIFY],${allowSharing ? "" : "[DISABLE_VERIFY]"} <@1192136509567016990>`, // allow us to handle feedback sharing on our discord server
                    embeds: [
                        {
                            color: parseInt("0x" + color),
                            author: {
                                name: ((activeUser && isAnonymous) ? activeUser.lastName + " " + activeUser.firstName : "Poisson-zèbre Augmenté") + " (" + (isAnonymous ? "N/A" : (userEmail || (activeUser ? activeUser.email : ""))) + ")",
                                icon_url: ((isAnonymous || !activeUser) ? "https://i.ibb.co/CKmD9z8/poisson-z-bre.jpg" : activeUser.picture)
                            },
                            title: "**__" + selectedFeedbackType + "__ : " + subject + "**",
                            description: feedbackContent,
                            image: {
                                url: (data && data.display_url)
                            },
                            footer: {
                                text: readableDate + " - v" + EDPVersion + (isDevChannel ? " - DEV CHANNEL" : ""),
                            },
                        }
                    ]
                }),
            }
        )
            .then(() => {
                setSubmitButtonText("Envoyé");
                onSubmit();
            })
            .catch((error) => {
                setErrorMessage(error.message);
                setSubmitButtonText("Échec de l'envoi");
            })
    }
    

    return (
        <form className="feedback-form" onSubmit={handleSubmit} autoComplete="off" onInvalid={detectInvalidFeedBackContent}>
            {windowInnerWidth <= 500 ?
                <DropDownMenu id="SC-feedback-type" name="feedback-type" options={feedbackTypes} selected={selectedFeedbackType} onChange={handleFeedbackTypeChange} /> :
                <SegmentedControl fieldsetName="feedback-type" id="SC-feedback-type" segments={feedbackTypes} selected={selectedFeedbackType} onChange={handleFeedbackTypeChange} />}
            <TextInput id="feedback-subject" isRequired={true} textType="text" placeholder="Objet" value={subject} onChange={updateSubject} warningMessage="Veuillez entrer un objet qui résume votre requête" onWarning={() => { setSubmitButtonText("Invalide") }} />
            <textarea required className={`text-area${feedbackContentWarningMessage && " invalid"}`} id="feedback-content" value={feedbackContent} onInvalid={handleInvalidFeedbackContent} onChange={udpateFeedbackContent} placeholder="Décrire le problème (supporte la syntaxe markdown)"></textarea>
            <WarningMessage condition={feedbackContentWarningMessage} >{feedbackContentWarningMessage}</WarningMessage>
            <div className="file-input">
                <div id="drop-zone-container">
                    <div className={`drop-zone ${isFileInputHovered ? "file-hovered" : ""} ${warningMessage && "invalid"}`} onDragOver={handleDragOver} onDragLeave={handleDragOverStop} onDrop={handleDragOverStop}>
                        <div id="preview-container">
                            <img id="file-preview" ref={imgRef} alt="Prévisualisation de l'image jointe" />
                            <label htmlFor="attached-file" ref={labelRef}>Ajouter une capture d'écran</label>
                        </div>
                        <input name="attached-file" id="attached-file" ref={fileInputRef} type="file" onChange={handleFile} accept=".jpg, .jpeg, .png, .bmp, .gif, .tif, .webp, .heic, .pdf" />
                    </div>
                </div>
                <div id="file-controls">
                    <Button type="button" value={<PasteIcon id="paste-button-icon" />} onClick={handlePaste} />
                    {attachedFile && <Button type="button" value="✕" onClick={handleImageRemoving} />}
                </div>
            </div>
            <WarningMessage condition={warningMessage}>{warningMessage}</WarningMessage>
            <div id="publish">
                <span>
                    <CheckBox id="remain-allow-sharing" label={<span id="publish-info">Autoriser la publication sur le <a href="https://discord.gg/AKAqXfTgvE" target="_blank">Discord communautaire</a></span>} checked={allowSharing} onChange={() => setAllowSharing(!allowSharing)} />
                    <InfoButton>Tous les retours sont modérés et anonymisés avant publication</InfoButton>
                </span>
            </div>
            <div id="contact">
                <CheckBox id="remain-anonymous" label="Rester anonyme" checked={isAnonymous} onChange={updateIsAnonymous} />
                <TextInput id="user-email" isRequired={isAnonymous ? false : ((!userEmail && activeUser) ? false : true)} warningMessage="Veuillez saisir une adresse email de contact correcte" textType="email" placeholder={activeUser && !isStreamerModeEnabled.value ? activeUser.email : "Adresse email"} icon={<AtWhite/>} value={userEmail} onChange={updateUserEmail} disabled={isAnonymous} onWarning={() => { setSubmitButtonText("Invalide") }} />
            </div>
            <p id="usage-info">Cela nous permettra de vous contacter pour obtenir plus d'informations</p>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <Button state={submitButtonText && submitButtonAvailableStates[submitButtonText]} id="submit-feedback" type="submit" value={submitButtonText} />
        </form>
    )
}