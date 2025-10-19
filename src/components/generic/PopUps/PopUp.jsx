import { useState, useEffect, useRef } from "react";
import { clearAllBodyScrollLocks } from "body-scroll-lock";

import "./PopUp.css"

const closingCooldown = 300; // milliseconds

export default function PopUp({ type = "info", onClose = () => { }, forceClose = false, defaultClosingCross = true, children, className = "", ...props }) {
    const [isClosing, setIsClosing] = useState(false);

    const PopUpRef = useRef(null);
    const clickedInsidePopUp = useRef(false);

    type = ["info", "warning", "error"].includes(type) ? type : "info";

    // fermeture avec échap
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                handleClose();
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            clearAllBodyScrollLocks();
        }
    }, [])

    // enlève le tabIndex des éléments hors de la PopUp pour empêcher la navigation clavier
    useEffect(() => {
        const elements = document.body.querySelectorAll("*");
        const defaultTabIndex = [];
        elements.forEach((element) => {
            if (element !== PopUpRef.current && !PopUpRef.current.contains(element) && element.tabIndex !== -1) {
                defaultTabIndex.push(element.tabIndex);
                // tout tabIndex négatif empêche le focus, on utilise le -2 pour reconnaître les items dont le focus est désactivé
                element.tabIndex = -2;
            }
        });

        return () => {
            // rétablit le focus
            elements.forEach((element, index) => {
                if (element.tabIndex === -2) {
                    element.tabIndex = defaultTabIndex[index];
                }
            });
        }
    }, []);


    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, closingCooldown);
    }

    useEffect(() => {
        if (forceClose) {
            handleClose()
        }
    }, [forceClose])

    return (
        <div className={(isClosing ? "closing " : "") + className} id="pop-up" onClick={() => !clickedInsidePopUp.current ? handleClose() : null} {...props}>
            <div ref={PopUpRef} className={(isClosing ? "closing " : "") + type} id="pop-up-background" onClick={(event) => event.stopPropagation()} onPointerDown={() => clickedInsidePopUp.current = true} onPointerUp={() => setTimeout(() => clickedInsidePopUp.current = false, 0)}> {/* Cancel clic detection by the background if user clic on pop-up */}
                {defaultClosingCross
                    ? <div className="default-closing-cross" onClick={handleClose} onKeyDown={(event) => event.key === "Enter" && handleClose()} role="button" tabIndex={0}>✕</div>
                    : null}
                {children}
            </div>
        </div>
    )
}
