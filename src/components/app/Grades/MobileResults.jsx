import { useEffect, useRef, useContext } from "react";
import ContentLoader from "react-content-loader";
import { Link, useLocation } from "react-router-dom";
import { AppContext } from "../../../App";
import {
    MoveableContainer,
    Window,
    WindowHeader,
    WindowContent,
    WindowsContainer
} from "../../generic/Window";

import InfoButton from "../../generic/Informative/InfoButton";
import Tabs from "../../generic/UserInputs/Tabs";
import Grade from "./Grade";
import GradeScaleToggle from "./GradeScaleToggle";
import DropDownMenu from "../../generic/UserInputs/DropDownMenu";
import { Tooltip, TooltipTrigger, TooltipContent } from "../../generic/PopUps/Tooltip";
import { GradeSimulationTrigger } from "./GradeSimulation"

import "./MobileResults.css";
import { DisplayTypes } from "./Grades";

export default function Results({ activeAccount, grades, selectedPeriod, setSelectedPeriod, selectedDisplayType, setSelectedDisplayType, ...props }) {
    const { isMobileLayout, isTabletLayout, usedDisplayTheme, useUserSettings } = useContext(AppContext);
    const settings = useUserSettings();
    const contentLoadersRandomValues = useRef({ subjectNameWidth: Array.from({ length: 13 }, (_) => Math.round(Math.random() * 100) + 100), gradeNumbers: Array.from({ length: 13 }, (_) => Math.floor(Math.random() * 8) + 2) });
    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
            const element = document.getElementById(location.hash.slice(1));
            if (element !== null) {
                if (element.scrollIntoViewIfNeeded !== undefined) {
                    element.scrollIntoViewIfNeeded();
                }
            }
        }
    }, [location, grades]);

    useEffect(() => {
        if (isTabletLayout && selectedDisplayType === "Graphiques") {
            setSelectedDisplayType(DisplayTypes.EVALUATIONS);
        }
    }, [isTabletLayout])

    return (
        <MoveableContainer className="results-container" style={{ flex: "1", display: "flex", flexFlow: "row nowrap", gap: "20px" }} {...props}>
            {!isTabletLayout ? <MoveableContainer style={{ display: "flex", flexFlow: "column nowrap", gap: "20px" }} >
                <GradeScaleToggle />
                <Tabs tabs={Object.values(DisplayTypes)} displayedTabs={["Évaluations", "Graphiques"]} selected={selectedDisplayType} onChange={setSelectedDisplayType} fieldsetName="displayType" dir="column" style={{ flex: 1 }} />
            </MoveableContainer> : null}
            <MoveableContainer className="results-container" style={{ flex: "1", display: "flex", flexFlow: "column nowrap", gap: "20px" }}>
                <MoveableContainer>
                    {!isTabletLayout
                        ? <Tabs contentLoader={grades === undefined} tabs={grades ? Object.keys(grades) : [""]} displayedTabs={grades ? Object.values(grades).map((period) => period.name) : [""]} selected={selectedPeriod} onChange={setSelectedPeriod} fieldsetName="period" dir="row" />
                        : <div className="results-options-container">
                            <DropDownMenu id="periods-ddm" name="periods" options={grades ? Object.keys(grades) : [""]} displayedOptions={grades ? Object.values(grades).map((period) => period.name) : [""]} selected={selectedPeriod} onChange={setSelectedPeriod} />
                            {/* <DropDownMenu id="display-type-ddm" name="displayType" options={["Évaluations", "Graphiques"]} selected={selectedDisplayType} onChange={setSelectedDisplayType} /> */}
                        </div>
                    }
                </MoveableContainer>
                <Window allowFullscreen={true}>
                    <WindowHeader className="results-header">
                        <div className="results-title">
                            <h2>Résultats</h2>
                            <InfoButton className="results-legend">
                                <table style={{ textAlign: "left" }}>
                                    <caption style={{ fontWeight: "800" }}>Légende des notes</caption>
                                    <colgroup>
                                        <col className="visual-demo-col" style={{ width: 80 }} />
                                        <col className="definition-col" />
                                    </colgroup>
                                    <tbody>
                                        <tr>
                                            <th>Note<sup>(x)</sup></th>
                                            <td>Note coefficientée</td>
                                        </tr>
                                        <tr>
                                            <th>Note<sub className="x-unknown">(x)</sub></th>
                                            <td>Note sur <span className="x-unknown">x</span></td>
                                        </tr>
                                        <tr>
                                            <th style={{ opacity: .5 }}>Note</th>
                                            <td>Note non significative</td>
                                        </tr>
                                        <tr>
                                            <th>Abs</th>
                                            <td>Absent</td>
                                        </tr>
                                        <tr>
                                            <th>Disp</th>
                                            <td>Dispensé</td>
                                        </tr>
                                        <tr>
                                            <th>NE</th>
                                            <td>Non évalué</td>
                                        </tr>
                                        <tr>
                                            <th>EA</th>
                                            <td>En attente</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </InfoButton>
                        </div>
                        <div className="general-average">
                            <span>{isMobileLayout ? "Moy. G." : "Moyenne Générale"}</span>
                            {grades && grades[selectedPeriod] && grades[selectedPeriod].classGeneralAverage !== undefined && grades[selectedPeriod].classGeneralAverage !== null && grades[selectedPeriod].classGeneralAverage !== ""
                                ? <Tooltip >
                                    <TooltipTrigger>
                                        <span>
                                            {grades && grades[selectedPeriod]
                                                ? <Grade grade={{ value: grades[selectedPeriod].generalAverage ?? "N/A", scale: 20, coef: 1, isSignificant: true }} />
                                                : <ContentLoader
                                                    animate={settings.get("displayMode") === "quality"}
                                                    speed={1}
                                                    backgroundColor={'#4b48d9'}
                                                    foregroundColor={'#6354ff'}
                                                    viewBox="0 0 80 32"
                                                    height="32"
                                                >
                                                    <rect x="0" y="0" rx="10" ry="10" width="80" height="32" />
                                                </ContentLoader>}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <span>
                                            Moyenne de classe :{" "}
                                            <Grade
                                                grade={{
                                                    value:
                                                        grades[selectedPeriod].classGeneralAverage ?? "N/A",
                                                    scale: 20,
                                                    coef: 1,
                                                    isSignificant: true,
                                                }}
                                            />
                                        </span>
                                    </TooltipContent>
                                </Tooltip>
                                : grades && grades[selectedPeriod]
                                    ? <Grade grade={{ value: grades[selectedPeriod].generalAverage ?? "-", scale: 20, coef: 1, isSignificant: true }} />
                                    : <ContentLoader
                                        animate={settings.get("displayMode") === "quality"}
                                        speed={1}
                                        backgroundColor={'#4b48d9'}
                                        foregroundColor={'#6354ff'}
                                        viewBox="0 0 80 32"
                                        height="32"
                                    >
                                        <rect x="0" y="0" rx="10" ry="10" width="80" height="32" />
                                    </ContentLoader>
                            }
                        </div>
                    </WindowHeader>
                    <WindowContent className="mobile-results">
                        {selectedDisplayType === DisplayTypes.EVALUATIONS
                            ? grades && grades[selectedPeriod]
                                ? Object.keys(grades[selectedPeriod].subjects).map((idx) => {
                                    const el = grades[selectedPeriod].subjects[idx]
                                    if (el.isCategory) {
                                        return [
                                            <div key={"category-" + (el.id || crypto.randomUUID())} className="mobile-category-row mobile-row">
                                                <span className="mobile-head-name">{el.name}<span>Moyenne : <Grade grade={{ value: el.average }} /></span></span>
                                                <span className="category-averages">
                                                    <span>
                                                        Classe : <Grade grade={{ value: el.classAverage }} />
                                                    </span>
                                                    <span>
                                                        Min : <Grade grade={{ value: (el.minAverage < el.average ? el.minAverage : el.average) }} />
                                                    </span>
                                                    <span>
                                                        Max : <Grade grade={{ value: (el.maxAverage > el.average ? el.maxAverage : el.average) }} />
                                                    </span>
                                                </span>
                                            </div>
                                        ]
                                    } else {
                                        return (el && el.grades ? <><div key={"subject-" + el.id} className="mobile-subject-row mobile-row">
                                            <Link to={"#" + (el.id ?? "")} id={(el.id ?? "")} className={`mobile-head-name${(el.id && location.hash === "#" + el.id) ? " selected" : ""}`} replace={true}> {el.name} </Link>
                                            <div className="subject-average"><Grade grade={{ value: el.average, subject: el }} /></div>
                                        </div>
                                            <div key={"grade-" + el.id} className="mobile-grade-row mobile-row">
                                                {el.grades.filter(el => !el.isSimulated).map((grade) => {
                                                    return (
                                                        <Grade grade={grade} key={grade.id} className={`${(grade.id && location.hash === "#" + grade.id) ? " selected" : ""}`} />
                                                    )
                                                })}
                                                <GradeSimulationTrigger subjectKey={idx} selectedPeriod={selectedPeriod} />
                                                {el.grades.filter(el => el.isSimulated).map((grade) => {
                                                    return (
                                                        <Grade grade={grade} key={grade.id} className={`${(grade.id && location.hash === "#" + grade.id) ? " selected" : ""}`} />
                                                    )
                                                })}
                                            </div></> : null)

                                    }
                                }).flat()
                                : Array.from({ length: 13 }, (_, index) => {
                                    const subjectNameWidth = contentLoadersRandomValues.current.subjectNameWidth[index];
                                    return (index % 7 < 1)
                                        ? <div key={crypto.randomUUID()} className="mobile-category-row mobile-row">
                                            <ContentLoader
                                                animate={settings.get("displayMode") === "quality"}
                                                speed={1}
                                                backgroundColor={usedDisplayTheme === "dark" ? "#7979aa" : "#9d9dbd"}
                                                foregroundColor={usedDisplayTheme === "dark" ? "#9494d0" : "#bcbce3"}
                                                style={{ width: subjectNameWidth + "px", maxHeight: "30px" }}
                                            >
                                                <rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
                                            </ContentLoader>
                                            <div className="category-info">
                                                <ContentLoader
                                                    animate={settings.get("displayMode") === "quality"}
                                                    speed={1}
                                                    backgroundColor={usedDisplayTheme === "dark" ? "#7979aa" : "#9d9dbd"}
                                                    foregroundColor={usedDisplayTheme === "dark" ? "#9494d0" : "#bcbce3"}
                                                    style={{ width: "80px", maxHeight: "25px" }}
                                                >
                                                    <rect x="0" y="0" rx="10" ry="10" style={{ width: "100%", height: "100%" }} />
                                                </ContentLoader>
                                                <ContentLoader
                                                    animate={settings.get("displayMode") === "quality"}
                                                    speed={1}
                                                    backgroundColor={usedDisplayTheme === "dark" ? "#7979aa" : "#9d9dbd"}
                                                    foregroundColor={usedDisplayTheme === "dark" ? "#9494d0" : "#bcbce3"}
                                                    style={{ width: "80px", maxHeight: "25px" }}
                                                >
                                                    <rect x="0" y="0" rx="10" ry="10" style={{ width: "100%", height: "100%" }} />
                                                </ContentLoader>
                                                <ContentLoader
                                                    animate={settings.get("displayMode") === "quality"}
                                                    speed={1}
                                                    backgroundColor={usedDisplayTheme === "dark" ? "#7979aa" : "#9d9dbd"}
                                                    foregroundColor={usedDisplayTheme === "dark" ? "#9494d0" : "#bcbce3"}
                                                    style={{ width: "80px", maxHeight: "25px" }}
                                                >
                                                    <rect x="0" y="0" rx="10" ry="10" style={{ width: "100%", height: "100%" }} />
                                                </ContentLoader>
                                            </div>

                                        </div>
                                        : <>
                                            <div key={crypto.randomUUID()} className="mobile-subject-row mobile-row content-loader">
                                                <ContentLoader
                                                    animate={settings.get("displayMode") === "quality"}
                                                    speed={1}
                                                    backgroundColor={usedDisplayTheme === "dark" ? "#63638c" : "#9d9dbd"}
                                                    foregroundColor={usedDisplayTheme === "dark" ? "#7e7eb2" : "#bcbce3"}
                                                    style={{ width: subjectNameWidth + "px", maxHeight: "30px", margin: "0 auto" }}
                                                >
                                                    <rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
                                                </ContentLoader>
                                                <ContentLoader
                                                    animate={settings.get("displayMode") === "quality"}
                                                    speed={1}
                                                    backgroundColor={'#4b48d9'}
                                                    foregroundColor={'#6354ff'}
                                                    viewBox="0 0 50 32"
                                                    height="32"
                                                    style
                                                >
                                                    <rect x="0" y="0" rx="10" ry="10" width="50" height="32" />
                                                </ContentLoader>
                                            </div>
                                            <div key={crypto.randomUUID()} className="mobile-grade-row mobile-row">
                                                {Array.from({ length: contentLoadersRandomValues.current.gradeNumbers[index] }, (_) => {
                                                    return (
                                                        <ContentLoader
                                                            animate={settings.get("displayMode") === "quality"}
                                                            speed={1}
                                                            backgroundColor={usedDisplayTheme === "dark" ? "#63638c" : "#9d9dbd"}
                                                            foregroundColor={usedDisplayTheme === "dark" ? "#7e7eb2" : "#bcbce3"}
                                                            viewBox="0 0 70 50"
                                                            height="30"
                                                            key={crypto.randomUUID()}
                                                        >
                                                            <rect x="0" y="0" rx="25" ry="25" width="50" height="50" />
                                                        </ContentLoader>
                                                    )
                                                })}
                                            </div>

                                        </>

                                })

                            : <div>
                                <p id="WIP-disclaimer">Indisponible en format mobile</p>
                            </div>
                        }
                    </WindowContent>
                </Window>
            </MoveableContainer>
        </MoveableContainer>
        
    )
}