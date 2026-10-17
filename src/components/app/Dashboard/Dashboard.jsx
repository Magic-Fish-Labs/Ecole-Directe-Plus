
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { endOfDay, format, startOfDay } from "date-fns";

import {
    WindowsContainer,
    WindowsLayout,
    Window,
    WindowHeader,
    WindowContent
} from "../../generic/Window";
import LastGrades from "./LastGrades";
import Notebook from "../Homeworks/Notebook";
import BottomSheet from "../../generic/PopUps/BottomSheet";
import EncodedHTMLDiv from "../../generic/CustomDivs/EncodedHTMLDiv";
import UpcomingAssignments from "../Homeworks/UpcomingAssignments";
import PopUp from "../../generic/PopUps/PopUp";
import { MaybeEncodedHTML } from "../Modules/Shared";
import { normalizeCourse } from "../Timetable/Timetable";

import "./Dashboard.css";
import { formatDateRelative } from "../../../utils/date";
import FileComponent from "../../generic/FileComponent";

function parsePostitDate(value) {
    const match = String(value ?? "").match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (!match) {
        return null;
    }
    const date = new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3]),
        Number(match[4] ?? 0),
        Number(match[5] ?? 0),
        Number(match[6] ?? 0),
    );
    return Number.isNaN(date.getTime()) ? null : date;
}

function isPostitActive(postit, now = new Date()) {
    const debut = parsePostitDate(postit.dateDebut);
    const finRaw = String(postit.dateFin ?? "");
    const fin = parsePostitDate(postit.dateFin);
    if (debut && now < startOfDay(debut)) {
        return false;
    }
    if (fin) {
        const finMoment = finRaw.length <= 10 ? endOfDay(fin) : fin;
        if (now > finMoment) {
            return false;
        }
    }
    return true;
}

function postitStyle(postit) {
    const color = String(postit.couleur ?? "");
    return /^#[0-9a-f]{6}$/i.test(color) ? { borderLeftColor: color } : undefined;
}

function postitAuthor(postit) {
    const auteur = postit.auteur ?? {};
    return [auteur.prenom, auteur.particule, auteur.nom].filter(Boolean).join(" ");
}

function formatCompactHour(date) {
    return date.getMinutes() > 0 ? format(date, "H'h'mm") : format(date, "H'h'");
}

