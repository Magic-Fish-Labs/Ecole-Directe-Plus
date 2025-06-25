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

export function findCategory(subjects, subjectKey) {
    let category = null;
    for (const key in subjects) {
        if (subjects[key].isCategory) {
            category = subjects[key];
        }
        if (key === subjectKey)
            return category;
    }
    return null;
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
                const validKeys = Object.keys(period.subjects).filter((key) => (key !== subjectCode && key.includes(subjectCode))); // selects other subsubjects (and exclude the parent subject)
                let sum = 0;
                for (let validKey of validKeys) {
                    sum += period.subjects[validKey].coef;
                }
                coefMultiplicator = sum ? (period.subjects[subjectCode].coef / sum) : 0; // Handle the case where the sum of subSubject coef is 0 
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
                const validKeys = Object.keys(period.subjects).filter((key) => (key !== subjectCode && key.includes(subjectCode))); // selects other subsubjects (and exclude the parent subject)
                let sum = 0;
                for (let validKey of validKeys) {
                    sum += period.subjects[validKey].coef;
                }
                coefMultiplicator = period.subjects[subjectCode].coef / sum;
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

/** 
 * Modifie l'objet grades pour y ajouter une nouvelle note définie par `newValues`
 *
 * @param {string} periodKey 
 * @param {string} subjectKey
 * @param {Object} newValues
 * @param newValues.value valeur de la note
 * @param newValues.coef coefficient de la note
 * @param newValues.scale note maximum posible
 * @param newValues.name nom du devoir
 * @param newValues.type type de devoir (DS, DM, ...)
 */
export function addSimulatedGrade(periodKey, subjectKey, newValues, grades) {
    const period = grades[periodKey];
    const subject = period.subjects[subjectKey];
    const grade = {
        ...newValues,
        badges: [],
        classAverage: "N/A",
        classMin: "N/A",
        classMax: "N/A",
        date: new Date(),
        elementType: "grade",
        entryDate: new Date(),
        examCorrection: "",
        examSubject: "",
        id: crypto.randomUUID(),
        isSimulated: true,
        isSignificant: true,
        subjectName: subject.name,
        skill: [],
        upTheStreak: newValues.value / newValues.scale >= subject.average / 20,
        subjectKey: subjectKey,
        periodKey: periodKey,
    }
    if (newValues.value === newValues.scale) {
        grade.badges.push("star");
    }
    if (newValues.value / newValues.scale > subject.average / 20) {
        grade.badges.push("stonks");
    }
    else if (newValues.value / newValues.scale === subject.average / 20) {
        grade.badges.push("meh");
    }
    if (grade.upTheStreak) {
        grade.badges.push("keepOnFire");
    };
    
    subject.grades.push(grade);
    
    period.streak += grade.upTheStreak;
    if (period.streak > period.maxStreak) {
        period.maxStreak += 1;
    }
    subject.average = calcAverage(subject.grades);
    period.generalAverage = calcGeneralAverage(period);
    const category = findCategory(period.subjects, subjectKey);
    category.average = calcCategoryAverage(period, category);
}

/** 
 * Modifie l'objet `grades` pour y retirer une note d'id `id`
 *
 * @param {string} periodKey 
 * @param {string} subjectKey
 * @param {string} id L'id de la note à retirer de l'objet `grades`
 * @param {Object} grades l'objet grades utilisé par EDP pour stocker les notes
 */
export function removeSimulatedGrade(periodKey, subjectKey, id, grades) {
    const period = grades[periodKey];
    const subject = period.subjects[subjectKey];
    const grade = subject.grades.find((grade) => grade.id === id);

    subject.grades = subject.grades.filter((grade) => grade.id !== id);

    period.streak -= grade.upTheStreak;
    subject.average = calcAverage(subject.grades);
    period.generalAverage = calcGeneralAverage(period);
    const category = findCategory(period.subjects, subjectKey);
    category.average = calcCategoryAverage(period, category);
}
