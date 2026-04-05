import "./graphics.css"

export default function SpringCap({ className = "", id = "", alt, ...props }) {
    return (
        <div className={`spring-cap ${className}`} id={id} {...props}>
            <svg width="100%" height="40" viewBox="0 0 154 40" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Un peu de verdure très légère au fond pour lier le tout */}
                <path d="M0 40 Q10 35 20 40 T40 40 T60 40 T80 40 T100 40 T120 40 T140 40 T154 40" stroke="#4ade80" strokeWidth="2" fill="none" />
                
                {/* Œuf 1: Rose à pois (Hauteur réduite) */}
                <path d="M5 40 C5 30 17 25 25 25 C33 25 45 30 45 40 Z" fill="#fb7185" />
                <circle cx="15" cy="33" r="1.5" fill="white" opacity="0.6" />
                <circle cx="35" cy="30" r="1.5" fill="white" opacity="0.6" />
                <circle cx="25" cy="37" r="1.5" fill="white" opacity="0.6" />

                {/* Œuf 2: Bleu à rayures (Hauteur réduite) */}
                <path d="M40 40 C40 25 52 20 60 20 C68 20 80 25 80 40 Z" fill="#60a5fa" />
                <path d="M43 32 L77 32" stroke="white" strokeWidth="2" opacity="0.4" />
                <path d="M48 27 L72 27" stroke="white" strokeWidth="1.5" opacity="0.4" />

                {/* Œuf 3: Jaune à zigzags (Hauteur réduite) */}
                <path d="M75 40 C75 30 87 25 95 25 C103 25 115 30 115 40 Z" fill="#fef08a" />
                <path d="M78 35 L83 31 L88 35 L93 31 L98 35 L103 31 L108 35 L112 31" stroke="#eab308" strokeWidth="1.5" fill="none" />

                {/* Œuf 4: Violet décoré (Hauteur réduite) */}
                <path d="M110 40 C110 25 125 20 135 20 C145 20 160 25 160 40 Z" fill="#c084fc" />
                <circle cx="135" cy="30" r="3" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5" />
                <path d="M115 35 Q135 30 155 35" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5" />
            </svg>
        </div>
    )
}
