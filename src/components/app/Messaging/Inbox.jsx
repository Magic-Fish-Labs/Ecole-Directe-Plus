import { useState, useEffect, useRef, useContext } from "react";
import ContentLoader from "react-content-loader";
import { AppContext } from "../../../App";

import "./Inbox.css";
import ScrollShadedDiv from "../../generic/CustomDivs/ScrollShadedDiv";
import TextInput from "../../generic/UserInputs/TextInput";
import { removeAccents } from "../../../utils/utils";
import AttachmentIcon from "../../graphics/AttachmentIcon";
import MarkAsUnread from "../../graphics/MarkAsUnread";


export default function Inbox({ selectedMessage, setSelectedMessage, selectedFolder, fetchMessageMarkAsUnread }) {
    // States
    const { useUserData, usedDisplayTheme, useUserSettings } = useContext(AppContext);
    const settings = useUserSettings();
    const [search, setSearch] = useState("");

    const [messages, setMessages] = useState([]);

    const messageFolders = useUserData("messageFolders");
    const contentLoadersRandomValues = useRef({ authorWidth: Array.from({ length: 13 }, (_) => Math.round(Math.random() * 100) + 100), subjectWidth: Array.from({ length: 13 }, (_) => Math.floor(Math.random() * 150) + 150), dateWidth: Array.from({ length: 13 }, (_) => Math.floor(Math.random() * 50) + 50), containsFiles: Array.from({ length: 13 }, (_) => (Math.random() > .6)) })

    // behavior
    const handleClick = (message) => {
        setSelectedMessage(message.id);
    }

    const handleKeyDown = (event, msg) => {
        if (event.key === "Enter" || event.key === " ") {
            handleClick(msg);
        }
    }

    const handleMarkAsUnread = (event, msg) => {
        event.preventDefault();
        event.stopPropagation();
        const controller = new AbortController();
        fetchMessageMarkAsUnread([msg.id], controller);

        if (msg.id === selectedMessage) {
            setSelectedMessage(null);
        }

        // mark as unread locally and kick the content so as to trigger a refetch the next reading (as the "mark as read" feature is trigger when fetching the message)
        const oldMsg = messages;
        const msgIdx = oldMsg.findIndex((item) => item.id === msg.id);
        oldMsg[msgIdx].read = false;
        oldMsg[msgIdx].content = null;
        messages.set(oldMsg);

    }

    const handleChange = (event) => {
        setSearch(event.target.value)
    }

    const filterResearch = (message) => {
        // let regexp;
        let query = removeAccents(search.toLowerCase());
        if (query === "") {
            return true;
        }
        try {
            // regexp = new RegExp(removeAccents(search.toLowerCase()));
        } catch { return -1 }
        const filterBy = [message.subject, message.from?.civilite + " " + message.from?.nom, message.content?.content, message.files?.map((file) => file.name)].flat();
        for (let filter of filterBy) {
            if (filter) {
                filter = removeAccents(filter.toLowerCase());
                // if (regexp.test(filter)) {
                if (filter.includes(query)) {
                    return true;
                }
            }
        }
        return false;
    }

    useEffect(() => {
        const newMessages = useUserData("sortedMessages").get();
        setMessages(newMessages);
    }, [useUserData("sortedMessages").get()]);


    // JSX
    return (
        <div id="inbox">
            <TextInput onChange={handleChange} value={search} textType={"text"} placeholder={"Rechercher"} className="inbox-search-input" />
            {messages !== undefined && (messageFolders.get() !== undefined && messageFolders.get()?.find((folder) => folder.id === selectedFolder)?.fetched)
                ? (messages.filter((message) => message.folderId === selectedFolder).length > 0
                    ? <ScrollShadedDiv className="messages-container">
                        <ul>
                            {messages.filter((message) => message.folderId === selectedFolder).filter(filterResearch).map((message, index) => <li style={{ "--order": index }} className={"message-container" + (selectedMessage === message.id ? " selected" : "")} data-read={message.read} onClick={() => handleClick(message)} onKeyDown={(event) => handleKeyDown(event, message)} key={message.id} role="button" tabIndex={0}>
                                <h4 className="message-subject"><span className="author-name">{message.from.civilite + " " + (settings.get("isStreamerModeEnabled") ? "-".repeat((message.from.nom).length) : message.from.nom)}</span> <span className="actions"><button disabled={!message.read} onClick={(event) => handleMarkAsUnread(event, message)} className="mark-as-unread" title="Marquer comme non lu"><MarkAsUnread className="mark-as-unread-icon" /></button> {message.files?.length > 0 && <AttachmentIcon className="attachment-icon" />}</span></h4>
                                <p className="message-author">{message.subject}</p>
                                <p className="message-date">{(new Date(message.date)).toLocaleDateString("fr-FR", {
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                })}</p>
                            </li>)}
                        </ul>
                    </ScrollShadedDiv>
                    : (messages.length > 0
                        ? <p className="no-message-received">Ce dossier est vide. Peut-être qu'il attend juste un miracle... ou un clic</p>
                        : <p className="no-message-received">Vous n'avez reçu aucun message. Tendez l'oreille et profitez de cet instant de silence</p>)
                )
                : <ScrollShadedDiv className="messages-container">
                    <ul>
                        {Array.from({ length: 13 }, (_, index) => <li key={index} style={{ "--order": -69 /* skip the animation */ }} className={"message-container"}>
                            <h4 className="message-subject"><span className="author-name"><ContentLoader
                                animate={settings.get("displayMode") === "quality"}
                                speed={1}
                                backgroundColor={usedDisplayTheme === "dark" ? "#7878ae" : "#75759a"}
                                foregroundColor={usedDisplayTheme === "dark" ? "#9292d4" : "#9292c0"}
                                style={{ width: `min(${contentLoadersRandomValues.current.authorWidth[index]}px, 100%)`, maxHeight: "20px" }}
                            >
                                <rect x="0" y="0" rx="5" ry="5" width="100%" height="100%" />
                            </ContentLoader></span><span className="actions">{contentLoadersRandomValues.current.containsFiles[index] && <AttachmentIcon className="attachment-icon" />}</span></h4>
                            <p className="message-author"><ContentLoader
                                animate={settings.get("displayMode") === "quality"}
                                speed={1}
                                backgroundColor={usedDisplayTheme === "dark" ? "#63638c" : "#9d9dbd"}
                                foregroundColor={usedDisplayTheme === "dark" ? "#7e7eb2" : "#bcbce3"}
                                style={{ width: `min(${contentLoadersRandomValues.current.subjectWidth[index]}px, 60%)`, maxHeight: "16px" }}
                            >
                                <rect x="0" y="0" rx="5" ry="5" width="100%" height="100%" />
                            </ContentLoader></p>
                            <p className="message-date"><ContentLoader
                                animate={settings.get("displayMode") === "quality"}
                                speed={1}
                                backgroundColor={usedDisplayTheme === "dark" ? "#63638c" : "#9d9dbd"}
                                foregroundColor={usedDisplayTheme === "dark" ? "#7e7eb2" : "#bcbce3"}
                                style={{ width: `min(${contentLoadersRandomValues.current.dateWidth[index]}px, 30%)`, maxHeight: "16px" }}
                            >
                                <rect x="0" y="0" rx="5" ry="5" width="100%" height="100%" />
                            </ContentLoader></p>
                        </li>)}
                    </ul>
                </ScrollShadedDiv>
            }
        </div>
    )
}