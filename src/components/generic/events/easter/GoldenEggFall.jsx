import { useState, useEffect } from "react";
import "./GoldenEggFall.css";

export default function GoldenEggFall({ active = false }) {
    const [eggs, setEggs] = useState([]);

    useEffect(() => {
        if (active) {
            const newEggs = Array.from({ length: 50 }, () => ({
                id: Math.random(),
                left: `${Math.random() * 100}vw`,
                duration: `${Math.random() * 2 + 1}s`,
                delay: `${Math.random() * 2}s`,
            }));
            setEggs(newEggs);
            const timer = setTimeout(() => setEggs([]), 5000);
            return () => clearTimeout(timer);
        }
    }, [active]);

    if (!active || eggs.length === 0) return null;

    return (
        <div className="golden-egg-fall">
            {eggs.map(egg => (
                <div 
                    key={egg.id} 
                    className="golden-egg" 
                    style={{ 
                        left: egg.left, 
                        "--duration": egg.duration, 
                        animationDelay: egg.delay 
                    }}
                >
                    🥚
                </div>
            ))}
        </div>
    );
}
