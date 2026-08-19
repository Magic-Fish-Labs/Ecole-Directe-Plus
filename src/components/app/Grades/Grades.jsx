import { useState, useEffect } from "react";

import StreakScore from "./StreakScore";
import Information from "./Information";
import Strengths from "./Strengths";
import Results from "./Results";
import MobileResults from "./MobileResults";

import {
    WindowsContainer,
    WindowsLayout,
} from "../../generic/Window";

import "./Grades.css";
import DOMSimulation from "./GradeSimulation";

export default function Grades({ grades, fetchUserGrades, activeAccount, isLoggedIn, useUserData, sortGrades, isTabletLayout }) {
    const userData = useUserData();
    const [selectedDisplayType, setSelectedDisplayType] = useState("Évaluations");
    const [selectedPeriod, setSelectedPeriod] = useState(userData.get("activePeriod"));
    const sortedGrades = userData.get("sortedGrades");

    useEffect(() => {
        setSelectedPeriod(userData.get("activePeriod"));
    }, [sortedGrades]);

    useEffect(() => {
        userData.set("activePeriod", selectedPeriod);
    }, [selectedPeriod]);

    useEffect(() => {
        document.title = "Notes • Ecole Directe Plus";
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        if (isLoggedIn) {
            if (grades.length < 1 || grades[activeAccount] === undefined) {
                fetchUserGrades(controller);
            } else if (!sortedGrades) {
                sortGrades(grades, activeAccount);
            }
        }
        return () => controller.abort();
    }, [grades, isLoggedIn, activeAccount]);

    return (
        <div id="grades">
            <WindowsContainer name="grades">
                <WindowsLayout direction="row" ultimateContainer={true}>
                    <WindowsLayout direction="column">
                        <StreakScore streakScore={(sortedGrades && sortedGrades[selectedPeriod]?.streak) ?? 0} streakHighScore={(sortedGrades && sortedGrades[selectedPeriod]?.maxStreak) ?? 0} />
                        <Information sortedGrades={sortedGrades} activeAccount={activeAccount} selectedPeriod={selectedPeriod} />
                        <Strengths sortedGrades={sortedGrades} activeAccount={activeAccount} selectedPeriod={selectedPeriod} />
                    </WindowsLayout>
                    <WindowsLayout growthFactor={2}>
                        <DOMSimulation>
                            {isTabletLayout
                                ? <MobileResults activeAccount={activeAccount} sortedGrades={sortedGrades} selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} selectedDisplayType={selectedDisplayType} setSelectedDisplayType={setSelectedDisplayType} />
                                : <Results activeAccount={activeAccount} sortedGrades={sortedGrades} selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} selectedDisplayType={selectedDisplayType} setSelectedDisplayType={setSelectedDisplayType} />}
                        </DOMSimulation>
                    </WindowsLayout>
                </WindowsLayout>
            </WindowsContainer>
        </div>
    );
}
