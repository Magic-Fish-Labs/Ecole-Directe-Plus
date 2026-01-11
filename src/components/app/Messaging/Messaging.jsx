import { useState, useRef, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";

import {
    WindowsContainer,
    WindowsLayout,
    Window,
    WindowHeader,
    WindowContent
} from "../../generic/Window";

import MessageReader from "./MessageReader";
import InboxWindow from "./InboxWindow";

import "./Messaging.css";

export default function Messaging({ fetchMessages, fetchMessageMarkAsUnread, archiveMessage, unarchiveMessage, moveMessage, deleteMessage }) {
    // States
    const [selectedMessage, setSelectedMessage] = useState(null);

    // behavior
    useEffect(() => {
        document.title = "Messagerie • Ecole Directe Plus";
    }, []);

    // JSX
    return (
        <div id="messaging">
            <WindowsContainer name="timetable" allowWindowsManagement={false}>
                <WindowsLayout direction="row" ultimateContainer={true}>
                    <InboxWindow selectedMessage={selectedMessage} setSelectedMessage={setSelectedMessage} />
                    <Window growthFactor={3} className="message-content" allowFullscreen={true}>
                        <WindowHeader className="message-reader-window-header">
                            <h2>Message</h2>
                        </WindowHeader>
                        <WindowContent>
                            <MessageReader selectedMessageId={selectedMessage} fetchMessageMarkAsUnread={fetchMessageMarkAsUnread} setSelectedMessage={setSelectedMessage} archiveMessage={archiveMessage} unarchiveMessage={unarchiveMessage} moveMessage={moveMessage} deleteMessage={deleteMessage} />
                        </WindowContent>
                    </Window>
                </WindowsLayout>
            </WindowsContainer>
        </div>
    );
}
