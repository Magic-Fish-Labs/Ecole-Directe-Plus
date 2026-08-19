import { useContext, useEffect, useMemo, useState } from "react";
import {
    WindowsContainer,
    WindowsLayout,
    Window,
    WindowHeader,
    WindowContent
} from "../../generic/Window";
import { AppContext } from "../../../App";

import "./Timetable.css";

const DAY_MS = 86400000;
const WEEK_DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

function startOfWeek(date) {
    const result = new Date(date);
    const day = result.getDay() || 7;
    result.setHours(0, 0, 0, 0);
    result.setDate(result.getDate() - day + 1);
    return result;
}

function isoDay(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatDay(date) {
    return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" }).format(date);
}

function formatTime(value) {
    if (!value) return "";
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    return String(value).slice(0, 5);
}

function normalizeEvent(event) {
    const startDate = event.start_date ?? event.startDate ?? event.dateDebut ?? event.date ?? "";
    const endDate = event.end_date ?? event.endDate ?? event.dateFin ?? "";
    return {
        id: event.id ?? crypto.randomUUID(),
        date: startDate,
        start: event.start ?? event.startTime ?? formatTime(startDate),
        end: event.end ?? event.endTime ?? formatTime(endDate),
        subject: event.subject ?? event.matiere ?? event.text ?? event.title ?? "Cours",
        teacher: event.teacher ?? event.professeur ?? event.prof ?? "",
        room: event.room ?? event.salle ?? "",
        cancelled: Boolean(event.cancelled ?? event.isAnnule ?? event.annule),
        modified: Boolean(event.modified ?? event.isModifie),
        raw: event
    };
}

function guestEvents(days) {
    const subjects = ["Mathématiques", "Français", "Histoire-Géo", "Anglais", "Sciences"];
    return days.flatMap(({ date }, dayIndex) => [
        { id: `guest-${dayIndex}-1`, date: isoDay(date), start: "08:00", end: "09:00", subject: subjects[dayIndex], room: `${100 + dayIndex}` },
        { id: `guest-${dayIndex}-2`, date: isoDay(date), start: "10:00", end: "11:00", subject: subjects[(dayIndex + 2) % subjects.length], teacher: "Professeur démo" }
    ]);
}

export default function Timetable({ events: suppliedEvents }) {
    const { accountsListState, activeAccount } = useContext(AppContext);
    const [weekOffset, setWeekOffset] = useState(0);
    const [fetchedEvents, setFetchedEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        document.title = "Emploi du temps • Ecole Directe Plus";
    }, []);

    const days = useMemo(() => {
        const monday = startOfWeek(new Date(Date.now() + weekOffset * 7 * DAY_MS));
        return WEEK_DAYS.map((label, index) => ({ label, date: new Date(monday.getTime() + index * DAY_MS) }));
    }, [weekOffset]);

    useEffect(() => {
        if (suppliedEvents) {
            setFetchedEvents(suppliedEvents.map(normalizeEvent));
            return;
        }
        const account = accountsListState?.[activeAccount];
        if (!account) return;
        if (account.firstName === "Guest") {
            setFetchedEvents(guestEvents(days));
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            setError("Reconnecte-toi pour charger l’emploi du temps en direct.");
            return;
        }

        const controller = new AbortController();
        const dateDebut = isoDay(days[0].date);
        const dateFinDate = new Date(days[days.length - 1].date.getTime() + DAY_MS);
        const dateFin = isoDay(dateFinDate);
        setLoading(true);
        setError("");

        fetch(`https://api.ecoledirecte.com/v3/E/${account.id}/emploidutemps.awp?verbe=get&v=4.69.1`, {
            method: "POST",
            headers: {
                "X-Token": token,
                "2FA-Token": localStorage.getItem("token2fa") ?? "",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `data=${encodeURIComponent(JSON.stringify({ dateDebut, dateFin, avecTrous: false }))}`,
            signal: controller.signal,
            referrerPolicy: "no-referrer"
        })
            .then(response => response.json())
            .then(response => {
                if (response.code === 200) {
                    setFetchedEvents((response.data ?? []).map(normalizeEvent));
                    if (response.token) localStorage.setItem("token", response.token);
                } else {
                    setError(response.message || "Impossible de charger l’emploi du temps.");
                }
            })
            .catch(fetchError => {
                if (fetchError.name !== "AbortError") setError("L’emploi du temps n’a pas pu être chargé. Vérifie la connexion ED+ Unblock.");
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [suppliedEvents, accountsListState, activeAccount, days]);

    const eventsByDay = useMemo(() => {
        const result = new Map();
        for (const event of fetchedEvents ?? []) {
            const rawDate = event.date ?? event.start_date ?? event.startDate;
            if (!rawDate) continue;
            const parsed = new Date(rawDate);
            const key = Number.isNaN(parsed.getTime()) ? String(rawDate).slice(0, 10) : isoDay(parsed);
            const list = result.get(key) ?? [];
            list.push(event);
            result.set(key, list);
        }
        for (const list of result.values()) list.sort((a, b) => String(a.start ?? "").localeCompare(String(b.start ?? "")));
        return result;
    }, [fetchedEvents]);

    return (
        <div id="timetable">
            <WindowsContainer name="timetable">
                <WindowsLayout direction="row" ultimateContainer={true}>
                    <Window>
                        <WindowHeader>
                            <div className="timetable-header">
                                <div><h2>Emploi du temps</h2><span className="timetable-range">{formatDay(days[0].date)} → {formatDay(days[4].date)}</span></div>
                                <div className="timetable-controls">
                                    <button type="button" onClick={() => setWeekOffset(value => value - 1)} aria-label="Semaine précédente">←</button>
                                    <button type="button" onClick={() => setWeekOffset(0)}>Aujourd’hui</button>
                                    <button type="button" onClick={() => setWeekOffset(value => value + 1)} aria-label="Semaine suivante">→</button>
                                </div>
                            </div>
                        </WindowHeader>
                        <WindowContent>
                            {loading && <p className="timetable-status">Chargement de la semaine…</p>}
                            {error && <p className="timetable-status timetable-error">{error}</p>}
                            <div className="timetable-grid">
                                {days.map(({ label, date }) => {
                                    const key = isoDay(date);
                                    const dayEvents = eventsByDay.get(key) ?? [];
                                    return (
                                        <section className={`timetable-day ${key === isoDay(new Date()) ? "today" : ""}`} key={key}>
                                            <header><strong>{label}</strong><span>{formatDay(date)}</span></header>
                                            <div className="timetable-events">
                                                {dayEvents.length === 0 ? <p className="timetable-empty">Aucun cours</p> : dayEvents.map((event, index) => (
                                                    <article className={`timetable-event ${event.cancelled ? "cancelled" : ""}`} key={event.id ?? `${key}-${index}`}>
                                                        <div className="timetable-event-time">{event.start}{event.end ? ` – ${event.end}` : ""}</div>
                                                        <strong>{event.subject}</strong>
                                                        {event.teacher && <span>{event.teacher}</span>}
                                                        {event.room && <span>Salle {event.room}</span>}
                                                        {event.cancelled && <b className="timetable-badge">Annulé</b>}
                                                        {!event.cancelled && event.modified && <b className="timetable-badge">Modifié</b>}
                                                    </article>
                                                ))}
                                            </div>
                                        </section>
                                    );
                                })}
                            </div>
                        </WindowContent>
                    </Window>
                </WindowsLayout>
            </WindowsContainer>
        </div>
    );
}
