import { useState, useEffect } from "react";
import "./EasterPopUp.css";

export default function EasterPopUp() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const hasSeenPopUp = localStorage.getItem("easter_popup_seen");
        if (!hasSeenPopUp) {
            setIsVisible(true);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem("easter_popup_seen", "true");
    };

    if (!isVisible) return null;

    return (
        <div className="easter-popup-overlay">
            <div className="easter-popup-content">
                <div className="easter-popup-eggs">🥚 🐣 🌸</div>
                <h1>Joyeuses Pâques !</h1>
                <p>
                    Chers élèves, l'équipe MagicFishes et ses contributeurs vous souhaitent de Joyeuses Pâques et une bonne chasse aux œufs.
                    <br /><br />
                    PS : un lapin aux œufs apparaît parfois sur la page, cliquez dessus pour obtenir un Œuf. Celui qui récolte le plus d'œufs d'ici la fin du mois aura une récompense unique !
                </p>
                <button className="easter-popup-close" onClick={handleClose}>
                    C'est parti !
                </button>
                <div className="easter-popup-signature">
                    Theme designed by <span>Ewalwi</span>
                </div>
            </div>
        </div>
    );
}
