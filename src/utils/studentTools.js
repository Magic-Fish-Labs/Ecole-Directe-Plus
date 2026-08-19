export const STUDENT_TOOLS_STORAGE_KEY = "edpStudentSuiteV1";

export const ACCENT_THEMES = {
    default: null,
    green: { label: "Vert", values: ["0, 132, 88", "7, 35, 22", "18, 79, 37", "44, 112, 61", "72, 167, 111", "177, 235, 196"] },
    red: { label: "Rouge", values: ["187, 0, 0", "30, 0, 0", "68, 18, 18", "91, 49, 49", "156, 79, 79", "242, 187, 187"] },
    orange: { label: "Orange", values: ["255, 87, 34", "12, 12, 12", "31, 31, 31", "65, 65, 65", "143, 102, 67", "255, 174, 0"] },
    blue: { label: "Bleu", values: ["21, 101, 192", "10, 20, 38", "24, 49, 83", "45, 79, 120", "70, 130, 180", "174, 214, 255"] },
    purple: { label: "Violet", values: ["103, 58, 183", "27, 18, 43", "55, 38, 82", "83, 59, 117", "139, 105, 190", "221, 195, 255"] },
    oled: { label: "OLED", values: ["12, 12, 12", "0, 0, 0", "12, 12, 12", "28, 28, 28", "88, 88, 88", "225, 225, 225"] }
};

export const DEFAULT_STUDENT_TOOLS_STATE = {
    theme: "default",
    simulations: [],
    brevets: [],
    streak: { count: 0, best: 0, lastVisit: null }
};

export function loadStudentToolsState() {
    try {
        const stored = JSON.parse(localStorage.getItem(STUDENT_TOOLS_STORAGE_KEY) || "{}");
        return {
            ...DEFAULT_STUDENT_TOOLS_STATE,
            ...stored,
            streak: { ...DEFAULT_STUDENT_TOOLS_STATE.streak, ...(stored.streak || {}) }
        };
    } catch {
        return structuredClone(DEFAULT_STUDENT_TOOLS_STATE);
    }
}

export function saveStudentToolsState(state) {
    localStorage.setItem(STUDENT_TOOLS_STORAGE_KEY, JSON.stringify(state));
}

export function applyAccentTheme(themeName) {
    const root = document.documentElement;
    const palette = ACCENT_THEMES[themeName];
    const variables = ["--background-color-header", "--background-color-0", "--background-color-1", "--background-color-2", "--border-color-0", "--text-color-alt"];

    if (!palette) {
        root.dataset.edpAccent = "default";
        variables.forEach(variable => root.style.removeProperty(variable));
        return;
    }

    const [header, bg0, bg1, bg2, border, alt] = palette.values;
    root.dataset.edpAccent = themeName;
    root.style.setProperty("--background-color-header", header);
    root.style.setProperty("--background-color-0", bg0);
    root.style.setProperty("--background-color-1", bg1);
    root.style.setProperty("--background-color-2", bg2);
    root.style.setProperty("--border-color-0", border);
    root.style.setProperty("--text-color-alt", alt);
}

export function setAccentTheme(themeName) {
    const current = loadStudentToolsState();
    const next = { ...current, theme: ACCENT_THEMES[themeName] !== undefined ? themeName : "default" };
    saveStudentToolsState(next);
    applyAccentTheme(next.theme);
    return next.theme;
}

export function restoreAccentTheme() {
    applyAccentTheme(loadStudentToolsState().theme);
}

export function dayKey(date = new Date()) {
    return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function updateDailyStreak(state) {
    const today = dayKey();
    if (state.streak?.lastVisit === today) return state;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const continued = state.streak?.lastVisit === dayKey(yesterday);
    const count = continued ? (state.streak?.count || 0) + 1 : 1;

    return {
        ...state,
        streak: {
            count,
            best: Math.max(count, state.streak?.best || 0),
            lastVisit: today
        }
    };
}

export function flattenPeriodGrades(period) {
    if (!period?.subjects) return [];
    return Object.values(period.subjects)
        .filter(subject => !subject.isCategory)
        .flatMap(subject => subject.grades || [])
        .filter(grade => Number.isFinite(Number(grade.value)) && Number(grade.scale) > 0);
}

export function meanOnTwenty(grades) {
    if (!grades?.length) return null;
    const values = grades.map(grade => Number(grade.value) * 20 / Number(grade.scale));
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length * 100) / 100;
}
