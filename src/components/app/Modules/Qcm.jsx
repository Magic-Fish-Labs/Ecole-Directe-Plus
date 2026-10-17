import { useContext, useMemo, useState } from "react";
import { AppContext } from "../../../App";
import Button from "../../generic/UserInputs/Button";
import { MaybeEncodedHTML, ModulesSkeleton, EmptyState, GenericDataList, safeDecode, encodeBase64 } from "./Shared";

import "./Qcm.css";

function normalizeAssociation(item) {
    const qcm = item?.qcm ?? {};
    const participant = item?.participant ?? {};
    const association = item?.association ?? {};
    return {
        idQCM: Number(item?.idQCM ?? qcm.id ?? 0),
        idAssociation: Number(item?.idAssociation ?? association.id ?? 0),
        titre: item?.titre ?? qcm.titre ?? item?.libelle ?? "Questionnaire",
        debute: item?.debute ?? participant.debut ?? participant.debute ?? null,
        fini: item?.fini ?? participant.fini ?? null,
        disponible: item?.disponible ?? qcm.disponible ?? true,
        idParticipant: Number(participant.idParticipant ?? item?.idParticipant ?? 0),
        peutVoirSolutions: Boolean(participant.peutVoirSolutions),
        raw: item,
    };
}

function initialChoix(reponse) {
    const choix = reponse?.choix;
    if (Array.isArray(choix)) {
        return [...choix];
    }
    if (choix && typeof choix === "object") {
        return { ...choix };
    }
    if (choix === null || choix === undefined || choix === "") {
        return null;
    }
    return choix;
}

function propositionLabel(proposition) {
    const enonce = proposition?.enonce ?? proposition?.libelle ?? "";
    return safeDecode(enonce);
}

