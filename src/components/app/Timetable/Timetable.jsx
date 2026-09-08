import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
    addDays,
    addWeeks,
    format,
    isSameDay,
    isSameMonth,
    isSameWeek,
    startOfDay,
    startOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";

import {
    WindowsContainer,
    WindowsLayout,
    Window,
    WindowHeader,
    WindowContent,
} from "../../generic/Window";
import BottomSheet from "../../generic/PopUps/BottomSheet";
import EncodedHTMLDiv from "../../generic/CustomDivs/EncodedHTMLDiv";
import FileComponent from "../../generic/FileComponent";
import InfoButton from "../../generic/Informative/InfoButton";

import "./Timetable.css";
import { textToHSL } from "../../../utils/utils";
import WalkingCanardman from "../../graphics/WalkingCanardman";

const WEEK_DAYS = 7;
const THREE_DAY_WINDOW = 3;
const DEFAULT_START_MINUTES = 8 * 60;
const DEFAULT_END_MINUTES = 18 * 60;
const TIME_OFFSET_MINUTES = 30;
const TIME_STEP_MINUTES = 30;
const HOUR_HEIGHT = 56; // TODO: taille dynamique dépendante de la hauteur de l'écran
const IDLE_COURSEWORK = { status: "idle", items: [], error: "" };

function dateKey(date) {
    return format(date, "yyyy-MM-dd");
}

function parseApiDate(value) {
    if (value instanceof Date) {
        return value;
    }

    const match = String(value ?? "").match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
    if (!match) {
        return new Date(NaN);
    }

    return new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3]),
        Number(match[4]),
        Number(match[5]),
    );
}

function safeColor(value) {
    const color = String(value ?? "").trim();
    if (/^#[0-9a-f]{6}$/i.test(color)) {
        return color;
    }
    if (/^[0-9a-f]{6}$/i.test(color)) {
        return `#${color}`;
    }
    return "#5965d8";
}

function apiBoolean(value) {
    return value === true || value === 1 || value === "1" || value === "true";
}

function normalizeCourse(course) {
    const start = parseApiDate(course.start_date);
    const end = parseApiDate(course.end_date);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
        return null;
    }

    const isCancelled = apiBoolean(course.isAnnule ?? course.isCancelled ?? course.annule);
    const isModified = apiBoolean(course.isModifie ?? course.isModified ?? course.modifie);
    const isExempted = Number(course.dispense) > 0;
    const homeworkSummary = Array.isArray(course.homeworkSummary) ? course.homeworkSummary : [];
    const hasHomework = apiBoolean(course.devoirAFaire) || homeworkSummary.length > 0;
    const hasSessionContent = apiBoolean(course.contenuDeSeance);

    return {
        ...course,
        id: course.id ?? `${start.toISOString()}-${course.codeMatiere}`,
        subject: String(course.matiere || course.text || "Évènement").trim(),
        teacher: String(course.prof || "Professeur non renseigné").trim(),
        room: String(course.salle || "Salle non renseignée").trim(),
        group: String(course.groupe || course.classe || "Groupe non renseigné").trim(),
        start,
        end,
        color: safeColor(course.color),
        // color: `hsl(${textToHSL(course.codeMatiere)[0]}, ${textToHSL(course.codeMatiere)[1]}%, ${textToHSL(course.codeMatiere)[2]}%)`,
        isCancelled,
        isModified,
        isExempted,
        devoirAFaire: hasHomework,
        contenuDeSeance: hasSessionContent,
        homeworkDone: hasHomework && apiBoolean(course.homeworkDone),
        homeworkSummary,
        status: isCancelled
            ? "Cours annulé"
            : isExempted
                ? "Dispense"
                : isModified
                    ? "Cours modifié"
                    : "Cours maintenu",
    };
}

function minutesSinceMidnight(date) {
    return date.getHours() * 60 + date.getMinutes();
}

function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    if (hours === 0) return `${remaining} min`;
    if (remaining === 0) return `${hours} h`;
    return `${hours} h ${String(remaining).padStart(2, "0")}`;
}

function formatPeriodRange(periodStart, dayCount) {
    const periodEnd = addDays(periodStart, dayCount - 1);
    const startFormat = isSameMonth(periodStart, periodEnd) ? "d" : "d MMM";
    return `${format(periodStart, startFormat, { locale: fr })} – ${format(periodEnd, "d MMM yyyy", { locale: fr })}`;
}

