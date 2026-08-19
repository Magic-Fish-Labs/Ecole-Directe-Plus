import { useEffect, useMemo, useState } from "react";
import { calcMedian } from "../../../utils/gradesTools";
import "./StudentSuite.css";

const STORAGE_KEY = "edpStudentSuiteV1";
const THEMES = {
    default: null,
    green: { header: "0, 132, 88", bg0: "7, 35, 22", bg1: "18, 79, 37", bg2: "44, 112, 61", border: "72, 167, 111", alt: "177, 235, 196" },
    red: { header: "187, 0, 0", bg0: "30, 0, 0", bg1: "68, 18, 18", bg2: "91, 49, 49", border: "156, 79, 79", alt: "242, 187, 187" },
    orange: { header: "255, 87, 34", bg0: "12, 12, 12", bg1: "31, 31, 31", bg2: "65, 65, 65", border: "143, 102, 67", alt: "255, 174, 0" },
    blue: { header: "21, 101, 192", bg0: "10, 20, 38", bg1: "24, 49, 83", bg2: "45, 79, 120", border: "70, 130, 180", alt: "174, 214, 255" },
    purple: { header: "103, 58, 183", bg0: "27, 18, 43", bg1: "55, 38, 82", bg2: "83, 59, 117", border: "139, 105, 190", alt: "221, 195, 255" },
    oled: { header: "12, 12, 12", bg0: "0, 0, 0", bg1: "12, 12, 12", bg2: "28, 28, 28", border: "88, 88, 88", alt: "225, 225, 225" }
};

const DEFAULT_STATE = {
    theme: "default",
    simulations: [],
    brevets: [],
    qcms: [],
    streak: { count: 0, best: 0, lastVisit: null }
};

function loadState() {
    try {
        return { ...DEFAULT_STATE, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
    } catch {
        return DEFAULT_STATE;
    }
}

function dayKey(date = new Date()) {
    return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function yesterdayKey() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return dayKey(date);
}

function flattenGrades(period) {
    if (!period?.subjects) return [];
    return Object.values(period.subjects)
        .filter(subject => !subject.isCategory)
        .flatMap(subject => subject.grades ?? [])
        .filter(grade => Number.isFinite(Number(grade.value)) && Number(grade.scale) > 0);
}

function mean(values) {
    if (!values.length) return null;
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length * 100) / 100;
}

function ThemePicker({ value, onChange }) {
    return <div className="suite-theme-list">
        {Object.keys(THEMES).map(theme => <button
            key={theme}
            type="button"
            className={`suite-theme ${value === theme ? "active" : ""}`}
            data-theme={theme}
            onClick={() => onChange(theme)}
        >{theme === "default" ? "Classique" : theme === "green" ? "Vert" : theme === "red" ? "Rouge" : theme === "orange" ? "Orange" : theme === "blue" ? "Bleu" : theme === "purple" ? "Violet" : "OLED"}</button>)}
    </div>;
}

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

    return <div className="suite-section">
        <div className="suite-section-title"><h3>🧮 Notes prévisionnelles</h3>{predicted != null && <span>Moyenne estimée : <strong>{predicted}/20</strong></span>}</div>
        <form className="suite-inline-form" onSubmit={add}>
            <input placeholder="Matière" value={draft.subject} onChange={e => setDraft({ ...draft, subject: e.target.value })} />
            <input type="number" min="0" step="0.1" value={draft.value} onChange={e => setDraft({ ...draft, value: e.target.value })} />
            <span>/</span><input type="number" min="1" step="1" value={draft.scale} onChange={e => setDraft({ ...draft, scale: e.target.value })} />
            <input type="number" min="0.1" step="0.1" value={draft.coef} onChange={e => setDraft({ ...draft, coef: e.target.value })} title="Coefficient" />
            <button type="submit">Ajouter</button>
        </form>
        <div className="suite-chips">{items.map(item => <span key={item.id}>{item.subject || "Note"} · {item.value}/{item.scale} · coef {item.coef}<button onClick={() => onChange(items.filter(x => x.id !== item.id))}>×</button></span>)}</div>
    </div>;
}

