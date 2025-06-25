import { useState, useEffect, useRef, useContext } from "react";
import ContentLoader from "react-content-loader";
import { Link } from "react-router-dom";
import { SettingsContext, UserDataContext } from "../../../App";
import {
    Window,
    WindowHeader,
    WindowContent
} from "../../generic/Window";

import InfoButton from "../../generic/Informative/InfoButton";
import Grade from "./Grade";
import ReverseIcon from "../../graphics/ReverseIcon";

import "./Strengths.css";

export default function Strengths({ className = "", ...props }) {
    const {
        grades: { value: grades },
        activePeriod: { value: activePeriod }
    } = useContext(UserDataContext);

    const settings = useContext(SettingsContext);
    const { displayMode } = settings.user;

    const [strengths, setStrengths] = useState([]);
    const [weaknesses, setWeaknesses] = useState([]);
    const [displayType, setDisplayType] = useState(0); // 0: strengths; 1: weaknesses

    useEffect(() => {
        function strengthsCalculation() {
            if (grades && grades[activePeriod]) {
                const period = grades[activePeriod];
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
    }, [grades, activePeriod]);

    return (<Window className={`strengths ${className}`} {...props}>
        <WindowHeader>
            <button disabled={!grades || !grades[activePeriod]} className="display-type-reverse-button" onClick={() => {setDisplayType((displayType+1) % 2)}} title={displayType === 0 ? "Basculer sur les points faibles" : "Basculer sur les points forts"} > <ReverseIcon /> </button>
            <h2>{displayType === 0 ? "Vos points forts" : "Vos points faibles"}</h2>
            <InfoButton className={"strengths-info " + (displayType === 0 ? "info-strengths" : "info-weaknesses")}>Calculés en fonction de la différence entre votre moyenne et celle de la classe</InfoButton>
        </WindowHeader>
        <WindowContent>
            {grades && grades[activePeriod]
                ? <ol className={"strengths-container " + (displayType === 0 ? "display-strengths" : "display-weaknesses")}>
                    {
                        (displayType === 0 ? strengths : weaknesses).map((strength, idx) => <li key={strength?.subject?.name || crypto.randomUUID()} style={{ "--order": idx }} className="strength-container">
                            <Link to={"#" + strength?.subject?.id} className="strength-wrapper">
                                <span className="subject-container">
                                    <span className="subject-rank">{displayType === 0 ? idx + 1 : (grades && Object.keys(grades[activePeriod].subjects).length || 3) - idx}</span>
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
                                    animate={displayMode.value === "quality"}
                                    speed={1}
                                    backgroundColor={'#35c92e'}
                                    foregroundColor={'#3fef36'}
                                    height="30"
                                    style={{ width: "100%" }}
                                >
                                    <rect x="0" y="0" rx="15" ry="15" style={{ width: "100%", height: "100%" }} />
                                </ContentLoader>
                            </div>
                        </li>)
                    }
                </ol>
            }
        </WindowContent>
    </Window>)
}
