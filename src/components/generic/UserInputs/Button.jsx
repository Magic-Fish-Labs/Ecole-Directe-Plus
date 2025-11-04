import "./Button.css";

export const ButtonTypes = Object.freeze({
    BUTTON: 0,
    SUBMIT: 1
})

export const ButtonStates = Object.freeze({
    NEUTRAL: 0,
    SUBMITTED: 1,
    SUBMITTING: 2,
    INVALID: 3
})

const stateClasses = [
    "",
    "submitted",
    "submitting",
    "invalid",
]

export default function Button({ type=ButtonTypes.BUTTON, children, value, onClick, disabled=false, state=ButtonStates.NEUTRAL, className="", ...props }) {
    if (!Object.values(ButtonTypes).includes(type)) {
        type = ButtonTypes.BUTTON;
    }

    return (
        <button
            type={type}
            value={value}
            onClick={onClick}
            className={`button ${className} ${(type === "submit" ? "submitter" : "")} ${stateClasses[state]} ${disabled ? "disabled" : ""}`}
            disabled={disabled}
            {...props}
        >
            {value && value}
            {children && children}
        </button>
    )
}
