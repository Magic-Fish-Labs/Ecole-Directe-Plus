import { useRef, useContext } from "react"
import { AppContext } from "../../../App"
import Grade from "../Grades/Grade"
import { Link, useNavigate } from "react-router-dom"
import { Window, WindowHeader, WindowContent } from "../../generic/Window"
import {
    BadgePlusInfo,
    BadgeStarInfo,
    BadgeCheckInfo,
    BadgeStonkInfo,
    BadgeStreakInfo,
    BadgeMehInfo,
} from "../../generic/badges/BadgeInfo";

import "./LastGrades.css"
import { formatDateRelative } from "../../../utils/date";
import ContentLoader from "react-content-loader"

import "../../generic/events/halloween/css/modifier.css"
import { currentPeriodEvent } from "../../generic/events/setPeriodEvent";

export default function LastGrades({ activeAccount, className = "", ...props }) {
    const navigate = useNavigate();
    const contentLoadersRandomValues = useRef({ subjectNameWidth: Array.from({ length: 3 }, (_, i) => Math.floor(Math.random() * 75) + 75), badgesNumber: Array.from({ length: 3 }, (_, i) => Math.floor(Math.random() * 3) + 1), datesWidth: Array.from({ length: 3 }, (_, i) => Math.floor(Math.random() * 25) + 85) })

    const { actualDisplayTheme, useUserData, useUserSettings } = useContext(AppContext)
    const lastGrades = useUserData().get("lastGrades");
    const settings = useUserSettings();

    const isPartyModeEnabled = settings.get("isPartyModeEnabled");
    const isPeriodEventEnabled = settings.get("isPeriodEventEnabled");

    return (<Window className={`last-grades ${className}`}>
        <WindowHeader onClick={() => navigate("../grades")}>
            <h2>Dernières notes</h2>
        </WindowHeader>
        <WindowContent>
            <ol className="last-grades-container">
                {lastGrades !== undefined
                    ? lastGrades.length > 0
                        ? lastGrades.map((el) => <li key={el.id} className="last-grade-container">
                        <Link to={`/app/${activeAccount}/grades#` + el.id} className="last-grade-wrapper">
                            <span className={`last-grade-value ${isPartyModeEnabled && isPeriodEventEnabled && currentPeriodEvent === "halloween" && "halloween-div-patcher"}`}><Grade grade={{ value: el.value ?? "N/A", scale: el.scale }} /></span>
                            <span className={`last-grade-name`}>{el.subjectName}</span>
                            <span className="badges-container">
                                {el.badges.includes("star") && <BadgeStarInfo />}
                                {el.badges.includes("bestStudent") && <BadgePlusInfo />}
                                {el.badges.includes("greatStudent") && <BadgeCheckInfo />}
                                {el.badges.includes("stonks") && <BadgeStonkInfo />}
                                {el.badges.includes("meh") && <BadgeMehInfo />}
                                {el.badges.includes("keepOnFire") && <BadgeStreakInfo />}
                            </span>
                            <span className="last-grade-date">{formatDateRelative(el.date, window.matchMedia("(max-width: 1850px)").matches)}</span>
                        </Link>
                    </li>) : <p className="no-grade-placeholder">Vous n'avez pour l'instant aucune note. Profitez-en le temps que ça dure</p>
                    : Array.from({ length: 3 }, (_, i) => <li key={i} className="last-grade-container">
                        <div className="last-grade-wrapper">
                            <ContentLoader
                                animate={settings.get("displayMode") === "quality"}
                                speed={1}
                                backgroundColor={'#4b48d9'}
                                foregroundColor={'#6354ff'}
                                className="last-grade-value"
                                height={32}
                                style={{ padding: 0 }}
                            >
                                <rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
                            </ContentLoader>
                            <ContentLoader
                                animate={settings.get("displayMode") === "quality"}
                                speed={1}
                                backgroundColor={actualDisplayTheme === "dark" ? "#63638c" : "#9d9dbd"}
                                foregroundColor={actualDisplayTheme === "dark" ? "#7e7eb2" : "#bcbce3"}
                                style={{ width: contentLoadersRandomValues.current.subjectNameWidth[i] + "px", height: "25px" }}
                                className="last-grade-name"
                            >
                                <rect x="0" y="0" rx="10" ry="10" style={{ width: "100%", height: "100%" }} />
                            </ContentLoader>
                            <span className="badges-container">
                                {Array.from({ length: contentLoadersRandomValues.current.badgesNumber[i] }, (_, i) => <ContentLoader
                                    animate={settings.get("displayMode") === "quality"}
                                    key={i}
                                    speed={1}
                                    backgroundColor={actualDisplayTheme === "dark" ? "#63638c" : "#9d9dbd"}
                                    foregroundColor={actualDisplayTheme === "dark" ? "#7e7eb2" : "#bcbce3"}
                                    style={{ width: "20px", height: "20px" }}
                                    className="last-grade-name"
                                >
                                    <rect x="0" y="0" rx="10" ry="10" style={{ width: "100%", height: "100%" }} />
                                </ContentLoader>)}
                            </span>
                            <span className="last-grade-date">
                                <ContentLoader
                                    animate={settings.get("displayMode") === "quality"}
                                    speed={1}
                                    backgroundColor={actualDisplayTheme === "dark" ? "#63638c" : "#9d9dbd"}
                                    foregroundColor={actualDisplayTheme === "dark" ? "#7e7eb2" : "#bcbce3"}
                                    style={{ width: contentLoadersRandomValues.current.datesWidth[i] + "px", height: "25px" }}
                                    className="last-grade-name"
                                >
                                    <rect x="0" y="0" rx="10" ry="10" style={{ width: "100%", height: "100%" }} />
                                </ContentLoader>
                            </span>
                        </div>
                    </li>)
                }
            </ol>
        </WindowContent>
    </Window>
    )
}