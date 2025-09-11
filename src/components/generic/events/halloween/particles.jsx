import { useMemo } from "react";
import "./css/particles.css";

export const FloatingParticles = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }).map(() => ({
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${Math.random() * 3 + 10}s`,
        left: `${Math.random() * 100}%`,
        width: `${Math.random() * 0.5 + 0.2}rem`,
        height: `${Math.random() * 0.5 + 0.2}rem`,
      })),
    []
  );

  return (
    <div className="floating-orbs">
      {particles.map((style, index) => (
        <div key={index} className="orb" style={style}>
          <span role="img" aria-label="Halloween Particle">
            🎃
          </span>
        </div>
      ))}
    </div>
  );
};
