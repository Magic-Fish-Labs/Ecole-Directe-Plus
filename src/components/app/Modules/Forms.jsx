import { useContext, useState } from "react";
import { AppContext } from "../../../App";
import Button from "../../generic/UserInputs/Button";
import CheckBox from "../../generic/UserInputs/CheckBox";
import RadioButton from "../../generic/UserInputs/RadioButton";
import EncodedHTMLDiv from "../../generic/CustomDivs/EncodedHTMLDiv";
import { ModulesSkeleton, EmptyState, safeDecode } from "./Shared";

function isFormFinished(form) {
    const fini = form?.participant?.fini;
    return fini !== undefined && fini !== null && fini !== false && fini !== 0 && fini !== "";
}

function formatFini(fini) {
    if (typeof fini === "string" && /^[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(fini)) {
        const date = new Date(fini);
        if (!Number.isNaN(date.getTime())) {
            return "Complété le " + date.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
        }
    }
    return "Complété";
}

function sortedQuestions(form) {
    return (Array.isArray(form?.questions) ? form.questions : [])
        .slice()
        .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));
}

function buildInitialAnswers(form) {
    const initial = {};
    sortedQuestions(form).forEach((question) => {
        const chosen = (Array.isArray(question.propositions) ? question.propositions : [])
            .filter((proposition) => proposition.choisie)
            .map((proposition) => proposition.id);
        if (chosen.length > 0) {
            initial[question.id] = chosen;
        }
    });
    return initial;
}

function FormQuestion({ question, value, error, disabled, onRadioChange, onCheckboxToggle, onTextChange }) {
    const label = safeDecode(question.question) || "Question";
    const statement = safeDecode(question.enonce);
    const typeQ = question.typeQ ?? "radio";
    const propositions = (Array.isArray(question.propositions) ? question.propositions : [])
        .slice()
        .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));
    const required = !!question.required;
    const minChecks = Number(question.minChecks) || 0;
    const maxChecks = Number(question.maxChecks) || 0;
    const selected = Array.isArray(value) ? value : [];

    return (
        <fieldset className={`form-question${error ? " invalid" : ""}`}>
            <legend className="question-label">
                {label}
                {required && <span className="required-mark"> *</span>}
            </legend>
            {statement && statement !== label && <p className="question-statement">{statement}</p>}
            {typeQ === "textarea" ? (
                <textarea
                    className="form-textarea"
                    value={typeof selected[0] === "string" ? selected[0] : ""}
                    disabled={disabled}
                    placeholder="Votre réponse"
                    onChange={(event) => onTextChange(question.id, event.target.value)}
                />
            ) : (
                <div className="propositions">
                    {propositions.map((proposition, index) => {
                        const propositionId = proposition.id !== undefined ? proposition.id : index;
                        const propositionLabel = safeDecode(proposition.enonce) || "…";
                        if (typeQ === "checkbox") {
                            return (
                                <CheckBox
                                    key={propositionId}
                                    id={`q-${question.id}-p-${index}`}
                                    label={propositionLabel}
                                    checked={selected.includes(propositionId)}
                                    disabled={disabled}
                                    onChange={() => onCheckboxToggle(question, propositionId)}
                                />
                            );
                        }
                        return (
                            <RadioButton
                                key={propositionId}
                                id={`q-${question.id}-p-${index}`}
                                fieldsetName={`q-${question.id}`}
                                checked={selected[0] === propositionId}
                                disabled={disabled}
                                onChange={() => onRadioChange(question.id, propositionId)}
                            >
                                {propositionLabel}
                            </RadioButton>
                        );
                    })}
                </div>
            )}
            {typeQ !== "textarea" && (minChecks > 0 || maxChecks > 0) && (
                <span className="question-hint">
                    {minChecks > 0 && maxChecks > 0
                        ? `Entre ${minChecks} et ${maxChecks} réponses`
                        : minChecks > 0
                            ? `Au moins ${minChecks} réponse${minChecks > 1 ? "s" : ""}`
                            : `Au maximum ${maxChecks} réponse${maxChecks > 1 ? "s" : ""}`}
                </span>
            )}
            {error && <p className="question-error">{error}</p>}
        </fieldset>
    );
}

