import { useState, useEffect, useContext, useRef } from "react";
import { AppContext } from "../../../App";

import "./MessageComposer.css";
import TextInput from "../../generic/UserInputs/TextInput";
import Button from "../../generic/UserInputs/Button";
import ScrollShadedDiv from "../../generic/CustomDivs/ScrollShadedDiv";
import { decodeBase64, removeAccents } from "../../../utils/utils";
import AttachmentIcon from "../../graphics/AttachmentIcon";
import DeleteIcon from "../../graphics/DeleteIcon";


const CONTACT_TABS = [
    { value: "professeurs", label: "Professeurs" },
    { value: "personnels", label: "Personnel" },
    { value: "entreprises", label: "Entreprises" },
    { value: "correspondants", label: "Correspondants" },
];

const COMPOSER_TITLES = {
    new: "Nouveau message",
    reply: "Répondre",
    forward: "Transférer",
    draft: "Modifier le brouillon",
};

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function bodyToHtml(text) {
    return text.split(/\r?\n/).map((line) => `<p>${escapeHtml(line) || "<br>"}</p>`).join("");
}

function htmlToText(html) {
    const container = document.createElement("div");
    container.innerHTML = html;
    container.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
    container.querySelectorAll("p, div, li, blockquote").forEach((block) => {
        block.append(document.createTextNode("\n"));
        block.replaceWith(...block.childNodes);
    });
    return container.textContent.replace(/\n{3,}/g, "\n\n").trim();
}

function formatContactName(contact) {
    const fullName = [contact.civilite, contact.prenom, (contact.particule ?? "") + (contact.nom ?? "")].filter((part) => part && String(part).trim() !== "").join(" ");
    return fullName || contact.email || `Contact ${contact.id}`;
}

function contactKey(contact) {
    return `${contact.type ?? "P"}_${contact.id}`;
}

function mapMessageSenderToContact(sender) {
    return { ...sender, type: sender.role === "P" ? "P" : "A" };
}

function buildForwardQuote(message) {
    const header = ["--- Message transféré ---"];
    if (message.from) {
        header.push(`De : ${formatContactName(message.from)}`);
    }
    if (message.date) {
        header.push(`Date : ${new Date(message.date).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })}`);
    }
    if (message.subject) {
        header.push(`Objet : ${message.subject}`);
    }
    let content = "";
    if (message.content?.content) {
        try {
            content = htmlToText(decodeBase64(message.content.content));
        } catch {
            content = "";
        }
    }
    return [...header, "", content].join("\n");
}


