import "./graphics.css"
export default function ModulesIcon ({ className="", id="", alt, ...props }) {
    return (
<svg aria-label={alt} className={className} id={id} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" {...props}>
<circle cx="32" cy="32" r="14" className="stroke-text-main" strokeWidth="6" />
<circle cx="68" cy="32" r="14" className="stroke-text-main" strokeWidth="6" />
<circle cx="32" cy="68" r="14" className="stroke-text-main" strokeWidth="6" />
<circle cx="68" cy="68" r="14" className="stroke-text-main" strokeWidth="6" />
</svg>
	)
}