export default function Dashboard({ fetchUserGrades, grades, fetchHomeworks, fetchTimetable, fetchCommonTimeline, activeAccount, isLoggedIn, useUserData, sortGrades, isTabletLayout }) {
    const navigate = useNavigate();
    const userData = useUserData();
    const location = useLocation()

    const sortedGrades = userData.get("sortedGrades");
    const homeworks = useUserData("sortedHomeworks");

    const hashParameters = location.hash.split(";")
    const selectedTask = hashParameters.length > 1 && homeworks.get() && homeworks.get()[hashParameters[0].slice(1)]?.find(e => e.id == hashParameters[1])

    const [todayCourses, setTodayCourses] = useState([]);
    const [timetableStatus, setTimetableStatus] = useState("loading");
    const postits = useUserData("postits");

    const activePostits = useMemo(() => {
        const list = postits.get();
        if (!Array.isArray(list)) {
            return [];
        }
        return list
            .filter((postit) => isPostitActive(postit))
            .sort((a, b) => (a.ordre ?? Number.MAX_SAFE_INTEGER) - (b.ordre ?? Number.MAX_SAFE_INTEGER))
            .slice(0, 5);
    }, [postits.get()]);

    // Behavior
    useEffect(() => {
        document.title = "Accueil • Ecole Directe Plus";
    }, [])

    useEffect(() => {
        if (!isLoggedIn || typeof fetchTimetable !== "function") {
            setTimetableStatus("ready");
            return undefined;
        }
        const controller = new AbortController();
        const today = new Date();
        setTimetableStatus("loading");
        fetchTimetable({ startDate: startOfDay(today), endDate: endOfDay(today), controller })
            .then((rawCourses) => {
                if (controller.signal.aborted) {
                    return;
                }
                const normalized = (rawCourses ?? [])
                    .map(normalizeCourse)
                    .filter(Boolean)
                    .sort((a, b) => a.start - b.start);
                setTodayCourses(normalized);
                setTimetableStatus("ready");
            })
            .catch((error) => {
                if (error?.name !== "AbortError") {
                    setTimetableStatus("error");
                }
            });

        return () => {
            controller.abort();
        }
    }, [isLoggedIn, activeAccount]);

    useEffect(() => {
        if (!isLoggedIn || postits.get() !== undefined || typeof fetchCommonTimeline !== "function") {
            return undefined;
        }
        const controller = new AbortController();
        fetchCommonTimeline(controller);

        return () => {
            controller.abort();
        }
    }, [isLoggedIn, activeAccount]);

    useEffect(() => {
        const controller = new AbortController();
        if (isLoggedIn) {
            if (grades.length < 1 || grades[activeAccount] === undefined) {
                fetchUserGrades(controller);
            } else if (!sortedGrades) {
                sortGrades(grades, activeAccount);
            }
        }

        return () => {
            controller.abort();
        }
    }, [grades, isLoggedIn, activeAccount]);

    useEffect(() => {
        const controller = new AbortController();
        if (isLoggedIn) {
            if (homeworks.get() === undefined) {
                fetchHomeworks(controller);
            }
        }

        return () => {
            controller.abort();
        }
    }, [homeworks.get(), isLoggedIn, activeAccount]);

    useEffect(() => {
        if (hashParameters.length > 2 && (hashParameters[2] === "s" && !selectedTask?.sessionContent)) {
            navigate(`${hashParameters[0]};${hashParameters[1]}`, { replace: true })
        }
    }, [location.hash])

    // JSX DISCODO
    return (
        <div id="dashboard">
            <WindowsContainer name="dashboard">
                <WindowsLayout direction="row" ultimateContainer={true}>
                    <WindowsLayout direction="column" growthFactor={2.5}>
                        <WindowsLayout direction="row">
                            <LastGrades activeAccount={activeAccount} />
                            {/* <Window WIP={true}>
                                <WindowHeader onClick={() => navigate("../grades")}>
                                    <h2>Dernière notes</h2>
                                </WindowHeader>
                                <WindowContent>
                                    
                                </WindowContent>
                            </Window> */}

                            <Window>
                                <WindowHeader onClick={() => navigate("../homeworks")}>
                                    <h2>Prochains devoirs surveillés</h2>
                                </WindowHeader>
                                <WindowContent className="upcoming-assignments-container">
                                    <UpcomingAssignments homeworks={homeworks} />
                                </WindowContent>
                            </Window>
                        </WindowsLayout>

                        <Window growthFactor={1.7} className="notebook-window">
                            <WindowHeader onClick={() => navigate("../homeworks")}>
                                <h2>Cahier de texte</h2>
                            </WindowHeader>
                            <WindowContent id="notebook">
                                <Notebook hideDateController={!isTabletLayout} />
                            </WindowContent>
                        </Window>
                    </WindowsLayout>
                    <WindowsLayout direction="column" growthFactor={1.75}>
                        <Window style={{ flexGrow: 1.4, order: 1 }}>
                            <WindowHeader onClick={() => navigate("../timetable")}>
                                <h2>Emploi du temps</h2>
                            </WindowHeader>
                            <WindowContent className="dashboard-timetable-preview">
                                {timetableStatus === "loading" && <p className="dashboard-timetable-state">Chargement…</p>}
                                {timetableStatus === "error" && <p className="dashboard-timetable-state">Impossible de charger l’emploi du temps.</p>}
                                {timetableStatus === "ready" && todayCourses.length === 0 && <p className="dashboard-timetable-state">Aucun cours aujourd’hui</p>}
                                {todayCourses.length > 0 && (
                                    <ul className="timetable-preview-list">
                                        {todayCourses.map((course) => (
                                            <li key={course.id} className={`timetable-preview-course${course.isCancelled ? " cancelled" : ""}`} onClick={() => navigate("../timetable")}>
                                                <span className="course-color-dot" style={{ backgroundColor: course.color }} aria-hidden="true"></span>
                                                <span className="course-time">{formatCompactHour(course.start)}–{formatCompactHour(course.end)}</span>
                                                <span className="course-subject">{course.subject}</span>
                                                <span className="course-room">{course.room}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <Link className="timetable-page-link" to={`/app/${activeAccount}/timetable`}>Accéder à l’emploi du temps</Link>
                            </WindowContent>
                        </Window>
                        {activePostits.length > 0 && <Window className="postits-window" style={{ flexGrow: 1, order: 2 }}>
                            <WindowHeader>
                                <h2>Post-it{activePostits.length > 1 ? "s" : ""}</h2>
                            </WindowHeader>
                            <WindowContent className="dashboard-postits">
                                {activePostits.map((postit) => (
                                    <article key={postit.id} className="dashboard-postit" style={postitStyle(postit)}>
                                        {(postit.titreEspaceTravail || postitAuthor(postit)) && (
                                            <h3 className="postit-title">{postit.titreEspaceTravail || postitAuthor(postit)}</h3>
                                        )}
                                        <MaybeEncodedHTML className="postit-content" value={postit.contenu} />
                                    </article>
                                ))}
                            </WindowContent>
                        </Window>}
                    </WindowsLayout>
                </WindowsLayout>
            </WindowsContainer>
            {(hashParameters.length > 2 && hashParameters[2] === "s" && selectedTask) && <BottomSheet heading="Contenu de séance" onClose={() => { navigate(`${hashParameters[0]};${hashParameters[1]}`, { replace: true }) }}>
                <EncodedHTMLDiv>{selectedTask.sessionContent}</EncodedHTMLDiv>
            </BottomSheet>}
            {(hashParameters.length > 2 && hashParameters[2] === "f" && selectedTask) && <PopUp className="task-file-pop-up" onClose={() => { navigate(`${hashParameters[0]};${hashParameters[1]}`, { replace: true }) }}>
            <div className="header-container">
                    <h2 className="file-title">Fichiers joints</h2>
                    <p className="file-subject">{selectedTask.subject} • {formatDateRelative(new Date(selectedTask.addDate))}</p>
                </div>
                <div className="file-scroller">
                    <div className="file-wrapper">
                        <p className="file-subject">Note : maintenir pour télécharger</p>
                        {selectedTask.type === "task"
                            ? selectedTask.files.map((file) => <FileComponent key={file.id} file={file} />)
                            : selectedTask.sessionContentFiles.map((file) => <FileComponent key={file.id} file={file} />)}
                    </div>
                </div>
            </PopUp>}
        </div>
    )
}