export default function MessageComposer({ onClose, mode = "new", initialMessage = null, fetchMessageContent, canSendMessages = true }) {
    // States
    const { useUserData, accountsListState, activeAccount, createNotification, fetchContacts, sendMessage, uploadTemporaryFile } = useContext(AppContext);
    const isGuest = accountsListState[activeAccount]?.firstName === "Guest";

    const messagesData = useUserData("sortedMessages");
    const contactsData = useUserData("contacts");

    const [recipients, setRecipients] = useState([]);
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [files, setFiles] = useState([]);
    const [activeTab, setActiveTab] = useState("professeurs");
    const [search, setSearch] = useState("");
    const [contactsByType, setContactsByType] = useState(() => contactsData.get() ?? {});
    const [isLoadingContacts, setIsLoadingContacts] = useState(false);
    const [inlineError, setInlineError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);
    const fileKeyRef = useRef(0);
    const forwardQuoteFilled = useRef(false);
    const draftBodyFilled = useRef(false);

    // behavior
    useEffect(() => {
        if (!initialMessage) {
            return;
        }
        if (mode === "reply") {
            setSubject(initialMessage.subject && /^re\s*:/i.test(initialMessage.subject) ? initialMessage.subject : `Re: ${initialMessage.subject ?? ""}`);
            if (initialMessage.from) {
                setRecipients([mapMessageSenderToContact(initialMessage.from)]);
            }
        } else if (mode === "forward") {
            setSubject(initialMessage.subject && /^tr\s*:/i.test(initialMessage.subject) ? initialMessage.subject : `Tr: ${initialMessage.subject ?? ""}`);
        } else if (mode === "draft") {
            setSubject(initialMessage.subject ?? "");
            if (Array.isArray(initialMessage.to) && initialMessage.to.length > 0) {
                setRecipients(initialMessage.to.map((contact) => ({ ...contact, type: contact.type ?? (contact.role === "P" ? "P" : "A") })));
            }
            if (initialMessage.content?.content) {
                draftBodyFilled.current = true;
                try {
                    setBody(htmlToText(decodeBase64(initialMessage.content.content)));
                } catch {
                    setBody("");
                }
            }
        }
    }, []);

    useEffect(() => {
        if ((mode === "forward" || mode === "draft") && initialMessage && !initialMessage.content && fetchMessageContent) {
            const controller = new AbortController();
            fetchMessageContent(initialMessage.id, controller);
            return () => {
                controller.abort();
            };
        }
    }, []);

    useEffect(() => {
        if (mode === "forward" && initialMessage && !forwardQuoteFilled.current) {
            const freshMessage = messagesData.get()?.find((item) => item.id === initialMessage.id);
            if (freshMessage?.content?.content) {
                forwardQuoteFilled.current = true;
                setBody((oldBody) => oldBody || buildForwardQuote(freshMessage));
            }
        }
        if (mode === "draft" && initialMessage && !draftBodyFilled.current) {
            const freshMessage = messagesData.get()?.find((item) => item.id === initialMessage.id);
            if (freshMessage?.content?.content) {
                draftBodyFilled.current = true;
                let draftText = "";
                try {
                    draftText = htmlToText(decodeBase64(freshMessage.content.content));
                } catch {
                    draftText = "";
                }
                setBody((oldBody) => oldBody || draftText);
            }
        }
    });

    useEffect(() => {
        if (activeTab === "correspondants") {
            return;
        }
        const cachedContacts = contactsData.get()?.[activeTab];
        if (Array.isArray(cachedContacts) && cachedContacts.length > 0) {
            setContactsByType((old) => ({ ...old, [activeTab]: cachedContacts }));
            return;
        }
        if (isGuest) {
            return;
        }
        let cancelled = false;
        setIsLoadingContacts(true);
        fetchContacts(activeTab).then((contacts) => {
            if (!cancelled) {
                setContactsByType((old) => ({ ...old, [activeTab]: contacts }));
                setIsLoadingContacts(false);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [activeTab, isGuest]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (inlineError !== "") {
            setInlineError("");
        }
    }, [recipients, subject, body]);

    const correspondants = (() => {
        const seen = new Set();
        const list = [];
        for (const message of messagesData.get() ?? []) {
            if (!message.from) {
                continue;
            }
            const contact = mapMessageSenderToContact(message.from);
            const key = contactKey(contact);
            if (!seen.has(key)) {
                seen.add(key);
                list.push(contact);
            }
        }
        list.sort((a, b) => formatContactName(a).localeCompare(formatContactName(b), "fr"));
        return list;
    })();

    const displayedContacts = activeTab === "correspondants" ? correspondants : (contactsByType[activeTab] ?? []);
    const selectedContactKeys = new Set(recipients.map(contactKey));
    const filteredContacts = displayedContacts.filter((contact) => {
        const query = removeAccents(search.trim().toLowerCase());
        return query === "" || removeAccents(formatContactName(contact).toLowerCase()).includes(query);
    });

    const isUploadingFiles = files.some((file) => file.uploading);

    const toggleRecipient = (contact) => {
        if (!canSendMessages) {
            return;
        }
        setRecipients((oldRecipients) => {
            const key = contactKey(contact);
            if (oldRecipients.some((item) => contactKey(item) === key)) {
                return oldRecipients.filter((item) => contactKey(item) !== key);
            }
            return [...oldRecipients, contact];
        });
    };

    const removeRecipient = (contact) => {
        setRecipients((oldRecipients) => oldRecipients.filter((item) => contactKey(item) !== contactKey(contact)));
    };

    const handleFilesChange = (event) => {
        const chosenFiles = Array.from(event.target.files ?? []);
        event.target.value = "";
        if (chosenFiles.length === 0) {
            return;
        }
        if (isGuest) {
            createNotification(<p>Non disponible en mode invité</p>);
            return;
        }
        for (const file of chosenFiles) {
            const fileKey = fileKeyRef.current;
            fileKeyRef.current += 1;
            setFiles((oldFiles) => [...oldFiles, { key: fileKey, name: file.name, unc: null, libelle: null, uploading: true }]);
            uploadTemporaryFile(file).then((result) => {
                if (result.ok) {
                    setFiles((oldFiles) => oldFiles.map((entry) => (entry.key === fileKey ? { ...entry, uploading: false, unc: result.unc, libelle: result.libelle } : entry)));
                } else {
                    setFiles((oldFiles) => oldFiles.filter((entry) => entry.key !== fileKey));
                    createNotification(<p>{result.error ?? "Le fichier n'a pas pu être téléversé"}</p>);
                }
            });
        }
    };

    const removeFile = (fileKey) => {
        setFiles((oldFiles) => oldFiles.filter((entry) => entry.key !== fileKey));
    };

    const handleSubmit = async (asDraft) => {
        if (isGuest) {
            createNotification(<p>Non disponible en mode invité</p>);
            return;
        }
        if (!asDraft && recipients.length < 1) {
            setInlineError("Ajoutez au moins un destinataire");
            return;
        }
        if (isUploadingFiles) {
            setInlineError("Veuillez patienter pendant l'envoi des fichiers joints");
            return;
        }
        setIsSubmitting(true);
        const result = await sendMessage({
            subject,
            html: bodyToHtml(body),
            recipients,
            files: files.map((file) => ({ unc: file.unc, libelle: file.libelle })),
            draft: asDraft,
            replyTo: mode === "reply" ? initialMessage?.id : null,
            forwardOf: mode === "forward" ? initialMessage?.id : null,
            existingId: mode === "draft" ? initialMessage?.id : null,
        });
        setIsSubmitting(false);
        if (result.ok) {
            createNotification(<p>{asDraft ? "Brouillon enregistré" : "Message envoyé"}</p>);
            onClose();
        } else {
            setInlineError(result.error ?? (asDraft ? "Le brouillon n'a pas pu être enregistré" : "Le message n'a pas pu être envoyé"));
        }
    };

    // JSX
    return (
        <div id="message-composer" className="message-composer-overlay" onClick={(event) => event.target === event.currentTarget ? onClose() : null}>
            <div className="message-composer-panel" role="dialog" aria-modal="true" aria-label={COMPOSER_TITLES[mode] ?? COMPOSER_TITLES.new}>
                <div className="message-composer-header">
                    <h3>{COMPOSER_TITLES[mode] ?? COMPOSER_TITLES.new}</h3>
                    <button type="button" className="message-composer-close" onClick={onClose} aria-label="Fermer">✕</button>
                </div>
                <form className="message-composer-form" onKeyDown={(event) => { if (event.key === "Enter" && event.target.tagName === "INPUT") { event.preventDefault(); } }} onSubmit={(event) => { event.preventDefault(); handleSubmit(false); }}>
                    <div className="message-composer-fields">
                        <div className="recipients-field">
                            <span className="composer-field-label">À :</span>
                            {recipients.length > 0
                                ? <ul className="recipients-chips">
                                    {recipients.map((contact) => (
                                        <li key={contactKey(contact)} className="recipient-chip">
                                            <span className="recipient-chip-name">{formatContactName(contact)}</span>
                                            <button type="button" className="recipient-chip-remove" onClick={() => removeRecipient(contact)} aria-label={`Retirer ${formatContactName(contact)}`}>✕</button>
                                        </li>
                                    ))}
                                </ul>
                                : <span className="recipients-placeholder">Aucun destinataire</span>
                            }
                            <TextInput textType="search" placeholder="Rechercher un contact" value={search} onChange={(event) => setSearch(event.target.value)} className="recipients-search-input" />
                            <div className="composer-tabs" role="tablist">
                                {CONTACT_TABS.map((tab) => (
                                    <button type="button" role="tab" aria-selected={activeTab === tab.value} key={tab.value} className={`composer-tab${activeTab === tab.value ? " selected" : ""}`} onClick={() => { setActiveTab(tab.value); setSearch(""); }}>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <ScrollShadedDiv className="contacts-list-container">
                                <ul className="contacts-list">
                                    {isLoadingContacts
                                        ? <li className="contacts-list-hint">Chargement des contacts...</li>
                                        : filteredContacts.length > 0
                                            ? filteredContacts.map((contact) => {
                                                const key = contactKey(contact);
                                                const isSelected = selectedContactKeys.has(key);
                                                return (
                                                    <li key={key}>
                                                        <button type="button" className={`contact-entry${isSelected ? " selected" : ""}`} disabled={!canSendMessages} onClick={() => toggleRecipient(contact)}>
                                                            <span className="contact-entry-name">{formatContactName(contact)}</span>
                                                            {contact.matiere ? <span className="contact-entry-detail">{contact.matiere}</span> : null}
                                                            {contact.fonctionPersonnel ? <span className="contact-entry-detail">{contact.fonctionPersonnel}</span> : null}
                                                        </button>
                                                    </li>
                                                );
                                            })
                                            : <li className="contacts-list-hint">{isGuest ? "Non disponible en mode invité" : "Aucun contact trouvé"}</li>
                                    }
                                </ul>
                            </ScrollShadedDiv>
                        </div>
                        <TextInput textType="text" placeholder="Objet" value={subject} onChange={(event) => setSubject(event.target.value)} className="subject-input" />
                        <textarea className="composer-body-textarea" placeholder="Rédigez votre message..." value={body} onChange={(event) => setBody(event.target.value)}></textarea>
                    </div>
                    <div className="composer-attachments">
                        <input ref={fileInputRef} type="file" multiple className="composer-file-input" onChange={handleFilesChange} tabIndex={-1} />
                        <button type="button" className="attach-file-button" onClick={() => fileInputRef.current?.click()}>
                            <AttachmentIcon className="attach-file-icon" />
                            Joindre des fichiers
                        </button>
                        {files.length > 0
                            ? <ul className="composer-files-list">
                                {files.map((file) => (
                                    <li key={file.key} className="composer-file-chip" data-uploading={file.uploading}>
                                        {file.uploading
                                            ? <span className="file-upload-spinner" aria-hidden="true"></span>
                                            : <AttachmentIcon className="composer-file-icon" />
                                        }
                                        <span className="composer-file-name">{file.libelle ?? file.name}</span>
                                        <button type="button" className="remove-file-button" onClick={() => removeFile(file.key)} aria-label={`Retirer ${file.libelle ?? file.name}`}><DeleteIcon className="remove-file-icon" /></button>
                                    </li>
                                ))}
                            </ul>
                            : null
                        }
                    </div>
                    <div className="composer-footer">
                        <p className="composer-inline-error" role="alert">{inlineError}</p>
                        <div className="composer-actions">
                            <Button className="composer-cancel-button" onClick={onClose}>Annuler</Button>
                            <Button className="composer-draft-button" onClick={() => handleSubmit(true)} disabled={isSubmitting || isUploadingFiles}>Enregistrer comme brouillon</Button>
                            <Button buttonType="submit" className="composer-send-button" state={isSubmitting ? "submitting" : ""} disabled={isSubmitting || isUploadingFiles}>Envoyer</Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