function Brevet({ items, onChange }) {
    const [name, setName] = useState("Brevet blanc");
    const [marks, setMarks] = useState({ francais: 10, maths: 10, histoire: 10, sciences: 10, oral: 10 });
    const average = mean(Object.values(marks).map(Number));
    function save() {
        onChange([...items, { id: crypto.randomUUID(), name, date: dayKey(), marks: { ...marks }, average }]);
    }
    return <div className="suite-section">
        <div className="suite-section-title"><h3>🎓 Brevets blancs</h3><span>Moyenne simulée : <strong>{average}/20</strong></span></div>
        <input className="suite-name-input" value={name} onChange={e => setName(e.target.value)} />
        <div className="suite-mark-grid">{Object.entries(marks).map(([key, value]) => <label key={key}><span>{key === "francais" ? "Français" : key === "maths" ? "Maths" : key === "histoire" ? "Histoire-Géo/EMC" : key === "sciences" ? "Sciences" : "Oral"}</span><input type="number" min="0" max="20" step="0.5" value={value} onChange={e => setMarks({ ...marks, [key]: e.target.value })} /><small>/20</small></label>)}</div>
        <button className="suite-primary" onClick={save}>Enregistrer ce brevet</button>
        <div className="suite-history">{items.slice().reverse().map(exam => <div key={exam.id}><strong>{exam.name}</strong><span>{exam.date}</span><b>{exam.average}/20</b><button onClick={() => onChange(items.filter(x => x.id !== exam.id))}>Supprimer</button></div>)}</div>
    </div>;
}

function Qcm({ items, onChange }) {
    const [question, setQuestion] = useState("");
    const [answers, setAnswers] = useState(["", "", "", ""]);
    const [correct, setCorrect] = useState(0);
    const [revealed, setRevealed] = useState({});

    function add(event) {
        event.preventDefault();
        if (!question.trim() || answers.some(answer => !answer.trim())) return;
        onChange([...items, { id: crypto.randomUUID(), question, answers, correct }]);
        setQuestion(""); setAnswers(["", "", "", ""]); setCorrect(0);
    }

    return <div className="suite-section">
        <h3>📝 QCM ED+</h3>
        <p className="suite-muted">Les corrections apparaissent après ta réponse. ED+ n'essaie pas de révéler des réponses que l'établissement garde masquées.</p>
        <form className="suite-qcm-builder" onSubmit={add}>
            <input placeholder="Question" value={question} onChange={e => setQuestion(e.target.value)} />
            {answers.map((answer, index) => <label key={index}><input type="radio" name="correct" checked={correct === index} onChange={() => setCorrect(index)} /><input placeholder={`Réponse ${index + 1}`} value={answer} onChange={e => { const copy = [...answers]; copy[index] = e.target.value; setAnswers(copy); }} /></label>)}
            <button type="submit">Ajouter au QCM</button>
        </form>
        <div className="suite-qcm-list">{items.map(item => <div key={item.id}><strong>{item.question}</strong><div>{item.answers.map((answer, index) => <button key={index} className={revealed[item.id] != null ? (index === item.correct ? "correct" : revealed[item.id] === index ? "wrong" : "") : ""} onClick={() => setRevealed({ ...revealed, [item.id]: index })}>{answer}</button>)}</div>{revealed[item.id] != null && <small>{revealed[item.id] === item.correct ? "✅ Bonne réponse" : `❌ Réponse correcte : ${item.answers[item.correct]}`}</small>}<button className="suite-link" onClick={() => onChange(items.filter(x => x.id !== item.id))}>Supprimer</button></div>)}</div>
    </div>;
}

