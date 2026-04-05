import { useState, useEffect } from "react";
import "./EasterScore.css";
import { getSecureScore } from "./easterUtils";
import { useCreateNotification } from "../../PopUps/Notification";

const MILESTONES = [10, 25, 50, 75, 100, 150, 200];

export default function EasterScore() {
    const [score, setScore] = useState(getSecureScore());
    const [bump, setBump] = useState(false);
    const [milestoneMsg, setMilestoneMsg] = useState("");

    const createNotification = useCreateNotification();

    useEffect(() => {
        const handleScoreUpdate = (e) => {
            const newScore = e.detail.score;
            setScore(newScore);
            setBump(true);
            setTimeout(() => setBump(false), 300);

            // Check milestones
            if (MILESTONES.includes(newScore)) {
                setMilestoneMsg(`Palier atteint : ${newScore} ! 🎉`);
                setTimeout(() => setMilestoneMsg(""), 3000);
            }
        };

        const handleScoreTampered = () => {
            setScore(0);
            createNotification(<span>⚠️ <span className="emphasis">Triche détectée !</span> Votre score a été réinitialisé. Pas de raccourcis pour la chasse aux œufs ! 🧺</span>);
        };

        window.addEventListener("easterScoreUpdated", handleScoreUpdate);
        window.addEventListener("easterScoreTampered", handleScoreTampered);
        return () => {
            window.removeEventListener("easterScoreUpdated", handleScoreUpdate);
            window.removeEventListener("easterScoreTampered", handleScoreTampered);
        };
    }, []);

    let nextMilestone = MILESTONES.find(m => m > score);
    if (!nextMilestone) {
        // Si on dépasse le dernier palier (200), on crée des paliers tous les 100 œufs
        nextMilestone = Math.ceil((score + 1) / 100) * 100;
    }

    return (
        <div className={`easter-score-container ${bump ? "bump" : ""}`}>
            {milestoneMsg && <div className="milestone-notif">{milestoneMsg}</div>}
            <span className="egg-icon">🥚</span>
            <div className="score-text">
                {score}
                <span className="score-goal">/ {nextMilestone}</span>
            </div>
        </div>
    );
}
