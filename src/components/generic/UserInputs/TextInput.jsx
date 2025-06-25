import { useState } from "react";
import "./TextInput.css";
import WarningMessage from "../Informative/WarningMessage";
import EyeVisible from "../../graphics/EyeVisible";
import EyeHidden from "../../graphics/EyeHidden";

export default function TextInput({ textType, placeholder, value, onChange, disabled, isRequired, warningMessage, icon = "", onWarning, className = "", id = "", keyHint, name, ...props }) {
    const [warningMessageState, setWarningMessageState] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const allowedTextTypes = ["text", "password", "email", "search", "url"];
    const showPasswordIcon = textType === allowedTextTypes[1];

    if (!allowedTextTypes.includes(textType) || showPassword) {
        textType = "text";
    }

    const passwordClickHandler = () => setShowPassword((prev) => !prev);
    const PasswordIcon = <>
        {showPassword
            ? <EyeVisible onClick={passwordClickHandler} />
            : <EyeHidden onClick={passwordClickHandler} />
        }
        {icon}
    </>;

    function handleInvalid(event) {
        event.preventDefault();
        setWarningMessageState(warningMessage);
        onWarning();
    }

    function handleChange(event) {
        onChange(event);
        setWarningMessageState("");
        if (event.target?.value === "") {
            setShowPassword(false);
        }
    }

    return (
        <div className={className} id={id}>
            <div className={`text-input-container ${warningMessageState && "invalid"}`} >
                <input
                    className={placeholder === "Nom d'Utilisateur" || placeholder === "•••••••••••" ? "prank-text-input" : "text-input"}
                    type={textType}
                    placeholder={placeholder}
                    value={value}
                    onChange={handleChange}
                    disabled={disabled}
                    required={isRequired}
                    onInvalid={handleInvalid}
                    enterKeyHint={keyHint}
                    name={name}
                    {...props}
                />
                {showPasswordIcon && value !== "" ? PasswordIcon : icon}
            </div>
            {!disabled && <WarningMessage condition={warningMessageState}>
                {warningMessageState}
            </WarningMessage>}
        </div>
    )
}
