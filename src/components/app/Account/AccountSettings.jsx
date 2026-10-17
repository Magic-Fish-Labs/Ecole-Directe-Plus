import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../../App";

import Button from "../../generic/UserInputs/Button";
import DropDownMenu from "../../generic/UserInputs/DropDownMenu";
import TextInput from "../../generic/UserInputs/TextInput";
import WarningMessage from "../../generic/Informative/WarningMessage";
import ContentLoader from "react-content-loader";
import ConfusedCanardman from "../../graphics/ConfusedCanardman";

const emptyForm = {
    identifiant: "",
    email: "",
    portable: "",
    questionSecrete: "",
    reponse: "",
    nouveauMotDePasse: "",
    confirmationMotDePasse: "",
};

const streamerMasks = {
    identifiant: "•••••••••••",
    email: "contact@ecole-directe.plus",
    portable: "00 00 00 00 00",
};

export default function AccountSettings() {
    const { accountsListState, activeAccount, fetchAccountSettings, updateAccountSettings, createNotification, useUserData, useUserSettings, actualDisplayTheme } = useContext(AppContext);
    const settings = useUserSettings();
    const userData = useUserData();

    const account = accountsListState?.[activeAccount] ?? {};
    const isGuest = account.firstName === "Guest";
    const isStreamerModeEnabled = settings.get("isStreamerModeEnabled");

    const [isLoading, setIsLoading] = useState(!isGuest);
    const [isHidden, setIsHidden] = useState(false);
    const [fetchedData, setFetchedData] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [fetchError, setFetchError] = useState("");
    const [saveError, setSaveError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    function applyFetchedData(data) {
        setFetchedData(data);
        setForm({
            identifiant: data.identifiant ?? "",
            email: data.email ?? "",
            portable: data.portable ?? "",
            questionSecrete: data.questionSecrete ?? "",
            reponse: data.reponse ?? "",
            nouveauMotDePasse: "",
            confirmationMotDePasse: "",
        });
    }

    function handleFieldChange(field, event) {
        setSaveError("");
        setForm((oldForm) => ({ ...oldForm, [field]: event.target.value }));
    }

    function handleQuestionChange(value) {
        setSaveError("");
        setForm((oldForm) => ({ ...oldForm, questionSecrete: value }));
    }

    function handleReset() {
        setSaveError("");
        if (fetchedData) {
            applyFetchedData(fetchedData);
        }
    }

    async function handleSave(event) {
        event.preventDefault();
        if (isSaving) {
            return;
        }
        setSaveError("");
        const hasNewPassword = form.nouveauMotDePasse !== "" || form.confirmationMotDePasse !== "";
        if (hasNewPassword && (form.nouveauMotDePasse === "" || form.confirmationMotDePasse === "")) {
            setSaveError("Les deux champs de mot de passe doivent être renseignés.");
            return;
        }
        if (form.nouveauMotDePasse !== form.confirmationMotDePasse) {
            setSaveError("Les mots de passe ne correspondent pas.");
            return;
        }
        const payload = {
            identifiant: form.identifiant,
            email: form.email,
            portable: encodeURIComponent(form.portable),
            questionSecrete: form.questionSecrete,
            reponse: form.reponse,
        };
        if (hasNewPassword) {
            payload.nouveauMotDePasse = form.nouveauMotDePasse;
            payload.confirmationMotDePasse = form.confirmationMotDePasse;
        }
        setIsSaving(true);
        const result = await updateAccountSettings(payload);
        setIsSaving(false);
        if (result.ok) {
            const serverData = result.data && typeof result.data === "object" && !Array.isArray(result.data) ? result.data : {};
            const updatedData = {
                ...(fetchedData ?? {}),
                ...serverData,
                identifiant: serverData.identifiant ?? form.identifiant,
                email: serverData.email ?? form.email,
                portable: serverData.portable ?? decodeURIComponent(payload.portable),
                questionSecrete: serverData.questionSecrete ?? form.questionSecrete,
                reponse: serverData.reponse ?? form.reponse,
                questionsPossibles: serverData.questionsPossibles ?? fetchedData?.questionsPossibles ?? [],
            };
            applyFetchedData(updatedData);
            userData.set("accountSettings", updatedData);
            createNotification(<span className="emphasis">Paramètres mis à jour</span>);
        } else {
            setSaveError(result.error ?? "La modification a échoué");
        }
    }

    useEffect(() => {
        setIsHidden(false);
        setFetchError("");
        setSaveError("");
        if (isGuest) {
            setIsLoading(false);
            return;
        }
        const controller = new AbortController();
        let isCurrent = true;
        const cachedData = userData.get("accountSettings");
        const hasCachedData = Boolean(cachedData) && typeof cachedData === "object" && !Array.isArray(cachedData);
        if (hasCachedData) {
            applyFetchedData(cachedData);
            setIsLoading(false);
        } else {
            setFetchedData(null);
            setForm(emptyForm);
            setIsLoading(true);
        }
        fetchAccountSettings(controller).then((result) => {
            if (!isCurrent || controller.signal.aborted) {
                return;
            }
            setIsLoading(false);
            if (result.ok) {
                setFetchError("");
                if (result.data && typeof result.data === "object" && !Array.isArray(result.data)) {
                    applyFetchedData(result.data);
                }
            } else {
                const error = result.error ?? "Les paramètres du compte n'ont pas pu être récupérés";
                setFetchError(error);
                createNotification(<span className="emphasis">{error}</span>);
                if (error === "Identifiant de connexion introuvable, reconnectez-vous" || error === "Non disponible en mode invité") {
                    setIsHidden(true);
                }
            }
        });
        return () => {
            isCurrent = false;
            controller.abort();
        };
    }, [activeAccount]);

    if (isHidden) {
        return null;
    }

    const questionOptions = Array.isArray(fetchedData?.questionsPossibles) ? fetchedData.questionsPossibles : [];
    const isKnownQuestion = questionOptions.includes(form.questionSecrete);

    return (
        <section className="frame" id="account-settings">
            <h2 className="frame-heading">Paramètres du compte</h2>
            {isGuest ? (
                <div className="no-available-documents">
                    <ConfusedCanardman className="sleeping-logo" alt="Canardman confus" />
                    <span>Non disponible en mode invité</span>
                </div>
            ) : isLoading ? (
                <div className="account-settings-loader">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div className="account-settings-field" key={index}>
                            <ContentLoader
                                animate={settings.get("displayMode") === "quality"}
                                speed={1}
                                backgroundColor={actualDisplayTheme === "dark" ? "#5b5abd" : "#9595cc"}
                                foregroundColor={actualDisplayTheme === "dark" ? "#494897" : "#b0b0f2"}
                                height="16"
                                style={{ width: `${30 + index * 10}%` }}
                            >
                                <rect x="0" y="0" rx="5" ry="5" width="100%" height="100%" />
                            </ContentLoader>
                            <ContentLoader
                                animate={settings.get("displayMode") === "quality"}
                                speed={1}
                                backgroundColor={actualDisplayTheme === "dark" ? "#5b5abd" : "#9595cc"}
                                foregroundColor={actualDisplayTheme === "dark" ? "#494897" : "#b0b0f2"}
                                height="48"
                                style={{ width: "100%" }}
                            >
                                <rect x="0" y="0" rx="15" ry="15" width="100%" height="100%" />
                            </ContentLoader>
                        </div>
                    ))}
                </div>
            ) : (
                <form className="account-settings-form" onSubmit={handleSave}>
                    {isStreamerModeEnabled && <p className="account-settings-streamer-note">Mode streamer : vos informations personnelles sont masquées.</p>}
                    <WarningMessage condition={fetchError}>{fetchError}</WarningMessage>
                    <div className="account-settings-field">
                        <span className="account-settings-label">Identifiant</span>
                        <TextInput
                            textType="text"
                            value={isStreamerModeEnabled ? streamerMasks.identifiant : form.identifiant}
                            onChange={(event) => handleFieldChange("identifiant", event)}
                            disabled={isStreamerModeEnabled}
                        />
                    </div>
                    <div className="account-settings-field">
                        <span className="account-settings-label">E-mail</span>
                        <TextInput
                            textType="email"
                            value={isStreamerModeEnabled ? streamerMasks.email : form.email}
                            onChange={(event) => handleFieldChange("email", event)}
                            disabled={isStreamerModeEnabled}
                        />
                    </div>
                    <div className="account-settings-field">
                        <span className="account-settings-label">Téléphone portable</span>
                        <TextInput
                            textType="text"
                            value={isStreamerModeEnabled ? streamerMasks.portable : form.portable}
                            onChange={(event) => handleFieldChange("portable", event)}
                            disabled={isStreamerModeEnabled}
                        />
                    </div>
                    <div className="account-settings-field">
                        <span className="account-settings-label">Question secrète</span>
                        {isKnownQuestion && Boolean(form.questionSecrete) ? (
                            <DropDownMenu
                                name="account-settings-question"
                                options={questionOptions}
                                selected={form.questionSecrete}
                                onChange={handleQuestionChange}
                                className="account-settings-question"
                            />
                        ) : (
                            <TextInput
                                textType="text"
                                value={form.questionSecrete}
                                onChange={(event) => handleFieldChange("questionSecrete", event)}
                            />
                        )}
                    </div>
                    <div className="account-settings-field">
                        <span className="account-settings-label">Réponse secrète</span>
                        <TextInput
                            textType="password"
                            value={form.reponse}
                            onChange={(event) => handleFieldChange("reponse", event)}
                        />
                    </div>
                    <div className="account-settings-field">
                        <span className="account-settings-label">Nouveau mot de passe</span>
                        <TextInput
                            textType="password"
                            value={form.nouveauMotDePasse}
                            onChange={(event) => handleFieldChange("nouveauMotDePasse", event)}
                            placeholder="Laisser vide pour ne pas changer"
                        />
                    </div>
                    <div className="account-settings-field">
                        <span className="account-settings-label">Confirmation du mot de passe</span>
                        <TextInput
                            textType="password"
                            value={form.confirmationMotDePasse}
                            onChange={(event) => handleFieldChange("confirmationMotDePasse", event)}
                            placeholder="Laisser vide pour ne pas changer"
                        />
                    </div>
                    <WarningMessage condition={saveError}>{saveError}</WarningMessage>
                    <div className="account-settings-buttons">
                        <Button className="account-settings-cancel" onClick={handleReset} disabled={isSaving}>Annuler</Button>
                        <Button buttonType="submit" className="account-settings-save" state={isSaving ? "submitting" : ""}>Enregistrer</Button>
                    </div>
                </form>
            )}
        </section>
    );
}
