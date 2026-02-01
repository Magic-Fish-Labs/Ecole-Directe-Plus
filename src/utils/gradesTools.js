export function getGradeValue(gradeValue) {
    if (gradeValue.includes("Abs")) {
        return "Abs";
    } else if (gradeValue.includes("Disp")) {
        return "Disp";
    } else if (gradeValue.includes("NE")) {
        return "NE";
    } else if (gradeValue.includes("EA")) {
        return "EA";
    } else if (gradeValue === "") {
        return "Comp"
    }

    const output = parseFloat(gradeValue?.replace(",", "."));

    return isNaN(output) ? "N/A" : output;
}

export function safeParseFloat(value) {
    if (typeof value === "number") {
        return value
    }
    const parsedValue = parseFloat(value?.replace(",", "."))
    return isNaN(parsedValue) ? "N/A" : parsedValue
}

export function calcAverage(list) {
    let average = 0;
    let coef = 0;
    list.forEach(i => {
        if ((i.isSignificant ?? true) && !isNaN(i.value)) {
            coef += i.coef;
        }
    })

    const noCoef = !coef;

    list.forEach(i => {
        if ((i.isSignificant ?? true) && !isNaN(i.value)) {
            if (noCoef) {
                average += (i.value * 20 / i.scale);
                coef += 1;
            } else {
                average += (i.value * 20 / i.scale) * i.coef;
            }
        }
    })

    if (coef > 0 && list.length > 0) {
        return Math.round(average / coef * 100) / 100;
    } else {
        return "N/A"
    }
}

export function calcClassAverage(list) {
    let average = 0;
    let coef = 0;
    for (let i of list) {
        if ((i.isSignificant ?? true) && !isNaN(i.classAverage)) {
            coef += i.coef;
        }
    }

    const noCoef = !coef;

    for (let i of list) {
        if ((i.isSignificant ?? true) && !isNaN(i.classAverage)) {
            if (noCoef) {
                average += (i.classAverage * 20 / i.scale);
                coef += 1;
            } else {
                average += (i.classAverage * 20 / i.scale) * i.coef;
            }
        }
    }

    if (coef > 0 && list.length > 0) {
        return Math.ceil(average / coef * 100) / 100;
    } else {
        return "N/A"
    }
}

export function findCategory(period, subject) {
    const subjectsKeys = Object.keys(period.subjects);
    let i = subjectsKeys.indexOf(subject);
    while (--i > 0 && !period.subjects[subjectsKeys[i]]?.isCategory) { } // très sad
    if (!period.subjects[subjectsKeys[i]]?.isCategory) {
        return null;
    }

    return period.subjects[subjectsKeys[i]];
}

export function calcCategoryAverage(period, category) {
    const list = [];
    const subjectsKeys = Object.keys(period.subjects);
    let i = 0;
    while (i < subjectsKeys.length && period.subjects[subjectsKeys[i]].name !== category.name) { i++ }
    while (++i < subjectsKeys.length && !period.subjects[subjectsKeys[i]].isCategory) {
        const currentSubject = period.subjects[subjectsKeys[i]];
        let coefMultiplicator = 1;
        if (currentSubject.isSubSubject) {
            const subjectCode = currentSubject.name.split(" - ")[0];
            const validKeys = Object.keys(period.subjects).filter((key) => (key !== subjectCode && key.includes(subjectCode))); // selects other subsubjects (and exclude the parent subject)
            let sum = 0;
            for (let validKey of validKeys) {
                sum += period.subjects[validKey].coef;
            }
            coefMultiplicator = period.subjects[subjectCode].coef / sum;
        }
        list.push({
            value: currentSubject.average ?? 0,
            scale: 20,
            coef: currentSubject.average === undefined ? 0 : (currentSubject.coef * coefMultiplicator)
        })
    }

    return calcAverage(list);
}

export function calcGeneralAverage(period) {
    const list = []
    for (let subject in period.subjects) {
        const currentSubject = period.subjects[subject];
        if (!currentSubject.isCategory) {
            let coefMultiplicator = 1;
            if (currentSubject.isSubSubject) {
                const subjectCode = currentSubject.name.split(" - ")[0];
                const subSubjectCode = currentSubject.name.split(" - ").join("");
                const validKeys = Object.keys(period.subjects).filter((key) => (key !== subjectCode && key.includes(subjectCode))); // selects other subsubjects (and exclude the parent subject)
                let sum = 0;
                for (let validKey of validKeys) {
                    sum += period.subjects[validKey].coef;
                }
                coefMultiplicator = sum ? (period.subjects[subSubjectCode].coef / sum) : 0; // Handle the case where the sum of subSubject coef is 0 
            }
            list.push({
                value: currentSubject.average ?? 0,
                scale: 20,
                coef: currentSubject.average === undefined ? 0 : (currentSubject.coef * coefMultiplicator)
            })
        }
    }

    return calcAverage(list);
}

export function calcClassGeneralAverage(period) {
    const list = []
    for (let subject in period.subjects) {
        const currentSubject = period.subjects[subject];
        if (!currentSubject.isCategory) {
            let coefMultiplicator = 1;
            if (currentSubject.isSubSubject) {
                const subjectCode = currentSubject.name.split(" - ")[0];
                const subSubjectCode = currentSubject.name.split(" - ").join("");
                const validKeys = Object.keys(period.subjects).filter((key) => (key !== subjectCode && key.includes(subjectCode))); // selects other subsubjects (and exclude the parent subject)
                let sum = 0;
                for (let validKey of validKeys) {
                    sum += period.subjects[validKey].coef;
                }
                coefMultiplicator = period.subjects[subSubjectCode].coef / sum;
            }
            list.push({
                value: currentSubject.classAverage ?? 0,
                scale: 20,
                coef: currentSubject.classAverage === undefined ? 0 : (currentSubject.coef * coefMultiplicator)
            })
        }
    }

    return calcAverage(list);
}

const skillsValues = ["Non atteint", "Partiellement atteint", "Atteint", "Dépassé"]

export function formatSkills(skills) {
    return skills.map(el => ({
        id: el.idElemProg,
        name: el.libelleCompetence,
        description: el.descriptif,
        // On ne connait pas encore les valeures lorsque les compétences ne sont pas valides 
        // donc on utilisera isNaN() pour savoir si la valeure est un nombre ou non et si ce 
        // n'est pas le cas on met la valeure à "non évaluée" dans le cas ou les absence, 
        // les dispense et les non évalués soit aussi des nombres on ajoute la condition que 
        // el.valeur soit entre 1 et 4 inclus
        value: isNaN(parseInt(el.valeur)) || parseInt(el.valeur) < 1 || parseInt(el.valeur) > 4 ? "Non évaluée" : skillsValues[parseInt(el.valeur) - 1] // la pire compétence possible commence à 1 donc on ajuste pour les tableaux js
    }))
}