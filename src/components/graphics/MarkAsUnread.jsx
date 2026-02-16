
import "./graphics.css"
export default function MarkAsUnread({ className = "", id = "", alt = "Icône marque comme non-lu", ...props }) {
    return (
        <svg aria-label={alt} className={className} id={id} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path d="M13 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.0799 3 8.2V15.8C3 16.9201 3 17.4802 3.21799 17.908C3.40973 18.2843 3.71569 18.5903 4.09202 18.782C4.51984 19 5.0799 19 6.2 19H17.8C18.9201 19 19.4802 19 19.908 18.782C20.2843 18.5903 20.5903 18.2843 20.782 17.908C21 17.4802 21 16.9201 21 15.8V13M3 8L8.45036 11.6336C9.73296 12.4886 10.3743 12.9162 11.0674 13.0824C11.6804 13.2293 12.3196 13.2293 12.9326 13.0824C13.6257 12.9162 14.267 12.4886 15.5496 11.6336M22 6.5C22 7.88071 20.8807 9 19.5 9C18.1193 9 17 7.88071 17 6.5C17 5.11929 18.1193 4 19.5 4C20.8807 4 22 5.11929 22 6.5Z" className="stroke-text-main" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}