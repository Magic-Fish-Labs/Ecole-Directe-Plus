import { useEffect, useMemo, useState } from "react";
import {
    WindowsContainer,
    WindowsLayout,
    Window,
    WindowHeader,
    WindowContent
} from "../../generic/Window";

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

function formatDay(date) {
    return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" }).format(date);
}

export default function Timetable({ events = [] }) {
    const [weekOffset, setWeekOffset] = useState(0);

    useEffect(() => {
        document.title = "Emploi du temps • Ecole Directe Plus";
    }, []);

    const days = useMemo(() => {
        const monday = startOfWeek(new Date(Date.now() + weekOffset * 7 * DAY_MS));
        return WEEK_DAYS.map((label, index) => ({
            label,
            date: new Date(monday.getTime() + index * DAY_MS)
        }));
    }, [weekOffset]);

    const eventsByDay = useMemo(() => {
        const result = new Map();
        for (const event of events ?? []) {
            const rawDate = event.date ?? event.start_date ?? event.startDate;
            if (!rawDate) continue;
            const key = new Date(rawDate).toISOString().slice(0, 10);
            const list = result.get(key) ?? [];
            list.push(event);
            result.set(key, list);
        }
        for (const list of result.values()) {
            list.sort((a, b) => String(a.start ?? a.startTime ?? "").localeCompare(String(b.start ?? b.startTime ?? "")));
        }
        return result;
    }, [events]);

    return (
        <div id="timetable">
            <WindowsContainer name="timetable">
                <WindowsLayout direction="row" ultimateContainer={true}>
                    <Window>
                        <WindowHeader>
                            <div className="timetable-header">
                                <h2>Emploi du temps</h2>
                                <div className="timetable-controls">
                                    <button type="button" onClick={() => setWeekOffset(value => value - 1)} aria-label="Semaine précédente">←</button>
                                    <button type="button" onClick={() => setWeekOffset(0)}>Aujourd’hui</button>
                                    <button type="button" onClick={() => setWeekOffset(value => value + 1)} aria-label="Semaine suivante">→</button>
                                </div>
                            </div>
                        </WindowHeader>
                        <WindowContent>
                            <div className="timetable-grid">
                                {days.map(({ label, date }) => {
                                    const key = date.toISOString().slice(0, 10);
                                    const dayEvents = eventsByDay.get(key) ?? [];
                                    return (
                                        <section className="timetable-day" key={key}>
                                            <header><strong>{label}</strong><span>{formatDay(date)}</span></header>
                                            <div className="timetable-events">
                                                {dayEvents.length === 0 ? <p className="timetable-empty">Aucun cours</p> : dayEvents.map((event, index) => (
                                                    <article className="timetable-event" key={event.id ?? `${key}-${index}`}>
                                                        <div className="timetable-event-time">{event.start ?? event.startTime ?? ""}{(event.end ?? event.endTime) ? ` – ${event.end ?? event.endTime}` : ""}</div>
                                                        <strong>{event.subject ?? event.matiere ?? event.title ?? "Cours"}</strong>
                                                        {(event.teacher ?? event.professeur) && <span>{event.teacher ?? event.professeur}</span>}
                                                        {(event.room ?? event.salle) && <span>Salle {event.room ?? event.salle}</span>}
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
