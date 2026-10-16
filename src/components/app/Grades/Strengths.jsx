import { useState, useEffect, useRef, useContext } from "react";
import ContentLoader from "react-content-loader";
import { Link, useLocation } from "react-router-dom";
import { AppContext } from "../../../App";
import {
    Window,
    WindowHeader,
    WindowContent
} from "../../generic/Window";

import InfoButton from "../../generic/Informative/InfoButton";
import Grade from "./Grade";

import "./Strengths.css";
import ReverseIcon from "../../graphics/ReverseIcon";

export default function Strengths({ activeAccount, sortedGrades, selectedPeriod, className = "", ...props }) {
    const [strengths, setStrengths] = useState([]);
    const [weaknesses, setWeaknesses] = useState([]);
    const [displayType, setDisplayType] = useState(0); // 0: strengths; 1: weaknesses
    const { useUserSettings } = useContext(AppContext);
    const settings = useUserSettings();
    const showWeaknesses = !!settings.get("showWeaknesses");
    const displayedDisplayType = showWeaknesses ? displayType : 0;

    useEffect(() => {
        if (!showWeaknesses) {
            setDisplayType(0);
        }
    }, [showWeaknesses]);

    useEffect(() => {
        function strengthsCalculation() {
            if (sortedGrades && sortedGrades[selectedPeriod]) {
                const period = sortedGrades[selectedPeriod];
                const STRENGTHS_NUMBER = 3;
                const newStrengths = Array.from({ length: STRENGTHS_NUMBER }, () => undefined);
                const newWeaknesses = Array.from({ length: STRENGTHS_NUMBER }, () => undefined);
                
                for (let subjectKey in period.subjects) {
                    const subject = period.subjects[subjectKey];
                    if (subject.isCategory) { continue };
                    let algebricDiff;
                    if (subject.average !== "N/A" && subject.classAverage !== "N/A") {
                        algebricDiff = subject.average - subject.classAverage;
                    } else if (subject.average !== "N/A") {
                        algebricDiff = subject.average;
                    } else {
                        algebricDiff = 0;
                    }
                    // strengths
                    for (let i = 0; i < newStrengths.length; i++) {
                        const strength = newStrengths[i];
                        if (strength === undefined || (subject.average !== "N/A" && strength.subject.average === "N/A") || (subject.average !== "N/A" && strength.subject.average !== "N/A" && algebricDiff >= strength.algebricDiff)) {
                            newStrengths.splice(i, 0, { algebricDiff, subject })
                            newStrengths.splice(newStrengths.length - 1, 1);
                            break;
                        }
                    }
                    // weaknesses
                    for (let i = 0; i < newWeaknesses.length; i++) {
                        const strength = newWeaknesses[i];
                        if (strength === undefined || (subject.average !== "N/A" && strength.subject.average === "N/A") || (subject.average !== "N/A" && strength.subject.average !== "N/A" && algebricDiff <= strength.algebricDiff)) {
                            newWeaknesses.splice(i, 0, { algebricDiff, subject })
                            newWeaknesses.splice(newWeaknesses.length - 1, 1);
                            break;
                        }
                    }
                }
                setStrengths(newStrengths);
                setWeaknesses(newWeaknesses);
            }
        }
        
        strengthsCalculation()
    }, [sortedGrades, activeAccount, selectedPeriod]);

    return (<Window className={`strengths ${className}`} {...props}>
        <WindowHeader>
            {showWeaknesses && <button disabled={!sortedGrades || !sortedGrades[selectedPeriod]} className="display-type-reverse-button" onClick={() => {setDisplayType((displayType+1) % 2)}} title={displayedDisplayType === 0 ? "Basculer sur les points faibles" : "Basculer sur les points forts"} > <ReverseIcon /> </button>}
            <h2>{displayedDisplayType === 0 ? "Vos points forts" : "Vos points faibles"}</h2>
            <InfoButton className={"strengths-info " + (displayedDisplayType === 0 ? "info-strengths" : "info-weaknesses")}>Calculés en fonction de la différence entre votre moyenne et celle de la classe</InfoButton>
        </WindowHeader>
        <WindowContent>
            {sortedGrades && sortedGrades[selectedPeriod]
                ? <ol className={"strengths-container " + (displayedDisplayType === 0 ? "display-strengths" : "display-weaknesses")}>
                    {
                        (displayedDisplayType === 0 ? strengths : weaknesses).map((strength, idx) => <li key={strength?.subject?.name || crypto.randomUUID()} style={{ "--order": idx }} className="strength-container">
                            <Link to={"#" + strength?.subject?.id} className="strength-wrapper">
                                <span className="subject-container">
                                    <span className="subject-rank">{displayedDisplayType === 0 ? idx + 1 : (sortedGrades && Object.keys(sortedGrades[selectedPeriod].subjects).length || 3) - idx}</span>
                                    <span className="subject-name">{strength?.subject?.name}</span>
                                </span>
                                <span className="subject-average"><Grade grade={{ value: strength?.subject?.average ?? "N/A" }} /></span>
                            </Link>
                        </li>)
                    }
                </ol>
                : <ol className="strengths-container display-strengths">
                    {
                        Array.from({ length: 3 }, (_, index) => <li key={crypto.randomUUID()} style={{ "--order": -69 /* skip the animation */ }} className="strength-container">
                            <div className="strength-wrapper">
                                <ContentLoader
                                    animate={settings.get("displayMode") === "quality"}
                                    speed={1}
                                    backgroundColor={'#35c92e'}
                                    foregroundColor={'#3fef36'}
                                    height="30"
                                    style={{width: "100%"}}
                                >
                                    <rect x="0" y="0" rx="15" ry="15" style={{width: "100%", height: "100%"}} />
                                </ContentLoader>
                            </div>
                        </li>)
                    }
                </ol>
            }
        </WindowContent>
    </Window>)
}
