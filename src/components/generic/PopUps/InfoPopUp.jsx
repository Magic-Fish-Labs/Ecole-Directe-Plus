import { useState } from "react";
import PopUp from "./PopUp"

import "./InfoPopUp.css";

export default function InfoPopUp({ type, header = "", subHeader = "", contentTitle, onClose, onClosing, forceClose = false, children }) {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
    }

    return (
        <PopUp type={type} forceClose={isClosing || forceClose} onClose={onClose} onClosing={onClosing} defaultClosingCross={false} >
            <div className="info-pop-up">
                <div className="relative-container">
                    <button className="close-button" onClick={handleClose}>✕</button>
                    <div className="info-pop-up-header">
                        <h2 className="info-pop-up-sup-header">{header}</h2>
                        <h4 className="info-pop-up-sub-header">{subHeader}</h4>
                    </div>
                    <div className="info-pop-up-content" tabIndex="0">
                        <h3>{contentTitle}</h3>
                        {children}
                    </div>
                    <button className="close-info-pop-up" onClick={handleClose}>Fermer</button>
                </div>
            </div>
        </PopUp>
    )
}