function FormViewer({ form, onBack }) {
    const { submitFormAnswers, createNotification } = useContext(AppContext);
    const finished = isFormFinished(form);
    const formulaire = form.formulaire ?? {};
    const questions = sortedQuestions(form);
    const [answers, setAnswers] = useState(() => buildInitialAnswers(form));
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    function handleRadioChange(questionId, propositionId) {
        setAnswers((old) => ({ ...old, [questionId]: [propositionId] }));
        setErrors((old) => {
            if (!old[questionId]) {
                return old;
            }
            const next = { ...old };
            delete next[questionId];
            return next;
        });
    }

    function handleTextChange(questionId, text) {
        setAnswers((old) => ({ ...old, [questionId]: [text] }));
        setErrors((old) => {
            if (!old[questionId]) {
                return old;
            }
            const next = { ...old };
            delete next[questionId];
            return next;
        });
    }

    function handleCheckboxToggle(question, propositionId) {
        const current = Array.isArray(answers[question.id]) ? answers[question.id] : [];
        const maxChecks = Number(question.maxChecks) || 0;
        if (current.includes(propositionId)) {
            setAnswers((old) => ({ ...old, [question.id]: current.filter((id) => id !== propositionId) }));
            return;
        }
        if (maxChecks > 0 && current.length >= maxChecks) {
            createNotification(<p>Sélectionnez au maximum {maxChecks} réponse{maxChecks > 1 ? "s" : ""}</p>);
            return;
        }
        setAnswers((old) => ({ ...old, [question.id]: [...current, propositionId] }));
        setErrors((old) => {
            if (!old[question.id]) {
                return old;
            }
            const next = { ...old };
            delete next[question.id];
            return next;
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const newErrors = {};
        questions.forEach((question) => {
            const value = answers[question.id];
            const selected = Array.isArray(value) ? value : [];
            if (question.required && selected.length === 0) {
                newErrors[question.id] = "Cette question est obligatoire";
                return;
            }
            if ((question.typeQ ?? "radio") === "checkbox" && selected.length > 0) {
                const minChecks = Number(question.minChecks) || 0;
                const maxChecks = Number(question.maxChecks) || 0;
                if (minChecks > 0 && selected.length < minChecks) {
                    newErrors[question.id] = `Sélectionnez au moins ${minChecks} réponse${minChecks > 1 ? "s" : ""}`;
                } else if (maxChecks > 0 && selected.length > maxChecks) {
                    newErrors[question.id] = `Sélectionnez au plus ${maxChecks} réponse${maxChecks > 1 ? "s" : ""}`;
                }
            }
        });
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        setIsSubmitting(true);
        try {
            const result = await submitFormAnswers(form, answers);
            if (result?.ok) {
                createNotification(<p>Formulaire envoyé</p>);
                onBack(true);
            } else {
                createNotification(<p>{result?.error ?? "Le formulaire n'a pas pu être envoyé"}</p>);
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="form-viewer">
            <div className="detail-header">
                <Button className="back-button" onClick={() => onBack(false)}>← Retour</Button>
                <h3 className="card-title">{formulaire.titre ?? "Formulaire"}</h3>
                {finished && <span className="module-badge badge-done">{formatFini(form.participant?.fini)}</span>}
            </div>
            {formulaire.introduction && <EncodedHTMLDiv className="form-introduction">{formulaire.introduction}</EncodedHTMLDiv>}
            <form className="form-questions" onSubmit={handleSubmit} noValidate>
                {questions.length === 0 && <p className="form-empty">Ce formulaire ne contient aucune question</p>}
                {questions.map((question, index) => (
                    <FormQuestion
                        key={question.id ?? index}
                        question={question}
                        value={answers[question.id]}
                        error={errors[question.id]}
                        disabled={finished || isSubmitting}
                        onRadioChange={handleRadioChange}
                        onCheckboxToggle={handleCheckboxToggle}
                        onTextChange={handleTextChange}
                    />
                ))}
                {formulaire.conclusion && <EncodedHTMLDiv className="form-conclusion">{formulaire.conclusion}</EncodedHTMLDiv>}
                {formulaire.signature && <p className="form-signature">{formulaire.signature}</p>}
                {!finished && (
                    <div className="form-actions">
                        <Button buttonType="submit" disabled={isSubmitting} className={isSubmitting ? "submitting" : ""}>
                            {isSubmitting ? "Envoi…" : "Envoyer"}
                        </Button>
                    </div>
                )}
            </form>
        </div>
    );
}

export default function Forms({ isLoading, forms, onListChange }) {
    const [selectedForm, setSelectedForm] = useState(null);

    if (isLoading) {
        return <ModulesSkeleton />;
    }

    const list = Array.isArray(forms) ? forms : [];
    if (list.length === 0) {
        return <EmptyState message="Aucun formulaire disponible" />;
    }

    if (selectedForm) {
        const fresh = list.find((form) => String(form.id) === String(selectedForm.id)) ?? selectedForm;
        return (
            <FormViewer
                form={fresh}
                onBack={(refreshed) => {
                    setSelectedForm(null);
                    if (refreshed) {
                        onListChange();
                    }
                }}
            />
        );
    }

    return (
        <div className="forms-list">
            {list.map((form, index) => {
                const finished = isFormFinished(form);
                const titre = form.formulaire?.titre ?? form.titre ?? "Formulaire";
                const questionsCount = Array.isArray(form.questions) ? form.questions.length : 0;
                return (
                    <article className="module-card form-card" key={form.id ?? index}>
                        <div className="form-info">
                            <div className="workspace-title-row">
                                <h3 className="card-title">{titre}</h3>
                                <span className={`module-badge ${finished ? "badge-done" : "badge-todo"}`}>
                                    {finished ? formatFini(form.participant?.fini) : "À compléter"}
                                </span>
                            </div>
                            {questionsCount > 0 && (
                                <span className="card-meta">{questionsCount} question{questionsCount > 1 ? "s" : ""}</span>
                            )}
                            {form.formulaire?.typeF && <span className="card-meta">Type : {form.formulaire.typeF}</span>}
                        </div>
                        <div className="card-actions">
                            <Button onClick={() => setSelectedForm(form)}>
                                {finished ? "Consulter" : "Compléter"}
                            </Button>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