function getGridRange(courses) {
    if (courses.length === 0) {
        return { start: DEFAULT_START_MINUTES, end: DEFAULT_END_MINUTES };
    }

    const earliestStart = Math.min(...courses.map((course) => minutesSinceMidnight(course.start)));
    const latestEnd = Math.max(...courses.map((course) => minutesSinceMidnight(course.end)));
    const start = Math.max(
        0,
        Math.floor((earliestStart - TIME_OFFSET_MINUTES) / TIME_STEP_MINUTES) * TIME_STEP_MINUTES,
    );
    const end = Math.min(
        24 * 60,
        Math.ceil((latestEnd + TIME_OFFSET_MINUTES) / TIME_STEP_MINUTES) * TIME_STEP_MINUTES,
    );

    return { start, end };
}

function formatMinutes(minutes) {
    return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function escapeICSText(value) {
    return String(value ?? "")
        .replaceAll("\\", "\\\\")
        .replaceAll(";", "\\;")
        .replaceAll(",", "\\,")
        .replaceAll("\n", "\\n");
}

function toICSDate(date) {
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function exportCalendar(courses, weekStart) {
    const events = courses.map((course) => [
        "BEGIN:VEVENT",
        `UID:${escapeICSText(course.id)}@ecole-directe.plus`,
        `DTSTAMP:${toICSDate(new Date())}`,
        `DTSTART:${toICSDate(course.start)}`,
        `DTEND:${toICSDate(course.end)}`,
        `SUMMARY:${escapeICSText(`${course.isCancelled ? "[ANNULÉ] " : ""}${course.subject}`)}`,
        `LOCATION:${escapeICSText(course.room)}`,
        `DESCRIPTION:${escapeICSText(`${course.teacher} • ${course.group} • ${course.status}`)}`,
        `STATUS:${course.isCancelled ? "CANCELLED" : "CONFIRMED"}`,
        "END:VEVENT",
    ].join("\r\n"));

    const content = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Ecole Directe Plus//Emploi du temps//FR",
        "CALSCALE:GREGORIAN",
        ...events,
        "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `emploi-du-temps-${dateKey(weekStart)}.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

function CourseCard({ course, gridStart, gridEnd, onSelect }) {
    const startMinutes = minutesSinceMidnight(course.start);
    const endMinutes = minutesSinceMidnight(course.end);
    const visibleStart = Math.max(startMinutes, gridStart);
    const visibleEnd = Math.min(endMinutes, gridEnd);
    if (visibleStart >= visibleEnd) return null;

    const top = ((visibleStart - gridStart) / 60) * HOUR_HEIGHT;
    const height = Math.max(((visibleEnd - visibleStart) / 60) * HOUR_HEIGHT - 5, 34);
    const compact = height < 54;
    const prioritizeTitle = compact && course.subject.length > 18;

    return (
        <button
            type="button"
            className={`timetable-course${course.isCancelled ? " cancelled" : ""}${course.isModified ? " modified" : ""}${compact ? " compact" : ""}${prioritizeTitle ? " title-priority" : ""}${course.devoirAFaire ? " has-homework" : ""}`}
            style={{ top, height, "--course-color": course.color }}
            onClick={() => onSelect(course)}
            aria-label={`${course.subject}, de ${format(course.start, "HH:mm")} à ${format(course.end, "HH:mm")}, ${course.status}${course.devoirAFaire ? ", devoir à faire" : ""}`}
        >
            <span className="course-accent" aria-hidden="true" />
            {course.devoirAFaire && <span className="course-homework-alert" aria-hidden="true">✎</span>}
            <span className="course-title">{course.subject}</span>
            <span className="course-time">{format(course.start, "HH:mm")}–{format(course.end, "HH:mm")}</span>
            {!compact && <span className="course-meta">{course.room} · {course.teacher}</span>}
            <span className="course-badges">
                {course.isCancelled && <span className="course-badge danger">Annulé</span>}
            </span>
        </button>
    );
}

function CourseworkFiles({ files }) {
    if (!files?.length) return null;

    return (
        <div className="coursework-files">
            {files.map((file) => <FileComponent file={file} key={`${file.type}-${file.id}`} />)}
        </div>
    );
}

function CourseworkPanel({ activeAccount, course, coursework, onRetry }) {
    const notebookLink = `/app/${activeAccount}/homeworks#${dateKey(course.start)}`;

    if (coursework.status === "loading") {
        return (
            <section className="coursework-panel loading" aria-live="polite">
                <div className="timetable-loader" aria-hidden="true" />
                <div>
                    <strong>Chargement du cahier de texte...</strong>
                    <p>Récupération des devoirs associés au cours...</p>
                </div>
            </section>
        );
    }

    if (coursework.status === "error") {
        return (
            <section className="coursework-panel error" role="alert">
                <strong>Le détail des devoirs à faire n'a pas pu être chargé</strong>
                <p>{coursework.error}</p>
                <div className="coursework-error-actions">
                    <button type="button" onClick={onRetry}>Réessayer</button>
                    <Link to={notebookLink}>Ouvrir le cahier de texte</Link>
                </div>
            </section>
        );
    }

    if (coursework.status === "ready" && coursework.items.length === 0) {
        return (
            <section className="coursework-panel empty">
                <strong>Aucun détail n’est disponible pour cette matière.</strong>
                <p>Le cours reste signalé car EcoleDirecte indique du travail ou un contenu de séance.</p>
                <Link to={notebookLink}>Ouvrir le cahier de texte</Link>
            </section>
        );
    }

    if (coursework.status !== "ready") return null;

    return (
        <section className="coursework-panel">
            <div className="coursework-heading">
                <div>
                    <span>Cahier de texte</span>
                    <h3>Travail associé au cours</h3>
                </div>
                <Link to={notebookLink}>Tout ouvrir</Link>
            </div>
            <div className="coursework-list">
                {coursework.items.map((item) => (
                    <article className="coursework-item" key={item.id}>
                        <header>
                            <div>
                                <strong>{item.subject}</strong>
                                <span>{item.teacher}</span>
                            </div>
                            <div className="coursework-badges">
                                {item.isInterrogation && <span className="test">Contrôle</span>}
                                {item.isDone === true && <span className="done">Fait</span>}
                                {item.isDone === false && <span className="todo">À faire</span>}
                            </div>
                        </header>
                        {(item.homeworkContent || item.files.length > 0) && (
                            <div className="coursework-content">
                                <h4>Travail à faire</h4>
                                {item.homeworkContent && <EncodedHTMLDiv>{item.homeworkContent}</EncodedHTMLDiv>}
                                <CourseworkFiles files={item.files} />
                            </div>
                        )}
                        {(item.sessionContent || item.sessionFiles.length > 0) && (
                            <div className="coursework-content session">
                                <h4>Contenu de séance</h4>
                                {item.sessionContent && <EncodedHTMLDiv>{item.sessionContent}</EncodedHTMLDiv>}
                                <CourseworkFiles files={item.sessionFiles} />
                            </div>
                        )}
                    </article>
                ))}
            </div>
        </section>
    );
}

export default function Timetable({ isLoggedIn, activeAccount, fetchTimetable, fetchCoursework }) {
    const today = useMemo(() => new Date(), []);
    const currentDayStart = useMemo(() => startOfDay(today), [today]);
    const currentWeekStart = useMemo(() => startOfWeek(today, { weekStartsOn: 1 }), [today]);
    const [viewMode, setViewMode] = useState(() => {
        const savedView = localStorage.getItem("edp-timetable-view");
        if (["week", "three-day"].includes(savedView)) return savedView;
        return window.innerWidth <= 869 ? "three-day" : "week";
    });
    const [periodStart, setPeriodStart] = useState(() => (
        viewMode === "three-day" ? currentDayStart : currentWeekStart
    ));
    const [showCancelled, setShowCancelled] = useState(true);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [coursework, setCoursework] = useState(IDLE_COURSEWORK);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);
    const [refreshRequest, setRefreshRequest] = useState(0);
    const [now, setNow] = useState(new Date());
    const cache = useRef(new Map());
    const courseworkCache = useRef(new Map());
    const courseworkController = useRef(null);
    const courseworkRequestId = useRef(0);
    const fetchTimetableRef = useRef(fetchTimetable);
    const fetchCourseworkRef = useRef(fetchCoursework);

    const periodLength = viewMode === "three-day" ? THREE_DAY_WINDOW : WEEK_DAYS;
    const periodEnd = useMemo(() => addDays(periodStart, periodLength - 1), [periodLength, periodStart]);
    const selectorWeekStart = useMemo(() => startOfWeek(periodStart, { weekStartsOn: 1 }), [periodStart]);
    const selectorDays = useMemo(
        () => Array.from({ length: WEEK_DAYS }, (_, index) => addDays(selectorWeekStart, index)),
        [selectorWeekStart],
    );
    const visibleDays = useMemo(
        () => viewMode === "three-day"
            ? Array.from({ length: THREE_DAY_WINDOW }, (_, index) => addDays(periodStart, index))
            : selectorDays,
        [periodStart, selectorDays, viewMode],
    );
    const fetchStart = useMemo(() => startOfWeek(periodStart, { weekStartsOn: 1 }), [periodStart]);
    const fetchEnd = useMemo(() => (
        addDays(startOfWeek(periodEnd, { weekStartsOn: 1 }), WEEK_DAYS - 1)
    ), [periodEnd]);
    const periodKey = `${activeAccount}-${dateKey(fetchStart)}-${dateKey(fetchEnd)}`;
    const periodCourses = useMemo(
        () => courses.filter((course) => visibleDays.some((day) => isSameDay(course.start, day))),
        [courses, visibleDays],
    );
    const displayedCourses = useMemo(
        () => periodCourses.filter((course) => showCancelled || !course.isCancelled),
        [periodCourses, showCancelled],
    );
    const gridRange = useMemo(() => getGridRange(displayedCourses), [displayedCourses]);
    const gridHeight = ((gridRange.end - gridRange.start) / 60) * HOUR_HEIGHT;
    const timeMarkers = useMemo(
        () => Array.from(
            { length: Math.floor((gridRange.end - gridRange.start) / TIME_STEP_MINUTES) + 1 },
            (_, index) => gridRange.start + index * TIME_STEP_MINUTES,
        ),
        [gridRange.end, gridRange.start],
    );

    useEffect(() => {
        fetchTimetableRef.current = fetchTimetable;
    }, [fetchTimetable]);

    useEffect(() => {
        fetchCourseworkRef.current = fetchCoursework;
    }, [fetchCoursework]);

    useEffect(() => {
        courseworkController.current?.abort();
        courseworkRequestId.current += 1;
        courseworkCache.current.clear();
        setSelectedCourse(null);
        setCoursework(IDLE_COURSEWORK);
    }, [activeAccount]);

    useEffect(() => () => courseworkController.current?.abort(), []);

    useEffect(() => {
        document.title = "Emploi du temps • Ecole Directe Plus";
        const interval = window.setInterval(() => setNow(new Date()), 60_000);
        return () => window.clearInterval(interval);
    }, []);

    useEffect(() => {
        localStorage.setItem("edp-timetable-view", viewMode);
    }, [viewMode]);

    useEffect(() => {
        if (!isLoggedIn || typeof fetchTimetableRef.current !== "function") {
            setLoading(false);
            return undefined;
        }

        const cached = cache.current.get(periodKey);
        if (cached) {
            setCourses(cached.courses);
            setLastUpdated(cached.updatedAt);
            setLoading(false);
            setError("");
            return undefined;
        }

        const controller = new AbortController();
        setError("");
        setLoading(courses.length === 0);
        setRefreshing(courses.length > 0);

        fetchTimetableRef.current({
            startDate: fetchStart,
            endDate: fetchEnd,
            controller,
        })
            .then((rawCourses) => {
                if (controller.signal.aborted) return;
                const normalized = (rawCourses ?? [])
                    .map(normalizeCourse)
                    .filter(Boolean)
                    .sort((a, b) => a.start - b.start);
                const updatedAt = new Date();
                cache.current.set(periodKey, { courses: normalized, updatedAt });
                setCourses(normalized);
                setLastUpdated(updatedAt);
            })
            .catch((fetchError) => {
                if (fetchError?.name !== "AbortError") {
                    setError(fetchError?.message || "Impossible de charger l’emploi du temps.");
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                    setRefreshing(false);
                }
            });

        return () => controller.abort();
    }, [activeAccount, fetchEnd, fetchStart, isLoggedIn, periodKey, refreshRequest]);

    const totalMinutes = periodCourses.reduce((total, course) => (
        course.isCancelled ? total : total + Math.round((course.end - course.start) / 60_000)
    ), 0);
    const cancelledCount = periodCourses.filter((course) => course.isCancelled).length;
    const modifiedCount = periodCourses.filter((course) => course.isModified && !course.isCancelled).length;
    const changePeriod = (delta) => {
        setPeriodStart((date) => (
            viewMode === "three-day"
                ? addDays(date, delta * THREE_DAY_WINDOW)
                : addWeeks(date, delta)
        ));
    };

    const goToToday = () => {
        setPeriodStart(viewMode === "three-day" ? currentDayStart : currentWeekStart);
    };

    const changeViewMode = (nextViewMode) => {
        setViewMode(nextViewMode);
        setPeriodStart((date) => {
            if (nextViewMode === "week") {
                return startOfWeek(date, { weekStartsOn: 1 });
            }
            return isSameWeek(date, today, { weekStartsOn: 1 }) ? currentDayStart : date;
        });
    };

    const refresh = () => {
        cache.current.delete(periodKey);
        setRefreshRequest((value) => value + 1);
    };

    const openCourse = (course, force = false) => {
        courseworkController.current?.abort();
        const requestId = courseworkRequestId.current + 1;
        courseworkRequestId.current = requestId;
        setSelectedCourse(course);

        if (!course.devoirAFaire && !course.contenuDeSeance) {
            setCoursework(IDLE_COURSEWORK);
            return;
        }

        const cacheKey = `${activeAccount}-${dateKey(course.start)}-${course.id}`;
        if (!force && courseworkCache.current.has(cacheKey)) {
            setCoursework(courseworkCache.current.get(cacheKey));
            return;
        }

        if (typeof fetchCourseworkRef.current !== "function") {
            setCoursework({
                status: "error",
                items: [],
                error: "Le service de cahier de texte n’est pas disponible.",
            });
            return;
        }

        const controller = new AbortController();
        courseworkController.current = controller;
        setCoursework({ status: "loading", items: [], error: "" });

        fetchCourseworkRef.current({ course, controller })
            .then((items) => {
                if (controller.signal.aborted || requestId !== courseworkRequestId.current) return;
                const readyState = {
                    status: "ready",
                    items: (items ?? []).map((item) => ({
                        ...item,
                        files: Array.isArray(item.files) ? item.files : [],
                        sessionFiles: Array.isArray(item.sessionFiles) ? item.sessionFiles : [],
                    })),
                    error: "",
                };
                courseworkCache.current.set(cacheKey, readyState);
                setCoursework(readyState);
            })
            .catch((courseworkError) => {
                if (controller.signal.aborted || requestId !== courseworkRequestId.current) return;
                setCoursework({
                    status: "error",
                    items: [],
                    error: courseworkError?.message || "Impossible de charger le travail associé à ce cours.",
                });
            });
    };

    const closeCourse = () => {
        courseworkController.current?.abort();
        courseworkRequestId.current += 1;
        setSelectedCourse(null);
        setCoursework(IDLE_COURSEWORK);
    };

    return (
        <>
            <div id="timetable-page">
                <WindowsContainer name="timetable">
                    <WindowsLayout direction="row" ultimateContainer={true}>
                        <Window allowFullscreen={true} className="timetable-window">
                            <WindowHeader>
                                <h2>Emploi du temps</h2>
                            </WindowHeader>
                            <WindowContent>
                                <section className={`timetable-content ${refreshing ? "refreshing" : ""}`} aria-busy={loading || refreshing}>
                                    <div className="timetable-toolbar">
                                        <div className="week-navigation" aria-label="Navigation entre les périodes">
                                            <button type="button" className="timetable-icon-button" onClick={() => changePeriod(-1)} aria-label={viewMode === "three-day" ? "3 jours précédents" : "Semaine précédente"}>‹</button>
                                            <div className="week-title">
                                                <span>{viewMode === "three-day" ? "Période de 3 jours" : `Semaine ${format(periodStart, "w")}`}</span>
                                                <strong>{formatPeriodRange(periodStart, periodLength)}</strong>
                                            </div>
                                            <button type="button" className="timetable-icon-button" onClick={() => changePeriod(1)} aria-label={viewMode === "three-day" ? "3 jours suivants" : "Semaine suivante"}>›</button>
                                            <button type="button" className="timetable-action-button" onClick={goToToday} disabled={visibleDays.some((day) => isSameDay(day, today))}>Aujourd'hui</button>
                                        </div>

                                        <div className="timetable-view-actions">
                                            <div className="view-switch" role="group" aria-label="Mode d’affichage">
                                                <button type="button" className={viewMode === "week" ? "selected" : ""} onClick={() => changeViewMode("week")} aria-pressed={viewMode === "week"}>Semaine</button>
                                                <button type="button" className={viewMode === "three-day" ? "selected" : ""} onClick={() => changeViewMode("three-day")} aria-pressed={viewMode === "three-day"}>3 jours</button>
                                            </div>
                                            <InfoButton className="" options={{
                                                placement: "bottom"
                                            }}>
                                                <div className="timetable-info-panel">
                                                    <strong>Résumé de la période</strong>
                                                    <dl>
                                                        <div><dt>Volume</dt><dd>{formatDuration(totalMinutes)}</dd></div>
                                                        <div><dt>Changements</dt><dd>{cancelledCount} annulé{cancelledCount > 1 ? "s" : ""} · {modifiedCount} modifié{modifiedCount > 1 ? "s" : ""}</dd></div>
                                                        <div><dt>Mis à jour</dt><dd>{lastUpdated ? format(lastUpdated, "HH:mm") : "—"}</dd></div>
                                                    </dl>
                                                </div>
                                            </InfoButton>
                                            {/* <details className="timetable-info">
                                                <summary aria-label="Afficher le résumé de la période">i</summary>
                                                <div className="timetable-info-panel">
                                                    <strong>Résumé de la période</strong>
                                                    <dl>
                                                        <div><dt>Volume</dt><dd>{formatDuration(totalMinutes)}</dd></div>
                                                        <div><dt>Changements</dt><dd>{cancelledCount} annulé{cancelledCount > 1 ? "s" : ""} · {modifiedCount} modifié{modifiedCount > 1 ? "s" : ""}</dd></div>
                                                        <div><dt>Mis à jour</dt><dd>{lastUpdated ? format(lastUpdated, "HH:mm") : "—"}</dd></div>
                                                    </dl>
                                                </div>
                                            </details> */}
                                            <label className="cancelled-toggle">
                                                <input type="checkbox" checked={showCancelled} onChange={(event) => setShowCancelled(event.target.checked)} aria-label="Afficher les cours annulés" />
                                                <span aria-hidden="true" />
                                                <span className="cancelled-toggle-label">Cours annulés</span>
                                            </label>
                                            <div className="timetable-output-actions">
                                                <button type="button" onClick={() => exportCalendar(displayedCourses, periodStart)}>Exporter .ics</button>
                                                <button type="button" onClick={() => window.print()}>Imprimer</button>
                                                <button type="button" className="timetable-action-button" onClick={refresh} disabled={refreshing}>{refreshing ? "Actualisation…" : "Actualiser"}</button>
                                            </div>
                                        </div>
                                    </div>

                                    {viewMode === "three-day" && (
                                        <div className="day-selector" role="tablist" aria-label="Premier jour de la période affichée">
                                            {selectorDays.map((day) => (
                                                <button
                                                    type="button"
                                                    role="tab"
                                                    aria-selected={isSameDay(day, periodStart)}
                                                    className={`${isSameDay(day, periodStart) ? "selected" : ""}${visibleDays.some((visibleDay) => isSameDay(day, visibleDay)) ? " in-range" : ""}${isSameDay(day, today) ? " today" : ""}`}
                                                    onClick={() => setPeriodStart(day)}
                                                    key={dateKey(day)}
                                                >
                                                    <span>{format(day, "EEE", { locale: fr })}</span>
                                                    <strong>{format(day, "d")}</strong>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {loading && (
                                        <div className="timetable-state" role="status">
                                            <div className="timetable-loader" aria-hidden="true" />
                                            <strong>Chargement de la période...</strong>
                                            <span>Nous préparons vos cours et les éventuels changements.</span>
                                        </div>
                                    )}

                                    {!loading && error && (
                                        <div className="timetable-state error" role="alert">
                                            <strong>La période n’a pas pu être chargée</strong>
                                            <span>{error}</span>
                                            <button type="button" className="timetable-action-button" onClick={refresh}>Réessayer</button>
                                        </div>
                                    )}

                                    {!loading && !error && (
                                        <div className={`timetable-grid-frame ${viewMode}`}>
                                            <div className="timetable-grid-canvas" style={{ "--visible-days": visibleDays.length }}>
                                                <div className="timetable-days-header">
                                                    <div className="time-header" aria-hidden="true">Heure</div>
                                                    {visibleDays.map((day) => (
                                                        <div className={`day-heading${isSameDay(day, today) ? " today" : ""}`} key={dateKey(day)}>
                                                            <span>{format(day, "EEEE", { locale: fr })}</span>
                                                            <strong>{format(day, "d MMM", { locale: fr })}</strong>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="timetable-grid-body">
                                                    <div className="time-axis" style={{ height: gridHeight }}>
                                                        {timeMarkers.filter((minutes) => minutes > gridRange.start && minutes < gridRange.end && minutes % 60 === 0).map((minutes) => (
                                                            <span style={{ top: ((minutes - gridRange.start) / 60) * HOUR_HEIGHT }} key={minutes}>{formatMinutes(minutes)}</span>
                                                        ))}
                                                    </div>
                                                    <div className="days-columns" style={{ height: gridHeight }}>
                                                        {timeMarkers.map((minutes) => (
                                                            <span className={`time-grid-line${minutes % 60 === 0 ? " hour" : ""}`} style={{ top: ((minutes - gridRange.start) / 60) * HOUR_HEIGHT }} key={minutes} aria-hidden="true" />
                                                        ))}
                                                        {visibleDays.map((day) => {
                                                            const dayCourses = displayedCourses.filter((course) => isSameDay(course.start, day));
                                                            const nowMinutes = minutesSinceMidnight(now);
                                                            const showNow = isSameDay(day, now) && nowMinutes >= gridRange.start && nowMinutes <= gridRange.end;
                                                            return (
                                                                <div className={`day-column${isSameDay(day, today) ? " today" : ""}`} key={dateKey(day)}>
                                                                    {dayCourses.map((course) => <CourseCard course={course} gridStart={gridRange.start} gridEnd={gridRange.end} onSelect={openCourse} key={course.id} />)}
                                                                    {showNow && (
                                                                        <span className="current-time-line" style={{ top: ((nowMinutes - gridRange.start) / 60) * HOUR_HEIGHT }} aria-label={`Heure actuelle : ${format(now, "HH:mm")}`}>
                                                                            <i aria-hidden="true" />
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                            {refreshing && <WalkingCanardman className="refreshing-timetable-canardman" />}
                                        </div>
                                    )}
                                </section>
                            </WindowContent>
                        </Window>
                    </WindowsLayout>
                </WindowsContainer>
            </div>

            {selectedCourse && (
                <BottomSheet heading={selectedCourse.subject} onClose={closeCourse} firstResizingBreakpoint={1}>
                    <article className="course-details">
                        <div className={`course-status-card${selectedCourse.isCancelled ? " cancelled" : ""}${selectedCourse.isModified ? " modified" : ""}`} style={{ "--course-color": selectedCourse.color }}>
                            <span>{selectedCourse.status}</span>
                            <strong>{format(selectedCourse.start, "EEEE d MMMM", { locale: fr })}</strong>
                            <p>{format(selectedCourse.start, "HH:mm")} – {format(selectedCourse.end, "HH:mm")} · {formatDuration(Math.round((selectedCourse.end - selectedCourse.start) / 60_000))}</p>
                        </div>
                        <dl>
                            <div><dt>Professeur</dt><dd>{selectedCourse.teacher}</dd></div>
                            <div><dt>Salle</dt><dd>{selectedCourse.room}</dd></div>
                            <div><dt>Groupe</dt><dd>{selectedCourse.group}</dd></div>
                            <div><dt>Matière</dt><dd>{selectedCourse.codeMatiere || "Non renseignée"}</dd></div>
                        </dl>
                        {(selectedCourse.contenuDeSeance || selectedCourse.devoirAFaire) && (
                            <div className="course-links">
                                {selectedCourse.contenuDeSeance && <span>Contenu de séance disponible</span>}
                                {selectedCourse.devoirAFaire && <span>{selectedCourse.homeworkDone ? "Travail marqué comme fait" : "Travail à faire associé"}</span>}
                            </div>
                        )}
                        {(selectedCourse.contenuDeSeance || selectedCourse.devoirAFaire) && (
                            <CourseworkPanel
                                activeAccount={activeAccount}
                                course={selectedCourse}
                                coursework={coursework}
                                onRetry={() => openCourse(selectedCourse, true)}
                            />
                        )}
                    </article>
                </BottomSheet>
            )}
        </>
    );
}
