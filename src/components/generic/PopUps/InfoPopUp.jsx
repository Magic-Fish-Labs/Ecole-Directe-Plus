import { useState } from "react";
import PopUp from "./PopUp"

import "./InfoPopUp.css";

const closingCooldown = 300; // milliseconds

export default function InfoPopUp({ type, header = "", subHeader = "", contentTitle, onClose, forceClose = false, children }) {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, closingCooldown);
    }

    return (
        <PopUp type={type} forceClose={isClosing | forceClose} onClose={onClose} defaultClosingCross={false} >
            <div id="info-pop-up">
                <div className="relative-container">
                    <button className="close-button" onClick={handleClose}>✕</button>
                    <div id="info-pop-up-header">
                        <h2 id="info-pop-up-sup-header">{header}</h2>
                        <h4 id="info-pop-up-sub-header">{subHeader}</h4>
                    </div>
                    <div id="info-pop-up-content" tabIndex="0">
                        <h3>{contentTitle}</h3>
                        {children}
                    </div>
                    <button id="close-info-pop-up" onClick={handleClose}>Fermer</button>
                </div>
            </div>
        </PopUp>
    )
}