function Games({ streak }) {
    const [reaction, setReaction] = useState("Prêt ?");
    const [startedAt, setStartedAt] = useState(null);
    const [guess, setGuess] = useState(50);
    const [target, setTarget] = useState(() => Math.floor(Math.random() * 100) + 1);
    const [guessHint, setGuessHint] = useState("Trouve un nombre entre 1 et 100");

    function startReaction() {
        setReaction("Attends…"); setStartedAt(null);
        setTimeout(() => { setStartedAt(performance.now()); setReaction("CLIQUE !"); }, 900 + Math.random() * 1800);
    }
    function hitReaction() {
        if (startedAt == null) return startReaction();
        setReaction(`${Math.round(performance.now() - startedAt)} ms — rejouer`); setStartedAt(null);
    }
    function tryGuess() {
        const value = Number(guess);
        if (value === target) { setGuessHint("🎉 Trouvé ! Nouveau nombre généré."); setTarget(Math.floor(Math.random() * 100) + 1); }
        else setGuessHint(value < target ? "⬆️ Plus grand" : "⬇️ Plus petit");
    }

    const unlocks = [{ days: 3, name: "Réflexes" }, { days: 7, name: "Nombre mystère" }, { days: 14, name: "Mode arcade" }];
    return <div className="suite-section">
        <div className="suite-section-title"><h3>🎮 Arcade</h3><span>🔥 {streak} jours</span></div>
        <div className="suite-unlocks">{unlocks.map(game => <span key={game.days} className={streak >= game.days ? "unlocked" : "locked"}>{streak >= game.days ? "🔓" : "🔒"} {game.name} · {game.days}j</span>)}</div>
        {streak >= 3 && <button className="suite-reaction" onClick={hitReaction}>{reaction}</button>}
        {streak >= 7 && <div className="suite-guess"><span>{guessHint}</span><input type="number" min="1" max="100" value={guess} onChange={e => setGuess(e.target.value)} /><button onClick={tryGuess}>Tester</button></div>}
        {streak < 3 && <p className="suite-muted">Reviens plusieurs jours d'affilée pour débloquer les mini-jeux.</p>}
    </div>;
}

export default function StudentSuite({ sortedGrades, selectedPeriod }) {
    const [state, setState] = useState(loadState);

    const realGrades = useMemo(() => flattenGrades(sortedGrades?.[selectedPeriod]), [sortedGrades, selectedPeriod]);
    const realValues = useMemo(() => realGrades.map(grade => Number(grade.value) * 20 / Number(grade.scale)), [realGrades]);
    const realAverage = useMemo(() => mean(realValues), [realValues]);
    const median = useMemo(() => calcMedian(realGrades), [realGrades]);

    useEffect(() => {
        const today = dayKey();
        setState(old => {
            if (old.streak?.lastVisit === today) return old;
            const count = old.streak?.lastVisit === yesterdayKey() ? (old.streak?.count ?? 0) + 1 : 1;
            return { ...old, streak: { count, best: Math.max(count, old.streak?.best ?? 0), lastVisit: today } };
        });
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        const theme = THEMES[state.theme];
        const root = document.documentElement;
        root.dataset.edpAccent = state.theme;
        if (!theme) {
            ["--background-color-header", "--background-color-0", "--background-color-1", "--background-color-2", "--border-color-0", "--text-color-alt"].forEach(key => root.style.removeProperty(key));
            return;
        }
        root.style.setProperty("--background-color-header", theme.header);
        root.style.setProperty("--background-color-0", theme.bg0);
        root.style.setProperty("--background-color-1", theme.bg1);
        root.style.setProperty("--background-color-2", theme.bg2);
        root.style.setProperty("--border-color-0", theme.border);
        root.style.setProperty("--text-color-alt", theme.alt);
    }, [state]);

    const update = (key, value) => setState(old => ({ ...old, [key]: value }));

    return <section className="student-suite">
        <div className="suite-hero">
            <div><span className="suite-kicker">ED+ STUDENT SUITE</span><h2>Mon niveau</h2><p>Des outils locaux pour comprendre tes notes, préparer le brevet et rester régulier.</p></div>
            <div className="suite-stats"><div><small>Moyenne</small><strong>{realAverage ?? "—"}</strong><span>/20</span></div><div><small>Médiane</small><strong>{median}</strong><span>/20</span></div><div><small>Streak</small><strong>🔥 {state.streak.count}</strong><span>record {state.streak.best}</span></div></div>
        </div>
        <div className="suite-section"><h3>🎨 Thèmes</h3><ThemePicker value={state.theme} onChange={value => update("theme", value)} /></div>
        <Simulations items={state.simulations} onChange={value => update("simulations", value)} realAverage={realAverage} />
        <Brevet items={state.brevets} onChange={value => update("brevets", value)} />
        <Qcm items={state.qcms} onChange={value => update("qcms", value)} />
        <Games streak={state.streak.count} />
    </section>;
}
