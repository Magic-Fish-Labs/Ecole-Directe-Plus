import { useState, useEffect } from "react";
import "./EasterScore.css";

const MILESTONES = [10, 25, 50, 75, 100, 150, 200];

export default function EasterScore() {
    const [score, setScore] = useState(parseInt(localStorage.getItem("easter_eggs_count") || "0"));
    const [bump, setBump] = useState(false);
    const [milestoneMsg, setMilestoneMsg] = useState("");

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

        window.addEventListener("easterScoreUpdated", handleScoreUpdate);
        return () => window.removeEventListener("easterScoreUpdated", handleScoreUpdate);
    }, []);

    const nextMilestone = MILESTONES.find(m => m > score) || MILESTONES[MILESTONES.length - 1];

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