export default function Qcm({ isLoading, qcms }) {
    const { fetchQcmQuestionnaire, saveQcmAnswer, setQcmParticipantState, fetchQcmResult } = useContext(AppContext);

    const [selected, setSelected] = useState(null);
    const [questionnaire, setQuestionnaire] = useState(null);
    const [loadingQuestionnaire, setLoadingQuestionnaire] = useState(false);
    const [error, setError] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [saving, setSaving] = useState(false);
    const [ended, setEnded] = useState(false);
    const [result, setResult] = useState(undefined);

    const associations = useMemo(
        () => (Array.isArray(qcms) ? qcms.map(normalizeAssociation).filter((item) => item.idQCM > 0) : []),
        [qcms],
    );

    const questions = questionnaire?.questions ?? [];
    const reponses = questionnaire?.reponses ?? [];
    const participant = questionnaire?.participant ?? selected?.participant ?? {};
    const activeQuestion = questions[activeIndex];
    const activeReponse = reponses.find((item) => item.idQuestion === activeQuestion?.id);
    const isLastQuestion = activeIndex >= questions.length - 1;

    async function openQcm(association) {
        setSelected(association);
        setLoadingQuestionnaire(true);
        setError("");
        setQuestionnaire(null);
        setAnswers({});
        setEnded(false);
        setResult(undefined);
        setActiveIndex(0);
        try {
            if (!association.fini) {
                await setQcmParticipantState({
                    idQCM: association.idQCM,
                    idAssociation: association.idAssociation,
                    idParticipant: association.idParticipant,
                    action: "updateStartDate",
                });
            }
            const data = await fetchQcmQuestionnaire({
                idQCM: association.idQCM,
                idAssociation: association.idAssociation,
            });
            setQuestionnaire(data);
            const loadedReponses = Array.isArray(data?.reponses) ? data.reponses : [];
            const initialAnswers = {};
            for (const reponse of loadedReponses) {
                initialAnswers[reponse.idQuestion] = initialChoix(reponse);
            }
            setAnswers(initialAnswers);
            const firstUnansweredIndex = (data?.questions ?? []).findIndex(
                (question) => !loadedReponses.some((reponse) => reponse.idQuestion === question.id && reponse.repondu),
            );
            setActiveIndex(firstUnansweredIndex > -1 ? firstUnansweredIndex : 0);
        } catch (questionnaireError) {
            setError(questionnaireError?.message || "Le questionnaire n’a pas pu être chargé.");
        } finally {
            setLoadingQuestionnaire(false);
        }
    }

    function closeQuestionnaire() {
        setSelected(null);
        setQuestionnaire(null);
        setError("");
        setResult(undefined);
        setEnded(false);
    }

    function updateAnswer(updater) {
        setAnswers((old) => {
            const current = old[activeQuestion?.id];
            return { ...old, [activeQuestion.id]: updater(current) };
        });
    }

    function handleRadioChange(propositionId) {
        updateAnswer(() => propositionId);
    }

    function handleCheckboxChange(propositionId, checked) {
        updateAnswer((current) => {
            const list = Array.isArray(current) ? [...current] : [];
            const index = list.findIndex((item) => `${item}` === `${propositionId}`);
            if (checked && index === -1) {
                list.push(propositionId);
            }
            if (!checked && index > -1) {
                list.splice(index, 1);
            }
            return list.sort((a, b) => Number(a) - Number(b));
        });
    }

    function handleTextHoleChange(propositionId, text) {
        updateAnswer((current) => {
            const map = current && typeof current === "object" && !Array.isArray(current) ? { ...current } : {};
            map[propositionId] = text;
            return map;
        });
    }

    function buildChoixPayload() {
        const current = answers[activeQuestion.id];
        switch (activeQuestion.typeQ) {
            case "radio":
                return current ?? null;
            case "checkbox":
                return Array.isArray(current) ? [...current].sort((a, b) => Number(a) - Number(b)) : [];
            case "textholes": {
                const map = current && typeof current === "object" && !Array.isArray(current) ? current : {};
                const payload = {};
                for (const proposition of activeQuestion.propositions ?? []) {
                    const text = map[proposition.id];
                    payload[proposition.id] = text ? encodeBase64(text) : "";
                }
                return payload;
            }
            default:
                return current ?? null;
        }
    }

    async function handleSave({ goNext = false } = {}) {
        if (!activeQuestion || saving) {
            return;
        }
        setSaving(true);
        setError("");
        try {
            const payload = {
                id: activeReponse?.id ?? 0,
                idQuestion: activeQuestion.id,
                idParticipant: activeReponse?.idParticipant ?? participant.idParticipant ?? selected.idParticipant,
                choix: buildChoixPayload(),
            };
            await saveQcmAnswer({
                idQCM: selected.idQCM,
                idAssociation: selected.idAssociation,
                idParticipant: payload.idParticipant,
                reponse: payload,
            });
            if (isLastQuestion) {
                await setQcmParticipantState({
                    idQCM: selected.idQCM,
                    idAssociation: selected.idAssociation,
                    idParticipant: payload.idParticipant,
                    action: "updateEndDate",
                });
                setEnded(true);
                await loadResult();
            } else if (goNext) {
                setActiveIndex((index) => Math.min(index + 1, questions.length - 1));
            }
        } catch (saveError) {
            setError(saveError?.message || "La réponse n’a pas pu être enregistrée.");
        } finally {
            setSaving(false);
        }
    }

    async function loadResult() {
        try {
            const data = await fetchQcmResult({
                idQCM: selected.idQCM,
                idAssociation: selected.idAssociation,
            });
            setResult(data ?? null);
        } catch (resultError) {
            setResult(null);
        }
    }

    if (isLoading) {
        return <ModulesSkeleton />;
    }

    if (!selected) {
        if (associations.length === 0) {
            return <EmptyState message="Aucun QCM disponible" graphic="confused" />;
        }
        return (
            <ul className="qcm-list">
                {associations.map((association) => {
                    const isFinished = Boolean(association.fini);
                    const isStarted = Boolean(association.debute) && !isFinished;
                    return (
                        <li className="qcm-card" key={`${association.idQCM}-${association.idAssociation}`}>
                            <div className="qcm-card-header">
                                <h3 className="qcm-card-title">{association.titre}</h3>
                                <div className="qcm-card-badges">
                                    {!association.disponible && <span className="qcm-badge qcm-badge-disabled">Indisponible</span>}
                                    {isFinished && <span className="qcm-badge qcm-badge-done">Terminé</span>}
                                    {isStarted && <span className="qcm-badge qcm-badge-progress">En cours</span>}
                                </div>
                            </div>
                            <div className="qcm-card-actions">
                                <Button onClick={() => openQcm(association)} disabled={!association.disponible}>
                                    {isFinished ? "Revoir" : isStarted ? "Reprendre" : "Répondre"}
                                </Button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        );
    }

    if (loadingQuestionnaire) {
        return <ModulesSkeleton cards={2} />;
    }

    if (error && !questionnaire) {
        return (
            <div className="qcm-error">
                <p>{error}</p>
                <Button onClick={closeQuestionnaire}>Retour</Button>
            </div>
        );
    }

    const currentChoix = answers[activeQuestion?.id];
    const reponseForActive = reponses.find((item) => item.idQuestion === activeQuestion?.id);
    const alreadyAnswered = Boolean(reponseForActive?.repondu);

    return (
        <div className="qcm-questionnaire">
            <div className="qcm-questionnaire-header">
                <Button className="qcm-back-button" onClick={closeQuestionnaire}>← Retour</Button>
                <h3 className="qcm-questionnaire-title">{selected.titre}</h3>
                {questions.length > 0 && (
                    <span className="qcm-progress">Question {activeIndex + 1}/{questions.length}</span>
                )}
            </div>
            {error && <p className="qcm-error-message">{error}</p>}
            {ended && (
                <div className="qcm-ended-banner">
                    Questionnaire terminé. Vos réponses ont été enregistrées.
                    {result !== undefined && (
                        <Button onClick={loadResult}>Recharger le résultat</Button>
                    )}
                </div>
            )}
            {result !== undefined && (
                <div className="qcm-result">
                    <h4>Résultat</h4>
                    {result === null
                        ? <p>Le résultat n’est pas encore disponible.</p>
                        : <GenericDataList data={result} emptyMessage="Aucun résultat disponible" />}
                </div>
            )}
            {activeQuestion ? (
                <div className="qcm-question">
                    <MaybeEncodedHTML className="qcm-question-enonce" value={activeQuestion.enonce} />
                    <MaybeEncodedHTML className="qcm-question-text" value={activeQuestion.question} />
                    {activeQuestion.typeQ === "textholes" ? (
                        <ul className="qcm-choices qcm-text-holes">
                            {(activeQuestion.propositions ?? []).map((proposition) => {
                                const stored = currentChoix && typeof currentChoix === "object" ? currentChoix[proposition.id] : undefined;
                                return (
                                    <li key={proposition.id} className="qcm-text-hole">
                                        <span className="qcm-hole-label">{propositionLabel(proposition)}</span>
                                        <input
                                            type="text"
                                            value={safeDecode(stored ?? "")}
                                            onChange={(event) => handleTextHoleChange(proposition.id, event.target.value)}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <ul className={`qcm-choices ${activeQuestion.typeQ}`}>
                            {(activeQuestion.propositions ?? []).map((proposition) => {
                                const optionId = proposition.id;
                                const isChecked = activeQuestion.typeQ === "radio"
                                    ? `${currentChoix}` === `${optionId}`
                                    : Array.isArray(currentChoix) && currentChoix.some((item) => `${item}` === `${optionId}`);
                                return (
                                    <li key={optionId} className="qcm-choice">
                                        <label>
                                            <input
                                                type={activeQuestion.typeQ === "checkbox" ? "checkbox" : "radio"}
                                                name={`qcm-question-${activeQuestion.id}`}
                                                checked={isChecked}
                                                onChange={(event) => (
                                                    activeQuestion.typeQ === "checkbox"
                                                        ? handleCheckboxChange(optionId, event.target.checked)
                                                        : handleRadioChange(optionId)
                                                )}
                                            />
                                            <MaybeEncodedHTML value={proposition.enonce ?? proposition.libelle ?? ""} />
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                    <div className="qcm-question-footer">
                        {alreadyAnswered && <span className="qcm-saved-flag">Réponse déjà enregistrée</span>}
                        <div className="qcm-question-actions">
                            <Button onClick={() => setActiveIndex((index) => Math.max(index - 1, 0))} disabled={activeIndex === 0 || saving}>
                                Précédente
                            </Button>
                            {!isLastQuestion && (
                                <>
                                    <Button onClick={() => handleSave({ goNext: false })} disabled={saving}>
                                        {saving ? "Enregistrement…" : "Enregistrer"}
                                    </Button>
                                    <Button onClick={() => handleSave({ goNext: true })} disabled={saving}>
                                        Enregistrer et suivante
                                    </Button>
                                </>
                            )}
                            {isLastQuestion && (
                                <Button onClick={() => handleSave({ goNext: false })} disabled={saving}>
                                    {saving ? "Enregistrement…" : "Terminer"}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <EmptyState message="Ce questionnaire ne contient aucune question" graphic="confused" />
            )}
        </div>
    );
}
