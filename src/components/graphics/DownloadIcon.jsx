
import "./graphics.css"
export default function DownloadIcon({ className = "", id = "", alt = "Icône de téléchargement", ...props }) {
    return (
        <svg aria-label={alt} className={className} id={id} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 105" fill="none" {...props}>
            <path d="M55 5V71.6616M55 71.6616L76.0526 49.2105M55 71.6616L33.9474 49.2105" className="stroke-text-main" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 65.5263V79.2105C5 90.2562 13.9543 99.2105 25 99.2105H85C96.0457 99.2105 105 90.2562 105 79.2105V65.5263" className="stroke-text-main" strokeWidth="10" strokeLinecap="round" />
        </svg>
    )
}