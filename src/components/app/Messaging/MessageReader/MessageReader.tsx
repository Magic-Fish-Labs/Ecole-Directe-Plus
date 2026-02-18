import { useState, useEffect, useContext } from "react";
import { AppContext, SettingsContext, UserDataContext } from "../../../../App";

import "./MessageReader.css";
import EncodedHTMLDiv from "../../../generic/CustomDivs/EncodedHTMLDiv";
import { capitalizeFirstLetter } from "../../../../utils/utils";
import ScrollShadedDiv from "../../../generic/CustomDivs/ScrollShadedDiv";
import useLoadMessageContent from "../../../../hooks/loaders/useLoadMessageContent";
import MessageReaderLoader from "./MessageReaderLoader";
import MessageReaderFooter from "./MessageReaderFooter";
import { Message, MessageFolders } from "../../../../mappers/v3/eleves/messages/mapper";
import { AccountDataEntry } from "../../../../EcoleDirecteHandlerCore/hooks/utils/useAccountDataType";

interface ThisUserData {
    messages: AccountDataEntry<Array<Message>>,
    messageFolders: AccountDataEntry<MessageFolders>,
    selectedMessageId: AccountDataEntry<number>
}

export default function MessageReader() {

    // States
    const { usedDisplayTheme } = useContext(AppContext);

    const settings = useContext(SettingsContext)
    const {
        isStreamerModeEnabled: { value: isStreamerModeEnabled }
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
