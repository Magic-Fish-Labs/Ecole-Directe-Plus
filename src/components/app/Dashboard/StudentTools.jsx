import { useEffect, useMemo, useState } from "react";
import { calcMedian } from "../../../utils/gradesTools";
import {
    dayKey,
    flattenPeriodGrades,
    loadStudentToolsState,
    meanOnTwenty,
    saveStudentToolsState,
    updateDailyStreak
} from "../../../utils/studentTools";
import "./StudentTools.css";

function Simulations({ items, onChange, realAverage }) {
    const [draft, setDraft] = useState({ subject: "", value: 10, scale: 20, coef: 1 });

    const predicted = useMemo(() => {
        if (realAverage == null) return null;
        const valid = items.filter(item => Number(item.scale) > 0 && Number(item.coef) > 0);
        if (!valid.length) return realAverage;
        const simulatedWeight = valid.reduce((sum, item) => sum + Number(item.coef), 0);
        const simulatedTotal = valid.reduce((sum, item) => sum + Number(item.value) * 20 / Number(item.scale) * Number(item.coef), 0);
        return Math.round(((realAverage + simulatedTotal) / (1 + simulatedWeight)) * 100) / 100;
    }, [items, realAverage]);

    function add(event) {
        event.preventDefault();
        if (!Number.isFinite(Number(draft.value)) || Number(draft.scale) <= 0 || Number(draft.coef) <= 0) return;
        onChange([...items, { ...draft, id: crypto.randomUUID() }]);
        setDraft(old => ({ ...old, subject: "" }));
    }

    return <section className="student-tools-card">
        <div className="student-tools-title">
            <h3>Notes prévisionnelles</h3>
            {predicted != null && <span>Moyenne estimée : <strong>{predicted}/20</strong></span>}
        </div>
        <form className="student-tools-sim-form" onSubmit={add}>
            <input placeholder="Matière" value={draft.subject} onChange={event => setDraft({ ...draft, subject: event.target.value })} />
            <input aria-label="Note" type="number" min="0" step="0.1" value={draft.value} onChange={event => setDraft({ ...draft, value: event.target.value })} />
            <span>/</span>
            <input aria-label="Barème" type="number" min="1" step="1" value={draft.scale} onChange={event => setDraft({ ...draft, scale: event.target.value })} />
            <input aria-label="Coefficient" type="number" min="0.1" step="0.1" value={draft.coef} onChange={event => setDraft({ ...draft, coef: event.target.value })} />
            <button type="submit">Ajouter</button>
        </form>
        <div className="student-tools-chips">
            {items.map(item => <span key={item.id}>{item.subject || "Note"} · {item.value}/{item.scale} · coef {item.coef}<button type="button" onClick={() => onChange(items.filter(entry => entry.id !== item.id))}>×</button></span>)}
        </div>
    </section>;
}

function Brevet({ items, onChange }) {
    const [name, setName] = useState("Brevet blanc");
    const [marks, setMarks] = useState({ francais: 10, maths: 10, histoire: 10, sciences: 10, oral: 10 });
    const average = Math.round(Object.values(marks).map(Number).reduce((sum, value) => sum + value, 0) / Object.keys(marks).length * 100) / 100;

    function save() {
        onChange([...items, { id: crypto.randomUUID(), name, date: dayKey(), marks: { ...marks }, average }]);
    }

    const labels = { francais: "Français", maths: "Maths", histoire: "Histoire-Géo/EMC", sciences: "Sciences", oral: "Oral" };

    return <section className="student-tools-card">
        <div className="student-tools-title"><h3>Brevets blancs</h3><span>Moyenne : <strong>{average}/20</strong></span></div>
        <input className="student-tools-name" value={name} onChange={event => setName(event.target.value)} />
        <div className="student-tools-mark-grid">
            {Object.entries(marks).map(([key, value]) => <label key={key}><span>{labels[key]}</span><input type="number" min="0" max="20" step="0.5" value={value} onChange={event => setMarks({ ...marks, [key]: event.target.value })} /><small>/20</small></label>)}
        </div>
        <button className="student-tools-primary" type="button" onClick={save}>Enregistrer ce brevet</button>
        <div className="student-tools-history">
            {items.slice().reverse().map(exam => <div key={exam.id}><strong>{exam.name}</strong><span>{exam.date}</span><b>{exam.average}/20</b><button type="button" onClick={() => onChange(items.filter(entry => entry.id !== exam.id))}>Supprimer</button></div>)}
        </div>
    </section>;
}

export default function StudentTools({ sortedGrades, selectedPeriod }) {
    const [state, setState] = useState(loadStudentToolsState);
    const realGrades = useMemo(() => flattenPeriodGrades(sortedGrades?.[selectedPeriod]), [sortedGrades, selectedPeriod]);
    const realAverage = useMemo(() => meanOnTwenty(realGrades), [realGrades]);
    const median = useMemo(() => calcMedian(realGrades), [realGrades]);

    useEffect(() => {
        setState(old => updateDailyStreak(old));
    }, []);

    useEffect(() => {
        saveStudentToolsState(state);
    }, [state]);

    const update = (key, value) => setState(old => ({ ...old, [key]: value }));

    return <div className="student-tools">
        <section className="student-tools-card student-tools-level">
            <div>
                <span className="student-tools-kicker">MON NIVEAU</span>
                <h2>Suivi scolaire</h2>
            </div>
            <div className="student-tools-stats">
                <div><small>Moyenne</small><strong>{realAverage ?? "—"}</strong><span>/20</span></div>
                <div><small>Médiane</small><strong>{median}</strong><span>/20</span></div>
                <div><small>Streak</small><strong>🔥 {state.streak.count}</strong><span>record {state.streak.best}</span></div>
            </div>
        </section>
        <Simulations items={state.simulations} onChange={value => update("simulations", value)} realAverage={realAverage} />
        <Brevet items={state.brevets} onChange={value => update("brevets", value)} />
    </div>;
}
