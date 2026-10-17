import "./graphics.css"
export default function SchoolLifeIcon ({ className="", id="", alt, ...props }) {
    return (
<svg aria-label={alt} className={className} id={id} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" {...props}>
<path d="M16 43L50 17L84 43" className="stroke-text-main" strokeWidth="6" strokeLinejoin="round" />
<path d="M24 43V84H76V43" className="stroke-text-main" strokeWidth="6" strokeLinejoin="round" />
<path d="M42 84V62H58V84" className="stroke-text-main" strokeWidth="6" strokeLinejoin="round" />
</svg>
	)
}
