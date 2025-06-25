import { useState, useEffect, useContext } from "react";

import { AppContext, SettingsContext } from "../../../App";

import "./GradeScaleToggle.css";


export default function GradeScaleToggle() {
    const [magicResizer, setMagicResizer] = useState(101);
    // This si VERY sad but try to remove it and you'll see that the width of the tabs "Évaluations" and "Graphiques" is smaller (on Firefox only).
    // We don't know why but setting the value of the GradeScaleToggle fix this (it make it a little bit larger as we want even if we set a smaller value after) so this will be the solution now.
    const settings = useContext(SettingsContext);
    const { gradeScale, isGradeScaleEnabled } = settings.user;

    useEffect(() => {
        setMagicResizer(undefined)
    }, [])

    function handleClick() {
        isGradeScaleEnabled.set(!isGradeScaleEnabled.value);
    }

    function changeGradeScale(delta, round=1) {
        const newGradeScale = Math.round((gradeScale.value + delta) / round) * round;
        
        const { min, max } = gradeScale.properties;
        if (newGradeScale < min) {
            gradeScale.set(min);
        } else if (newGradeScale > max) {
            gradeScale.set(max);
        } else {
            gradeScale.set(newGradeScale);
        }
    }

    const handleScroll = (event) => {
        if (event.deltaY === 0) {
            return;
        }

        changeGradeScale(-(((event.deltaY || event.deltaX) / Math.abs(event.deltaY || event.deltaX))*(1 + event.shiftKey*4)), 1 + event.shiftKey*4);
    }

    const handleKeyDown = (event) => {
        if (event.key === "ArrowUp") {
            changeGradeScale(1)
        } else if (event.key === "ArrowDown") {
            changeGradeScale(-1)            
        } else if (event.key === "ArrowRight") {
            changeGradeScale(5, 5)
        } else if (event.key === "ArrowLeft") {
            changeGradeScale(-5, 5)            
        }
    }
    

    return (
        <button className={`grade-scale-toggle ${isGradeScaleEnabled.value && "active"}`} title={`Uniformiser tous les barèmes sur ${gradeScale.value}`} onClick={handleClick} onWheel={handleScroll} onKeyDown={handleKeyDown} >
            <div className="top">x</div> <div className="bottom">{magicResizer ? magicResizer : gradeScale.value}</div>
        </button>
    )
}
