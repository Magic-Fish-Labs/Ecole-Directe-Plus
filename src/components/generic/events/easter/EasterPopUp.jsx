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
                    Bienvenue sur Ecole-Directe-Plus ! Profitez de notre thème spécial printanier. 
                    Une petite chasse aux œufs a commencé... Saurez-vous tous les trouver ? 🧺
                </p>
                <button className="easter-popup-close" onClick={handleClose}>
                    C'est parti !
                </button>
            </div>
        </div>
    );
}
