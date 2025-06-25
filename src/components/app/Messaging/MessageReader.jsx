import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";
import ContentLoader from "react-content-loader";
import { AppContext } from "../../../App";

import "./MessageReader.css";
import EncodedHTMLDiv from "../../generic/CustomDivs/EncodedHTMLDiv";
import FileComponent from "../../generic/FileComponent";
import { capitalizeFirstLetter } from "../../../utils/utils";
import ScrollShadedDiv from "../../generic/CustomDivs/ScrollShadedDiv";
import DownloadIcon from "../../graphics/DownloadIcon";
import PrintIcon from "../../graphics/PrintIcon";
import FolderIcon from "../../graphics/FolderIcon";
import ArchiveIcon from "../../graphics/ArchiveIcon";
import InboxIcon from "../../graphics/InboxIcon";
import MarkAsUnread from "../../graphics/MarkAsUnread";
import SendIcon from "../../graphics/SendIcon";
import DraftIcon from "../../graphics/DraftIcon";
import DeleteIcon from "../../graphics/DeleteIcon";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../generic/PopUps/Tooltip";


export default function MessageReader({ selectedMessage, fetchMessageMarkAsUnread, setSelectedMessage, archiveMessage, unarchiveMessage, moveMessage, deleteMessage }) {

    // States
    const location = useLocation();
    const { useUserData, usedDisplayTheme, useUserSettings } = useContext(AppContext);
    const settings = useUserSettings();
    const messages = useUserData("sortedMessages").get();
    const message = messages ? messages.find((item) => item.id === selectedMessage) : null;
    const [spoiler, setSpoiler] = useState(settings.get("isStreamerModeEnabled"));
    const [folders, setFolders] = useState(useUserData("messageFolders").get());

    useEffect(() => {
        // Update the local state with the latest data
        setFolders(useUserData("messageFolders").get());
    }, [useUserData("messageFolders").get()]);

    // behavior
    useEffect(() => {
        if (settings.get("isStreamerModeEnabled")) {
            setSpoiler(settings.get("isStreamerModeEnabled"))
        }
    }, [selectedMessage])

    const handleMarkAsUnread = (event, msg) => {
        event.preventDefault();
        event.stopPropagation();
        const controller = new AbortController();
        fetchMessageMarkAsUnread([msg.id], controller);

        if (msg.id === selectedMessage) {
            setSelectedMessage(null);
        }

        // mark as unread locally and kick the content so as to trigger a refetch the next reading (as the "mark as read" feature is trigger when fetching the message)
        const messagesUnread = useUserData("sortedMessages");
        const oldMsg = messagesUnread.get()
        const msgIdx = oldMsg.findIndex((item) => item.id === msg.id);
        oldMsg[msgIdx].read = false;
        oldMsg[msgIdx].content = null;
        messagesUnread.set(oldMsg);
    }

    // JSX
    const parsedHashFolder = parseInt(location.hash.slice(1, location.hash.lastIndexOf('-')));

    return (
        <div id="message-reader">
            {selectedMessage !== null && messages && messages.length > 0
                ? <div className="message-container">
                    <div className="email-header">
                        <p className="author">{message && (message?.from?.civilite + " " + (settings.get("isStreamerModeEnabled") ? "-".repeat(message?.from?.nom?.length) : message?.from?.nom))}</p>
                        <h3>{message && capitalizeFirstLetter(message?.subject)}</h3>
                        <p className="send-date">{message && message?.date && (new Date(message.date).toLocaleDateString("fr-FR", {
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                        }))}</p>
                    </div>
                    <hr />
                    <ScrollShadedDiv className="message-content-container" key={message?.content ? selectedMessage + "-content" /* trigger a rerender so that the ScrollShadedDiv detect overflow and display shadows */ : selectedMessage}>
                        {message?.content
                            ? <>
                                {spoiler ? <div className="reveal-spoiler-container"><h3>Streamer Mode activé</h3><span><p>Le contenu de ce message pourrait contenir des informations personnelles sensibles.</p><p>Cliquez sur Continuer pour afficher le message.</p></span><button className="reveal-spoiler" onClick={() => setSpoiler(false)}>Continuer</button></div> : null}
                                <EncodedHTMLDiv className={`message-content${spoiler ? " spoiler" : ""}`} backgroundColor={usedDisplayTheme === "dark" ? [72, 72, 102] : [200, 200, 240]}>{message?.content && message?.content?.content}</EncodedHTMLDiv>
                            </>
                            : <ContentLoader
                                className="message-content"
                                animate={settings.get("displayMode") === "quality"}
                                speed={1}
                                backgroundColor={usedDisplayTheme === "dark" ? "#63638c" : "#9d9dbd"}
                                foregroundColor={usedDisplayTheme === "dark" ? "#7e7eb2" : "#bcbce3"}
                                style={{ display: "block", width: "min(800px, 100%)", margin: "0 auto", height: "575px" }}
                            >
                                <rect x="0" y="0" rx="8" ry="8" width="30%" height="20px" />

                                <rect x="0" y="60" rx="8" ry="8" width="100%" height="20px" />
                                <rect x="0" y="90" rx="8" ry="8" width="70%" height="20px" />

                                <rect x="0" y="150" rx="8" ry="8" width="100%" height="20px" />
                                <rect x="0" y="180" rx="8" ry="8" width="100%" height="20px" />
                                <rect x="0" y="210" rx="8" ry="8" width="100%" height="20px" />
                                <rect x="0" y="240" rx="8" ry="8" width="50%" height="20px" />

                                <rect x="0" y="300" rx="8" ry="8" width="100%" height="20px" />
                                <rect x="0" y="330" rx="8" ry="8" width="40%" height="20px" />

                                <rect x="0" y="390" rx="8" ry="8" width="40%" height="20px" />
                                <rect x="0" y="420" rx="8" ry="8" width="60%" height="20px" />
                                <rect x="0" y="450" rx="8" ry="8" width="30%" height="20px" />

                                <rect x="0" y="510" rx="8" ry="8" width="20%" height="20px" />
                            </ContentLoader>
                        }
                    </ScrollShadedDiv>
                    <hr />
                    <div className="email-footer">
                        <ScrollShadedDiv enableSideShadows={true} className="scroll-footer-div">
                            <ul className="attachments-container">
                                {message && message.files && message.files.length > 0
                                    ? message.files.map((file) => <li key={file.id}><button className="attachment" onClick={() => file.download()}><DownloadIcon className="download-icon" />{file.name + "." + file.extension}</button></li>)
                                    : <li className="no-attatchemnts-messages"><p>Aucun fichier joint</p></li>}
                            </ul>
                        </ScrollShadedDiv>

                        <div className="actions-container">
                            <Tooltip className="action-button-main"><TooltipTrigger><button className="action-button" onClick={
                                () => {
                                    // only print the content of the rendered message
                                    const printWindow = window.open("", "_blank");
                                    printWindow.document.write("<html><head><title>Impression</title></head><body>");
                                    printWindow.document.write(document.querySelector("#message-reader .message-content").innerHTML);
                                    printWindow.document.write("</body></html>");
                                    printWindow.document.close();
                                    printWindow.print();
                                }
                            }><PrintIcon /></button></TooltipTrigger><TooltipContent>Imprimer</TooltipContent></Tooltip>
                            {parsedHashFolder != -2 && parsedHashFolder != -1 && parsedHashFolder != -4 ? (
                                <Tooltip className="action-button-main" closeOnClickInside={true}><TooltipTrigger><button className="action-button"><FolderIcon /></button></TooltipTrigger><TooltipContent>
                                    <TooltipContent className="no-questionmark">
                                        <h3>Changer De Dossier</h3>
                                        <ul className="folders-container">
                                            {folders
                                                .filter((folder) => folder.id !== -3 && folder.id !== -2 && folder.id !== -1 && folder.id !== -4)
                                                .sort((a, b) => {
                                                    const order = [0, -1, -2, -4];
                                                    const indexA = order.indexOf(a.id);
                                                    const indexB = order.indexOf(b.id);
                                                    if (indexA === -1 && indexB === -1) return 0;
                                                    if (indexA === -1) return 1;
                                                    if (indexB === -1) return -1;
                                                    return indexA - indexB;
                                                })
                                                .map((folder) => (
                                                    <li key={folder.id} className={`folder-button-container ${folder.id === parsedHashFolder ? 'not-allowed' : ''}`}>
                                                        <button
                                                            onClick={() => {
                                                                moveMessage([message.id], folder.id);
                                                                setSelectedMessage(null);
                                                            }}
                                                            disabled={folder.id === parsedHashFolder}
                                                            className={`folder-button ${folder.id === parsedHashFolder ? 'selected-folder cannot-click' : ''}`}
                                                        >
                                                            {folder.id === 0 ? <InboxIcon className="folder-icon-tooltip" /> : folder.id === -1 ? <SendIcon className="folder-icon-tooltip" /> : folder.id === -2 ? <ArchiveIcon className="folder-icon-tooltip" /> : folder.id === -4 ? <DraftIcon className="folder-icon-tooltip" /> : <FolderIcon className="folder-icon-tooltip" />}
                                                            {capitalizeFirstLetter(folder.name)}
                                                        </button>
                                                    </li>
                                                ))}
                                        </ul>
                                    </TooltipContent>
                                </TooltipContent></Tooltip>
                            ) : null}
                            {parsedHashFolder === -2 ? (
                                <Tooltip className="action-button-main"><TooltipTrigger><button className="action-button" onClick={
                                    () => {
                                        unarchiveMessage(message.id);
                                        setSelectedMessage(null);
                                    }
                                }><InboxIcon /></button></TooltipTrigger><TooltipContent>Désarchiver</TooltipContent></Tooltip>
                            ) : parsedHashFolder !== -1 && parsedHashFolder !== -4 ? (
                                <Tooltip className="action-button-main"><TooltipTrigger><button className="action-button" onClick={
                                    () => {
                                        archiveMessage(message.id);
                                        setSelectedMessage(null);
                                    }
                                }><ArchiveIcon /></button></TooltipTrigger><TooltipContent>Archiver</TooltipContent></Tooltip>
                            ) : null}
                            {parsedHashFolder === -4 ? (
                                <Tooltip className="action-button-main"><TooltipTrigger><button className="action-button" onClick={
                                    () => {
                                        deleteMessage(message.id);
                                        setSelectedMessage(null);
                                    }
                                }><DeleteIcon /></button></TooltipTrigger><TooltipContent>Supprimer</TooltipContent></Tooltip>
                            ) : null}
                            <Tooltip className="action-button-main"><TooltipTrigger><button className="action-button" onClick={(event) => handleMarkAsUnread(event, message)}><MarkAsUnread /></button></TooltipTrigger><TooltipContent>Marquer comme non lu</TooltipContent></Tooltip>
                        </div>
                    </div>
                </div>
                : <p className="no-selected-message-placeholder">Sélectionnez un message dans votre boîte de réception pour le visualiser ici</p>
            }
        </div>
    )
}