import { useEffect, useState } from "react";
import "./EasterScore.css";
import { getSecureScore } from "./easterUtils";

const MILESTONES = [10, 25, 50, 75, 100, 150, 200, 300, 500, 750, 1000];

export default function EasterScore() {
  const [score, setScore] = useState(0);
  const [bump, setBump] = useState(false);
  const [milestoneMsg, setMilestoneMsg] = useState("");
  const [tamperWarning, setTamperWarning] = useState(false);
  useEffect(() => {
    const handleScoreUpdate = (e) => {
      const newScore = e.detail.score;
      setScore(newScore);
      setBump(true);
      setTimeout(() => setBump(false), 300);

      if (MILESTONES.includes(newScore)) {
        setMilestoneMsg(`Palier atteint : ${newScore} ! 🎉`);
        setTimeout(() => setMilestoneMsg(""), 3000);
      }
    };

    const handleScoreTampered = () => {
      setScore(0);
      setTamperWarning(true);
      setTimeout(() => setTamperWarning(false), 5000); // Masquer après 5 secondes
    };

    window.addEventListener("easterScoreUpdated", handleScoreUpdate);
    window.addEventListener("easterScoreTampered", handleScoreTampered);

    setScore(
      getSecureScore({ onTamper: handleScoreTampered, emitEvent: false }),
    );

    return () => {
      window.removeEventListener("easterScoreUpdated", handleScoreUpdate);
      window.removeEventListener("easterScoreTampered", handleScoreTampered);
    };
  }, []);

  let nextMilestone = MILESTONES.find((m) => m > score);
  if (!nextMilestone) {
    nextMilestone = Math.ceil((score + 1) / 100) * 100;
  }

  return (
    <div className={`easter-score-container ${bump ? "bump" : ""}`}>
      {milestoneMsg && <div className="milestone-notif">{milestoneMsg}</div>}
      {tamperWarning && (
        <div className="tamper-warning">
          ⚠️ <span className="emphasis">Triche détectée !</span> Votre score a
          été réinitialisé. Pas de raccourcis pour la chasse aux œufs ! 🧺
        </div>
      )}
      <span className="egg-icon">🥚</span>
      <div className="score-text">
        {score}
        <span className="score-goal">/ {nextMilestone}</span>
      </div>
    </div>
  );
}
