
import { forwardRef, useRef } from "react"
import { mergeRefs } from "../../../utils/mergeRefs";
import { applyZoom, getZoomedBoudingClientRect } from "../../../utils/zoom";

import "./CheckBox.css"

const CheckBox = forwardRef(({ label, checked, onChange = (() => { }), id = "", className = "", confetti = {}, onClick, onMouseEnter, onMouseLeave, ...props }, forwardedRef) => {
    const internalRef = useRef();

    function displayConfetti() {
        const bounds = getZoomedBoudingClientRect(internalRef.current.getBoundingClientRect());
        const origin = {
            x: bounds.left + bounds.width / 2,
            y: bounds.top + bounds.height / 2
        }

        window.confetti({
            particleCount: 40,
            spread: 70,
            origin: {
                x: origin.x / applyZoom(window.innerWidth),
                y: origin.y / applyZoom(window.innerHeight)
            },
        });
    }

    const handleOnChange = (event) => {
        if (!checked && confetti.onCheck)
            displayConfetti();
        if (checked && confetti.onUncheck)
            displayConfetti();
        onChange(event);
    }

    if (!id) {
        console.warn("CheckBox components, should have a unique id to avoid conflicts between label targets");
    }

    return (
        <label className="check-box" id={id} htmlFor={id + "-input"} ref={mergeRefs(internalRef, forwardedRef)} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} >
            <input type="checkbox" id={id + "-input"} checked={!!checked} onChange={handleOnChange} {...props} />
            {label ? <span className="text-label">{label}</span> : null}
        </label>
    );
});

export default CheckBox;
