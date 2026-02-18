import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";
import ContentLoader from "react-content-loader";
import { AppContext, SettingsContext, UserDataContext } from "../../../../App";

import "./MessageReader.css";
import EncodedHTMLDiv from "../../../generic/CustomDivs/EncodedHTMLDiv";
import FileComponent from "../../../generic/FileComponent";
import { capitalizeFirstLetter } from "../../../../utils/utils";
import ScrollShadedDiv from "../../../generic/CustomDivs/ScrollShadedDiv";
import DownloadIcon from "../../../graphics/DownloadIcon";
import PrintIcon from "../../../graphics/PrintIcon";
import FolderIcon from "../../../graphics/FolderIcon";
import ArchiveIcon from "../../../graphics/ArchiveIcon";
import InboxIcon from "../../../graphics/InboxIcon";
import MarkAsUnread from "../../../graphics/MarkAsUnread";
import SendIcon from "../../../graphics/SendIcon";
import DraftIcon from "../../../graphics/DraftIcon";
import DeleteIcon from "../../../graphics/DeleteIcon";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../generic/PopUps/Tooltip";
import useLoadMessageContent from "../../../../hooks/loaders/useLoadMessageContent";
import MessageReaderLoader from "./MessageReaderLoader";
import MessageReaderFooter from "./MessageReaderFooter";
import mapStudentMessages, { Message, MessageFolders } from "../../../../mappers/v3/eleves/messages/mapper";
import { AccountDataEntry } from "../../../../EcoleDirecteHandlerCore/hooks/utils/useAccountDataType";

interface ThisUserData {
    messages: AccountDataEntry<Array<Message>>,
    messageFolders: AccountDataEntry<MessageFolders>,
    selectedMessageId: AccountDataEntry<number>
}

export default function MessageReader() {

    // States
    const location = useLocation();
    const { usedDisplayTheme } = useContext(AppContext);

    const settings = useContext(SettingsContext)
    const {
        isStreamerModeEnabled: { value: isStreamerModeEnabled },
        displayMode: { value: displayMode }
    } = settings.user;
    
    const [spoiler, setSpoiler] = useState(isStreamerModeEnabled);
    const userData = useContext(UserDataContext) as unknown as ThisUserData;
    const {
        selectedMessageId: { value: selectedMessageId },
        messages: { value: messages }
    } = userData;

    useLoadMessageContent();
    const message = messages ? messages.find((item) => item.id === selectedMessageId) : null;

    // behavior
    useEffect(() => {
        setSpoiler(isStreamerModeEnabled);
    }, [selectedMessageId])

    // JSX
    const parsedHashFolder = parseInt(location.hash.slice(1, location.hash.lastIndexOf('-')));

    if (selectedMessageId === null || !messages || !messages?.length) {
        return <div id="message-reader"><p className="no-selected-message-placeholder">Sélectionnez un message dans votre boîte de réception pour le visualiser ici</p></div>;
    }

    return <div id="message-reader">
        <div className="message-container">
            <div className="email-header">
                <p className="author">{message && (message?.from?.civilite + " " + (isStreamerModeEnabled ? "-".repeat(message?.from?.nom?.length) : message?.from?.nom))}</p>
                <h3>{message && capitalizeFirstLetter(message?.subject)}</h3>
                <p className="send-date">{message && message?.date && (new Date(message.date).toLocaleDateString("fr-FR", {
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                }))}</p>
            </div>
            <hr />
            <ScrollShadedDiv className="message-content-container" key={message?.content ? selectedMessageId + "-content" /* trigger a rerender so that the ScrollShadedDiv detect overflow and display shadows */ : selectedMessageId}>
                {message?.content
                    ? <>
                        {spoiler ? <div className="reveal-spoiler-container"><h3>Streamer Mode activé</h3><span><p>Le contenu de ce message pourrait contenir des informations personnelles sensibles.</p><p>Cliquez sur Continuer pour afficher le message.</p></span><button className="reveal-spoiler" onClick={() => setSpoiler(false)}>Continuer</button></div> : null}
                        <EncodedHTMLDiv className={`message-content${spoiler ? " spoiler" : ""}`} backgroundColor={usedDisplayTheme === "dark" ? [72, 72, 102] : [200, 200, 240]}>{message?.content && message?.content?.content}</EncodedHTMLDiv>
                    </>
                    : <MessageReaderLoader />
                }
            </ScrollShadedDiv>
            <hr />
            <MessageReaderFooter message={message} />
        </div>
    </div>;
}
