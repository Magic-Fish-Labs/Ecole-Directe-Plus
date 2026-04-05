import "./FlowerGarland.css";

export default function FlowerGarland() {
    return (
        <ul className="flower-rope">
            {Array.from({ length: 40 }).map((_, i) => (
                <li key={i}></li>
            ))}
        </ul>
    );
}
