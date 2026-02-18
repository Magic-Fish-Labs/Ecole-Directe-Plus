import { useState, useRef, useEffect } from "react";
import {
    WindowsContainer,
    WindowsLayout,
    Window,
    WindowHeader,
    WindowContent
} from "../../generic/Window";
import MessageReader from "./MessageReader/MessageReader";
import InboxWindow from "./InboxWindow";

import "./Messaging.css";

export default function Messaging() {
    // States

    // behavior
    useEffect(() => {
        document.title = "Messagerie • Ecole Directe Plus";
    }, []);

    // JSX
    return (
        <div id="messaging">
            <WindowsContainer name="timetable" allowWindowsManagement={false}>
                <WindowsLayout direction="row" ultimateContainer={true}>
                    <InboxWindow />
                    <Window growthFactor={3} className="message-content" allowFullscreen={true}>
                        <WindowHeader className="message-reader-window-header">
                            <h2>Message</h2>
                        </WindowHeader>
                        <WindowContent>
                            <MessageReader />
                        </WindowContent>
                    </Window>
                </WindowsLayout>
            </WindowsContainer>
        </div>
    );
}
