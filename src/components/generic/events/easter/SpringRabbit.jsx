import { useState, useEffect } from "react";
import "./SpringRabbit.css";

export default function SpringRabbit() {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ right: "50px" });

    const [showEggGain, setShowEggGain] = useState(false);

    useEffect(() => {
        const showRabbit = () => {
            if (Math.random() > 0.6) { // Plus fréquent
                setPosition({ right: `${Math.random() * 80 + 5}vw` });
                setIsVisible(true);
                setShowEggGain(false);
                setTimeout(() => setIsVisible(false), 8000); 
            }
        };

        const interval = setInterval(showRabbit, 15000);
        return () => clearInterval(interval);
    }, []);

    const handleCatch = () => {
        if (!isVisible || showEggGain) return;
        
        // Mise à jour du score
        const currentScore = parseInt(localStorage.getItem("easter_eggs_count") || "0");
        const newScore = currentScore + 1;
        localStorage.setItem("easter_eggs_count", newScore.toString());
        
        // Notification pour les autres composants
        window.dispatchEvent(new CustomEvent("easterScoreUpdated", { detail: { score: newScore } }));

        // Effet de confettis si disponible
        if (window.confetti) {
            window.confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.8 },
                colors: ['#fb7185', '#60a5fa', '#fef08a', '#c084fc', '#4ade80']
            });
        }

        setShowEggGain(true);
        setTimeout(() => {
            setIsVisible(false);
            setShowEggGain(false);
        }, 800);
    };

    return (
        <div 
            className={`spring-rabbit-container ${isVisible ? "visible" : ""}`} 
            style={position}
            onClick={handleCatch}
        >
            {showEggGain && <div className="egg-gain-popup">+1 🥚</div>}
            <div className="rabbit-body">
                <div className="rabbit-attention">!</div>
                🐇
            </div>
        </div>
    );
}
