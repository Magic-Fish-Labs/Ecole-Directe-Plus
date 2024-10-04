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

export default function Strengths({ activeAccount, grades, selectedPeriod, className = "", ...props }) {
    const [strengths, setStrengths] = useState([]);
    const { useUserSettings } = useContext(AppContext);
    const settings = useUserSettings();


    useEffect(() => {
        function strengthsCalculation() {
            if (grades && grades[selectedPeriod]) {
                const STRENGTHS_NUMBER = 3;
                const period = grades[selectedPeriod];
                const newStrengths = Array.from({ length: STRENGTHS_NUMBER }, () => undefined);
                
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
                    for (let i = 0; i < newStrengths.length; i++) {
                        const strength = newStrengths[i];
                        if (strength === undefined || (subject.average !== "N/A" && strength.subject.average === "N/A") || (subject.average !== "N/A" && strength.subject.average !== "N/A" && algebricDiff >= strength.algebricDiff)) {
                            newStrengths.splice(i, 0, { algebricDiff, subject })
                            newStrengths.splice(newStrengths.length - 1, 1);
                            break;
                        }
                    }
                }
                setStrengths(newStrengths);
            }
        }
        
        strengthsCalculation()
    }, [grades, activeAccount, selectedPeriod]);

    return (<Window className={`strengths ${className}`} {...props}>
        <WindowHeader>
            <h2>Vos points forts</h2>
            <InfoButton className="strengths-info">Calculés en fonction de la différence entre votre moyenne et celle de la classe</InfoButton>
        </WindowHeader>
        <WindowContent>
            {grades && grades[selectedPeriod]
                ? <ol className="strengths-container">
                    {
                        strengths.map((strength, idx) => <li key={crypto.randomUUID()} className="strength-container">
                            <Link to={"#" + strength?.subject?.id} className="strength-wrapper">
                                <span className="subject-container">
                                    <span className="subject-rank">{idx + 1}</span>
                                    <span className="subject-name">{strength?.subject?.name}</span>
                                </span>
                                <span className="subject-average"><Grade grade={{ value: strength?.subject?.average ?? "N/A" }} /></span>
                            </Link>
                        </li>)
                    }
                </ol>
                : <ol className="strengths-container">
                    {
                        Array.from({ length: 3 }, (_, index) => <li key={crypto.randomUUID()} className="strength-container">
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
