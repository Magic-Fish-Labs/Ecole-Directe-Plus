import { useState, createContext, useContext, useRef } from "react";

import PopUp from "../../generic/PopUps/PopUp";
import Plus from "../../graphics/Plus"
import Button from "../../generic/UserInputs/Button";
import NumberInput from "../../generic/UserInputs/NumberInput";

import { UserDataContext } from "../../../App";
import { addSimulatedGrade } from "../../../utils/gradesTools";

const simulationContext = createContext();

export function GradeSimulationTrigger({ subjectKey, periodKey }) {
    const openGradeSimulation = useContext(simulationContext)
    return <Plus
        className="grade-simulation-trigger"
        role="button"
        tabIndex={0}
        onClick={() => openGradeSimulation(subjectKey, periodKey)}
        onKeyDown={(event) => {
            if (event.key === "Enter") openGradeSimulation(subjectKey, periodKey);
        }}
    />
}

export default function DOMSimulation({ children }) {
    const userData = useContext(UserDataContext);
    const {
        grades: { value: grades, set: setGrades }
    } = userData;

    const [gradeSimulationPopUp, setGradeSimulationPopUp] = useState(false);
    const [gradeSimulationPopUpClosing, setGradeSimulationPopUpClosing] = useState(false);
    const [gradeSimulationSettings, setGradeSimulationSettings] = useState({
        value: 10,
        coef: 1,
        scale: 20,
        name: "",
        type: "",
    });

    const gradeSimulationSubjectKey = useRef("");
    const gradeSimulationPeriodKey = useRef("");

    function openGradeSimulation(subjectKey, periodKey) {
        gradeSimulationPeriodKey.current = periodKey;
        gradeSimulationSubjectKey.current = subjectKey;
        setGradeSimulationPopUp(true);
        setGradeSimulationPopUpClosing(true);
    }

    function changeGradeSimulationSetting(setting, value) {
        setGradeSimulationSettings(old => ({ ...old, [setting]: value }))
    }

    function closeSimulationPopUp() {
        setGradeSimulationPopUpClosing(false);
        setTimeout(() => { setGradeSimulationPopUp(false) }, 500);
    }

    function handleSubmit(event) {
        const periodKey = gradeSimulationPeriodKey.current;
        const subjectKey = gradeSimulationSubjectKey.current;
        event.preventDefault();
        addSimulatedGrade(periodKey, subjectKey, gradeSimulationSettings, grades);
        setGrades(grades);
        closeSimulationPopUp();
    }

    return <simulationContext.Provider value={openGradeSimulation}>
        {children}
        {gradeSimulationPopUp && <PopUp className="grade-simulation-pop-up" onClose={() => { setGradeSimulationPopUp(false) }} externalClosing={!gradeSimulationPopUpClosing}>
            <form id="SUN-form" onSubmit={handleSubmit} noValidate> {/* On utilise le noValidate pour éviter que les navigateurs valident pas le formulaire quand le number input contient un 10.01 au lieu d'un 10 parcequ'on a mis le step à 1 */}
                <div className="grade-simulation-wrapper">
                    <h2>Simuler une note</h2>
                    <div className="grade-simulation-field">
                        Note :
                        <NumberInput instantFocus={true} className="simulation-input" min={0} max={gradeSimulationSettings.scale} value={gradeSimulationSettings.value} onChange={value => { changeGradeSimulationSetting("value", value) }} displayArrowsControllers={false} />
                        /
                        <NumberInput className="simulation-input" min={1} max={1000} value={gradeSimulationSettings.scale} onChange={value => { changeGradeSimulationSetting("scale", value) }} displayArrowsControllers={false} />
                    </div>
                    <div className="grade-simulation-field">
                        Coefficient :
                        <NumberInput className="simulation-input" min={0.1} max={100} step={0.1} value={gradeSimulationSettings.coef} onChange={value => { changeGradeSimulationSetting("coef", value) }} displayArrowsControllers={false} />
                    </div>
                    <p>Cette note disparaîtra au rechargement de la page</p>
                </div>
                <div className="grade-simulation-buttons">
                    <Button className="close simulation-form-button" value="Annuler" onClick={closeSimulationPopUp} />
                    <Button className="submit simulation-form-button" value="Valider" type="submit" />
                </div>
            </form>
        </PopUp>}
    </simulationContext.Provider>
}