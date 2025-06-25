import { useEffect, useRef, useContext, useState } from "react";
import ContentLoader from "react-content-loader";
import { Link, useLocation } from "react-router-dom";
import { Tooltip, TooltipTrigger, TooltipContent } from "../../generic/PopUps/Tooltip";
import { AppContext, SettingsContext, UserDataContext } from "../../../App";
import {
    MoveableContainer,
    Window,
    WindowHeader,
    WindowContent
} from "../../generic/Window";

import InfoButton from "../../generic/Informative/InfoButton";
import Tabs from "../../generic/UserInputs/Tabs";
import Grade from "./Grade";
import GradeScaleToggle from "./GradeScaleToggle";
import DropDownMenu from "../../generic/UserInputs/DropDownMenu";
import Charts from "./Charts";
import { GradeSimulationTrigger } from "./GradeSimulation"

import "./Results.css";
import { DisplayTypes } from "./Grades";

export default function Results({ selectedDisplayType, setSelectedDisplayType, ...props }) {
    const { isTabletLayout, usedDisplayTheme } = useContext(AppContext);

    const userData = useContext(UserDataContext);
    const {
        grades: { value: grades },
        activePeriod: { value: activePeriod, set: setActivePeriod }
    } = userData;

    const settings = useContext(SettingsContext);
    const { displayMode } = settings.user;

    const contentLoadersRandomValues = useRef({ subjectNameWidth: Array.from({ length: 13 }, (_) => Math.round(Math.random() * 100) + 100), gradeNumbers: Array.from({ length: 13 }, (_) => Math.floor(Math.random() * 8) + 2) })
    const location = useLocation();

    const isDisplayModeQuality = displayMode === "quality";

    useEffect(() => {
        if (location.hash) {
            const element = document.getElementById(location.hash.slice(1));
            if (element !== null) {
                if (element.scrollIntoViewIfNeeded !== undefined) {
                    element.scrollIntoViewIfNeeded();
                } else {
                    element.scrollIntoView();
                }
            }
        }
    }, [location, grades]);

    return (
        <MoveableContainer className="results-container" style={{ flex: "1", display: "flex", flexFlow: "row nowrap", gap: "20px" }} name="results-utimate-container" {...props}>
            {!isTabletLayout ? <MoveableContainer style={{ display: "flex", flexFlow: "column nowrap", gap: "20px" }} >
                <GradeScaleToggle />
                <Tabs tabs={Object.values(DisplayTypes)} displayedTabs={["Évaluations", "Graphiques"]} selected={selectedDisplayType} onChange={setSelectedDisplayType} fieldsetName="displayType" dir="column" style={{ flex: 1 }} />
            </MoveableContainer> : null}
            <MoveableContainer className="results-container" style={{ flex: "1", display: "flex", flexFlow: "column nowrap", gap: "20px" }}>
                <MoveableContainer>
                    {!isTabletLayout
                        ? <Tabs contentLoader={grades === undefined} tabs={grades ? Object.keys(grades) : [""]} displayedTabs={grades ? Object.values(grades).map((period) => period.name) : [""]} selected={activePeriod} onChange={setActivePeriod} fieldsetName="period" dir="row" />
                        : <div className="results-options-container">
                            <DropDownMenu name="periods" options={grades ? Object.keys(grades) : [""]} displayedOptions={grades ? Object.values(grades).map((period) => period.name) : [""]} selected={activePeriod} onChange={setActivePeriod} />
                            <DropDownMenu name="displayType" options={Object.values(DisplayTypes)} displayedOptions={["Évaluations", "Graphiques"]} selected={selectedDisplayType} onChange={setSelectedDisplayType} />
                        </div>
                    }
                </MoveableContainer>
                <Window allowFullscreen={true} fullscreenTargetName="results-utimate-container">
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
                                            <th>Note<sub className="x-unknown">/x</sub></th>
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
                                        <tr>
                                            <th>Comp</th>
                                            <td>Compétences</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </InfoButton>
                        </div>
                        <div className="general-average">
                            <span>Moyenne Générale</span>
                            <Tooltip enableHover={grades?.[activePeriod]?.classGeneralAverage || grades?.[activePeriod]?.classGeneralAverage === 0} >
                                <TooltipTrigger>
                                    <span>
                                        {grades && grades[activePeriod]
                                            ? <Grade grade={{ value: grades[activePeriod]?.generalAverage ?? "N/A", scale: 20, coef: 1, isSignificant: true }} />
                                            : <ContentLoader
                                                animate={isDisplayModeQuality}
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
                                                value: grades?.[activePeriod].classGeneralAverage ?? "N/A", // !:! bzr undefined ici si pas le "?."
                                                scale: 20,
                                                coef: 1,
                                                isSignificant: true,
                                            }}
                                        />
                                    </span>
                                </TooltipContent>
                            </Tooltip>
                            {/* : grades && grades[activePeriod]
                                    ? <Grade grade={{ value: grades[activePeriod]?.generalAverage ?? "-", scale: 20, coef: 1, isSignificant: true }} />
                                    : <ContentLoader
                                        animate={isDisplayModeQuality}
                                        speed={1}
                                        backgroundColor={'#4b48d9'}
                                        foregroundColor={'#6354ff'}
                                        viewBox="0 0 80 32"
                                        height="32"
                                    >
                                        <rect x="0" y="0" rx="10" ry="10" width="80" height="32" />
                                    </ContentLoader>
                            } */}
                        </div>
                    </WindowHeader>
                    <WindowContent className="results">
                        {selectedDisplayType === DisplayTypes.EVALUATIONS
                            ? <table className="grades-table">
                                <colgroup>
                                    <col className="subjects-col" />
                                    <col className="moyennes-col" />
                                    <col className="grades-col" />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th id="subject-head">MATIÈRES</th>
                                        <th id="moyenne-head">MOYENNES</th>
                                        <th id="grades-head">ÉVALUATIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {grades && grades[activePeriod]
                                        ? Object.keys(grades[activePeriod].subjects).map((idx) => {
                                            const el = grades[activePeriod].subjects[idx];
                                            return (
                                                <tr key={el.id} className={el.isCategory ? "category-row" : "subject-row"}>
                                                    <th className="head-cell">
                                                        {el.isCategory
                                                            ? <div className="head-name">{el.name}</div>
                                                            : <Link to={"#" + (el.id ?? "")} id={(el.id ?? "")} className={`head-name${(el.id && location.hash === "#" + el.id) ? " selected" : ""}`} replace={true}>{el.name}</Link>
                                                        }
                                                    </th>
                                                    <td className="moyenne-cell">
                                                        {el.isCategory
                                                            ? <Grade grade={{ value: el.average }} />
                                                            : <Grade grade={{ value: el.average, subject: el }} />
                                                        }
                                                    </td>
                                                    <td className="grades-cell">
                                                        {el.isCategory
                                                            ? <div className="category-info">
                                                                <span>Classe : <Grade grade={{ value: el.classAverage }} /></span><span>Min : <Grade grade={{ value: (el.minAverage < el.average ? el.minAverage : el.average) }} /></span><span>Max : <Grade grade={{ value: (el.maxAverage > el.average ? el.maxAverage : el.average) }} /></span>
                                                            </div>
                                                            : <div className="grades-values">
                                                                {el.grades.filter(el => !el.isSimulated).map((grade) => {
                                                                    return <Grade grade={grade} key={grade.id} className={`${(grade.id && location.hash === "#" + grade.id) ? " selected" : ""}`} />
                                                                })}
                                                                <GradeSimulationTrigger subjectKey={idx} periodKey={activePeriod} />
                                                                {el.grades.filter(el => el.isSimulated).map((grade) => {
                                                                    return <Grade grade={grade} key={grade.id} className={`${(grade.id && location.hash === "#" + grade.id) ? " selected" : ""}`} />
                                                                })}
                                                            </div>}
                                                    </td>
                                                </tr>
                                            )
                                        })
                                        : Array.from({ length: 13 }, (_, index) => {
                                            const subjectNameWidth = contentLoadersRandomValues.current.subjectNameWidth[index];
                                            return <tr key={crypto.randomUUID()} className={index % 7 < 1 ? "category-row" : "subject-row"}>
                                                <th className="head-cell">
                                                    <ContentLoader
                                                        animate={isDisplayModeQuality}
                                                        speed={1}
                                                        backgroundColor={usedDisplayTheme === "dark" ? "#63638c" : "#9d9dbd"}
                                                        foregroundColor={usedDisplayTheme === "dark" ? "#7e7eb2" : "#bcbce3"}
                                                        style={{ width: subjectNameWidth + "px", maxHeight: "30px" }}
                                                    >
                                                        <rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
                                                    </ContentLoader>
                                                </th>
                                                <td className="moyenne-cell">
                                                    <ContentLoader
                                                        animate={isDisplayModeQuality}
                                                        speed={1}
                                                        backgroundColor={usedDisplayTheme === "dark" ? "#7878ae" : "#75759a"}
                                                        foregroundColor={usedDisplayTheme === "dark" ? "#9292d4" : "#9292c0"}
                                                        viewBox="0 0 50 50"
                                                        style={{ maxHeight: "30px" }}
                                                    >
                                                        <rect x="0" y="0" rx="25" ry="25" width="50" height="50" />
                                                    </ContentLoader>
                                                </td>
                                                <td className="grades-cell">
                                                    {index % 7 < 1
                                                        ? <div className="category-info">
                                                            <ContentLoader
                                                                animate={isDisplayModeQuality}
                                                                speed={1}
                                                                backgroundColor={usedDisplayTheme === "dark" ? "#63638c" : "#9d9dbd"}
                                                                foregroundColor={usedDisplayTheme === "dark" ? "#7e7eb2" : "#bcbce3"}
                                                                style={{ width: "80px", maxHeight: "25px" }}
                                                            >
                                                                <rect x="0" y="0" rx="10" ry="10" style={{ width: "100%", height: "100%" }} />
                                                            </ContentLoader>
                                                            <ContentLoader
                                                                animate={isDisplayModeQuality}
                                                                speed={1}
                                                                backgroundColor={usedDisplayTheme === "dark" ? "#63638c" : "#9d9dbd"}
                                                                foregroundColor={usedDisplayTheme === "dark" ? "#7e7eb2" : "#bcbce3"}
                                                                style={{ width: "80px", maxHeight: "25px" }}
                                                            >
                                                                <rect x="0" y="0" rx="10" ry="10" style={{ width: "100%", height: "100%" }} />
                                                            </ContentLoader>
                                                            <ContentLoader
                                                                animate={isDisplayModeQuality}
                                                                speed={1}
                                                                backgroundColor={usedDisplayTheme === "dark" ? "#63638c" : "#9d9dbd"}
                                                                foregroundColor={usedDisplayTheme === "dark" ? "#7e7eb2" : "#bcbce3"}
                                                                style={{ width: "80px", maxHeight: "25px" }}
                                                            >
                                                                <rect x="0" y="0" rx="10" ry="10" style={{ width: "100%", height: "100%" }} />
                                                            </ContentLoader>
                                                        </div>
                                                        : <div className="grades-values">
                                                            {Array.from({ length: contentLoadersRandomValues.current.gradeNumbers[index] }, (_) => {
                                                                return (
                                                                    <ContentLoader
                                                                        animate={isDisplayModeQuality}
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
                                                    }
                                                </td>
                                            </tr>
                                        })
                                    }
                                </tbody>
                            </table>
                            : grades && grades[activePeriod]
                                ? <Charts activePeriod={activePeriod} />
                                : <ContentLoader
                                    animate={isDisplayModeQuality}
                                    speed={1}
                                    style={{ width: "100%", height: "100%", padding: "25px" }}
                                    backgroundColor={usedDisplayTheme === "dark" ? "#63638c" : "#9d9dbd"}
                                    foregroundColor={usedDisplayTheme === "dark" ? "#7e7eb2" : "#bcbce3"}
                                >
                                    <rect x="0" y="70%" rx="10" ry="10" style={{ width: "18%", height: "30%", padding: "10px" }} />
                                    <rect x="20%" y="65%" rx="10" ry="10" style={{ width: "18%", height: "45%", padding: "10px" }} />
                                    <rect x="40%" y="46%" rx="10" ry="10" style={{ width: "18%", height: "64%", padding: "10px" }} />
                                    <rect x="60%" y="10%" rx="10" ry="10" style={{ width: "18%", height: "90%", padding: "10px" }} />
                                    <rect x="80%" y="52%" rx="10" ry="10" style={{ width: "18%", height: "48%", padding: "10px" }} />
                                </ContentLoader>
                        }
                    </WindowContent>
                </Window>
            </MoveableContainer>
        </MoveableContainer>
    )
}