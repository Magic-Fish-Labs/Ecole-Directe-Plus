import { useEffect, useRef, useState } from "react";
import "./EasterFall.css";

const EASTER_ELEMENTS = ["🥚", "🐣", "🌸", "🌼", "🌷", "🐇", "🌱", "🦋"];

function generateEasterFall() {
    return Array.from({ length: 40 }, () => ({
        "char": EASTER_ELEMENTS[Math.floor(Math.random() * EASTER_ELEMENTS.length)],
        "fontSize": `${Math.random() * 1.5 + 2.5}vw`,
        "left": `${Math.random() * 100}vw`,
        "filter": `blur(${Math.random() * 2 + 0.1}px)`,
        "opacity": `${Math.random() * 0.4 + 0.5}`,
        "animationDuration": `${Math.random() * 8 + 7}s`,
        "animationDelay": `${Math.random() * 10}s`,
        "--left-ini": `${Math.random() * 20 - 10}vw`,
        "--left-end": `${Math.random() * 20 - 10}vw`,
    }))
}

export default function EasterFall({ ...props }) {
    const [elements, setElements] = useState([]);

    useEffect(() => {
        setElements(generateEasterFall());
    }, []);

    return (
        <div className="initial-easterfall" {...props}>
            {elements.map((style, index) => {
                const { char, ...restStyle } = style;
                return (
                    <div
                        key={index}
                        className="easter-element"
                        style={restStyle}
                    >
                        {char}
                    </div>
                );
            })}
        </div>
    );
};
