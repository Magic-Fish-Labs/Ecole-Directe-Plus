export function getGradeValue(gradeValue) {
    if (typeof gradeValue !== "string") return safeParseFloat(gradeValue);
    if (gradeValue.includes("Abs")) return "Abs";
    if (gradeValue.includes("Disp")) return "Disp";
    if (gradeValue.includes("NE")) return "NE";
    if (gradeValue.includes("EA")) return "EA";
    if (gradeValue === "") return "Comp";
    return safeParseFloat(gradeValue);
}

export function safeParseFloat(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : "N/A";
    const parsedValue = Number.parseFloat(String(value ?? "").replace(",", "."));
    return Number.isFinite(parsedValue) ? parsedValue : "N/A";
}

function normalizedEntries(list, valueKey = "value") {
    const valid = (list ?? []).filter(item => (item.isSignificant ?? true) && Number.isFinite(Number(item[valueKey])) && Number(item.scale) > 0);
    const hasCoefficient = valid.some(item => Number(item.coef) > 0);
    return valid.map(item => ({
        value: Number(item[valueKey]) * 20 / Number(item.scale),
        weight: hasCoefficient ? Math.max(0, Number(item.coef) || 0) : 1
    })).filter(item => item.weight > 0);
}

function averageEntries(entries) {
    const totalWeight = entries.reduce((sum, item) => sum + item.weight, 0);
    if (!totalWeight) return "N/A";
    const total = entries.reduce((sum, item) => sum + item.value * item.weight, 0);
    return Math.round((total / totalWeight) * 100) / 100;
}

export function calcAverage(list) {
    return averageEntries(normalizedEntries(list));
}

export function calcClassAverage(list) {
    return averageEntries(normalizedEntries(list, "classAverage"));
}

export function calcMedian(list, valueKey = "value") {
    const values = normalizedEntries(list, valueKey).map(item => item.value).sort((a, b) => a - b);
    if (!values.length) return "N/A";
    const middle = Math.floor(values.length / 2);
    const median = values.length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2;
    return Math.round(median * 100) / 100;
}

export function findCategory(period, subject) {
    const subjectsKeys = Object.keys(period?.subjects ?? {});
    let index = subjectsKeys.indexOf(subject) - 1;
    while (index >= 0 && !period.subjects[subjectsKeys[index]]?.isCategory) index--;
    return index >= 0 ? period.subjects[subjectsKeys[index]] : null;
}

function getSubjectCoefMultiplier(period, currentSubject) {
    if (!currentSubject.isSubSubject) return 1;
    const subjectCode = currentSubject.name.split(" - ")[0];
    const parent = period.subjects[subjectCode];
    if (!parent) return 0;
    const sum = Object.keys(period.subjects)
        .filter(key => key !== subjectCode && key.includes(subjectCode))
        .reduce((total, key) => total + (Number(period.subjects[key].coef) || 0), 0);
    return sum ? (Number(parent.coef) || 0) / sum : 0;
}

function subjectToAverageEntry(period, subject, valueKey = "average") {
    const value = subject[valueKey];
    return {
        value: value ?? 0,
        scale: 20,
        coef: value === undefined ? 0 : (Number(subject.coef) || 0) * getSubjectCoefMultiplier(period, subject)
    };
}

export function calcCategoryAverage(period, category) {
    const subjects = Object.values(period?.subjects ?? {});
    const categoryIndex = subjects.findIndex(subject => subject.name === category.name);
    if (categoryIndex < 0) return "N/A";
    const list = [];
    for (let i = categoryIndex + 1; i < subjects.length && !subjects[i].isCategory; i++) {
        list.push(subjectToAverageEntry(period, subjects[i]));
    }
    return calcAverage(list);
}

function calcPeriodAverage(period, valueKey) {
    const list = Object.values(period?.subjects ?? {})
        .filter(subject => !subject.isCategory)
        .map(subject => subjectToAverageEntry(period, subject, valueKey));
    return calcAverage(list);
}

export function calcGeneralAverage(period) {
    return calcPeriodAverage(period, "average");
}

export function calcClassGeneralAverage(period) {
    return calcPeriodAverage(period, "classAverage");
}

const skillsValues = ["Non atteint", "Partiellement atteint", "Atteint", "Dépassé"];

export function formatSkills(skills = []) {
    return skills.map(el => {
        const parsed = Number.parseInt(el.valeur, 10);
        return {
            id: el.idElemProg,
            name: el.libelleCompetence,
            description: el.descriptif,
            value: Number.isInteger(parsed) && parsed >= 1 && parsed <= 4 ? skillsValues[parsed - 1] : "Non évaluée"
        };
    });
}
