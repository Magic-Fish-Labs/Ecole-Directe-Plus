import { ChangeEvent, FormEvent, forwardRef, InputHTMLAttributes, InvalidEvent, ReactNode, useState } from "react";
import WarningMessage from "../Informative/WarningMessage";
import EyeVisible from "../../graphics/EyeVisible";
import EyeHidden from "../../graphics/EyeHidden";

import "./TextInput.css";

type TextInputType = "text" | "password" | "email" | "search" | "url";

type InlineTextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
    icon?: ReactNode | null,
    warningMessage?: string,
    type?: TextInputType,
};

export default forwardRef<HTMLInputElement, InlineTextInputProps>(({ value, onChange, type = "text", warningMessage = "", icon = null, className = "", id = "", ...props }, ref) => {
    const [warningMessageState, setWarningMessageState] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const showPasswordIcon = type === "password";

    if (showPassword) {
        type = "text";
    }

    const passwordClickHandler = () => setShowPassword((prev) => !prev);
    const PasswordIcon = <>
        {showPassword
            ? <EyeVisible onClick={passwordClickHandler} />
            : <EyeHidden onClick={passwordClickHandler} />
        }
        {icon}
    </>;

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        onChange(event);
        setWarningMessageState("");
        if (event.target?.value === "") {
            setShowPassword(false);
        }
    }

    function handleInvalid(event: FormEvent<HTMLInputElement>) {
        event.preventDefault();
        setWarningMessageState(warningMessage);
        props.onInvalid(event);
    }

    return (
        <div className={className} id={id}>
            <div className={`text-input-container ${warningMessageState && "invalid"}`} >
                <input
                    className="text-input"
                    value={value}
                    type={type}
                    onChange={handleChange}
                    onInvalid={handleInvalid}
                    ref={ref}
                    {...props}
                />
                {showPasswordIcon && value !== "" ? PasswordIcon : icon}
            </div>
            {!props.disabled && <WarningMessage condition={warningMessageState}>
                {warningMessageState}
            </WarningMessage>}
        </div>
    )
});
