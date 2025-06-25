import {
    getGradeValue,
    calcAverage,
    findCategory,
    calcCategoryAverage,
    calcGeneralAverage,
    formatSkills,
    safeParseFloat,
    calcClassGeneralAverage,
    calcClassAverage
} from "../../utils/gradesTools";

export function mapGrades(grades) {
    /**
     * Filtre le JSON envoyé par l'API d'ED et le tri pour obtenir un objet plus facile d'utilisation
     */
    const periodsFromJson = grades.periodes;
    const periods = {};
    const generalAverageHistory = {}; // used for charts
    const classGeneralAverageHistory = {}; // used for charts
    const streakScoreHistory = {}; // used for charts
    const subjectsComparativeInformation = {};
    const totalBadges = {
        "star": 0,
        "bestStudent": 0,
        "greatStudent": 0,
        "stonks": 0,
        "keepOnFire": 0,
        "meh": 0,
    };
    const newLastGrades = []
    if (periodsFromJson !== undefined) {
        for (let period of periodsFromJson) {
            if (period) {
                const newPeriod = {};
                subjectsComparativeInformation[period.codePeriode] = [];

                newPeriod.streak = 0;
                newPeriod.maxStreak = 0;
                newPeriod.name = period.periode;
                newPeriod.code = period.codePeriode;
                newPeriod.startDate = new Date(period.dateDebut);
                newPeriod.endDate = new Date(period.dateFin);
                newPeriod.isMockExam = period.examenBlanc;
                newPeriod.MTname = period.ensembleMatieres.nomPP;
                newPeriod.MTapreciation = period.ensembleMatieres.appreciationPP;
                newPeriod.classGeneralAverage = period.ensembleMatieres.moyenneClasse;
                newPeriod.subjects = {};
                let i = 0;
                for (let matiere of period.ensembleMatieres.disciplines) {
                    // if (matiere.sousMatiere) {
                    //     continue;
                    // }
                    let subjectCode = matiere.codeMatiere + matiere.codeSousMatiere;
                    if (matiere.groupeMatiere) {
                        subjectCode = "category" + i.toString();
                        i++;
                    }
                    const newSubject = {};
                    newSubject.code = subjectCode;
                    newSubject.elementType = "subject";
                    newSubject.id = matiere.id.toString();
                    if (matiere.sousMatiere) {
                        newSubject.name = matiere.codeMatiere + " - " + matiere.codeSousMatiere;
                    } else {
                        newSubject.name = matiere.discipline.replaceAll(". ", ".").replaceAll(".", ". ");
                    }
                    newSubject.classAverage = safeParseFloat(matiere.moyenneClasse);
                    newSubject.minAverage = safeParseFloat(matiere.moyenneMin);
                    newSubject.maxAverage = safeParseFloat(matiere.moyenneMax);
                    newSubject.coef = matiere.coef;
                    newSubject.size = matiere.effectif;
                    newSubject.rank = matiere.rang;
                    newSubject.isCategory = matiere.groupeMatiere;
                    newSubject.isSubSubject = matiere.sousMatiere;
                    newSubject.teachers = matiere.professeurs;
                    newSubject.appreciations = matiere.appreciations;
                    newSubject.grades = [];
                    newSubject.average = "N/A";
                    newSubject.streak = 0;
                    newSubject.badges = {
                        star: 0,
                        bestStudent: 0,
                        greatStudent: 0,
                        stonks: 0,
                        keepOnFire: 0,
                        meh: 0,
                    }
                    newPeriod.subjects[subjectCode] = newSubject;
                    subjectsComparativeInformation[period.codePeriode].push({
                        subjectFullname: newSubject.name,
                        classAverage: newSubject.classAverage,
                        minAverage: newSubject.minAverage,
                        maxAverage: newSubject.maxAverage
                    });
                }
                periods[period.codePeriode] = newPeriod;
                generalAverageHistory[period.codePeriode] = { generalAverages: [], dates: [] };
                classGeneralAverageHistory[period.codePeriode] = { classGeneralAverages: [], dates: [] };
                streakScoreHistory[period.codePeriode] = [];
            }
        }
        const gradesFromJson = grades.notes;
        const subjectDatas = {};

        const lastGrades = [...gradesFromJson].sort((elA, elB) => (new Date(elA.dateSaisie)).getTime() - (new Date(elB.dateSaisie)).getTime()).slice(-3);

        for (let grade of (gradesFromJson ?? [])) {
            // handle mock exam periods
            let tempPeriodCode = grade.codePeriode;
            let newPeriodCode = tempPeriodCode;
            if (periods[tempPeriodCode].isMockExam) {
                newPeriodCode = tempPeriodCode.slice(0, 4);
                if (periods[newPeriodCode] === undefined) {
                    newPeriodCode = Object.keys(periods)[Object.keys(periods).indexOf(tempPeriodCode) - 1];
                    newPeriodCode = Object.keys(periods)[Object.keys(periods).indexOf(tempPeriodCode) - 1];
                }
            }

            const periodCode = newPeriodCode;
            const subjectCode = grade.codeMatiere + grade.codeSousMatiere;
            // try to rebuild the subject if it doesn't exist (happen when changing school year)
            if (periods[periodCode].subjects[subjectCode] === undefined) {
                periods[periodCode].subjects[subjectCode] = {
                    code: subjectCode,
                    elementType: "subject",
                    name: subjectCode,
                    classAverage: "N/A",
                    minAverage: "N/A",
                    maxAverage: "N/A",
                    coef: 1,
                    size: "N/A",
                    isCategory: false,
                    teachers: [],
                    appreciations: [],
                    grades: [],
                    average: 20,
                    streak: 0,
                    badges: {
                        star: 0,
                        bestStudent: 0,
                        greatStudent: 0,
                        stonks: 0,
                        keepOnFire: 0,
                        meh: 0,
                    }
                }
            }

            const newGrade = {};
            newGrade.elementType = "grade";
            newGrade.id = grade.id.toString();
            newGrade.name = grade.devoir;
            newGrade.type = grade.typeDevoir;
            newGrade.date = new Date(grade.date);
            newGrade.entryDate = new Date(grade.dateSaisie);
            newGrade.coef = safeParseFloat(grade.coef);
            newGrade.scale = safeParseFloat(grade.noteSur);
            newGrade.value = getGradeValue(grade.valeur);
            newGrade.classMin = safeParseFloat(grade.minClasse);
            newGrade.classMax = safeParseFloat(grade.maxClasse);
            newGrade.classAverage = safeParseFloat(grade.moyenneClasse);
            newGrade.subjectName = grade.libelleMatiere;
            newGrade.isSignificant = !grade.nonSignificatif;
            newGrade.examSubject = grade.uncSujet;
            // newGrade.examSubject = grade.uncSujet === "" ? undefined : new File(grade.uncSujet, "NODEVOIR", grade.uncSujet, `sujet-${grade.devoir}-${grade.subjectCode}`, { idDevoir: grade.id });
            // newGrade.examCorrection = grade.uncCorrige === "" ? undefined : new File(grade.uncCorrige, "NODEVOIR", grade.uncCorrige, `correction-${grade.devoir}-${grade.subjectCode}`, { idDevoir: grade.id });
            newGrade.isSimulated = false;
            /* Si newGrade.isSimulated :
                pas de :
                    - moyenne de classe/min/max
                    - correction ni sujet
                    - compétence
                différences : 
                    - id = randomUUID
                choisit par l'utilisateur : 
                    - name
                    - coef
                    - scale
                    - value
                    - type
            */
            if (!subjectDatas.hasOwnProperty(periodCode)) {
                subjectDatas[periodCode] = {};
            }
            if (!subjectDatas[periodCode].hasOwnProperty(subjectCode)) {
                subjectDatas[periodCode][subjectCode] = [];
            }
            subjectDatas[periodCode][subjectCode].push({ value: newGrade.value, coef: newGrade.coef, scale: newGrade.scale, isSignificant: newGrade.isSignificant, classAverage: newGrade.classAverage });
            const nbSubjectGrades = periods[periodCode].subjects[subjectCode]?.grades.filter((el) => el.isSignificant).length ?? 0;
            const subjectAverage = periods[periodCode].subjects[subjectCode].average;
            const oldGeneralAverage = isNaN(periods[periodCode]?.generalAverage) ? 10 : periods[periodCode]?.generalAverage;
            const average = calcAverage(subjectDatas[periodCode][subjectCode]);
            const classAverage = calcClassAverage(subjectDatas[periodCode][subjectCode]);

            // streak management
            newGrade.upTheStreak = (!isNaN(newGrade.value) && newGrade.isSignificant && (nbSubjectGrades > 0 ? subjectAverage : oldGeneralAverage) <= average);
            if (newGrade.upTheStreak) {
                periods[periodCode].streak += 1;
                if (periods[periodCode].streak > periods[periodCode].maxStreak) {
                    periods[periodCode].maxStreak = periods[periodCode].streak;
                }
                periods[periodCode].totalStreak += 1;
                periods[periodCode].subjects[subjectCode].streak += 1;
            } else {
                if (newGrade.isSignificant && !["Abs", "Disp", "NE", "EA", "Comp"].includes(newGrade.value)) {
                    periods[periodCode].streak -= periods[periodCode].subjects[subjectCode].streak;
                    periods[periodCode].subjects[subjectCode].streak = 0;

                    // enlève le "upTheStreak" des notes précédant celle qu'on considère
                    for (let grade of periods[periodCode].subjects[subjectCode].grades) {
                        if (grade.upTheStreak) {
                            grade.upTheStreak = "maybe";
                        }
                    }
                }
            }
            streakScoreHistory[periodCode].push(periods[periodCode].streak);

            periods[periodCode].subjects[subjectCode].average = average;
            periods[periodCode].subjects[subjectCode].classAverage = classAverage;

            const category = findCategory(periods[periodCode].subjects, subjectCode);
            if (category !== null) {
                const categoryAverage = calcCategoryAverage(periods[periodCode], category);
                periods[periodCode].subjects[category.code].average = categoryAverage;
            }
            const generalAverage = calcGeneralAverage(periods[periodCode]);
            generalAverageHistory[periodCode].generalAverages.push(generalAverage);
            generalAverageHistory[periodCode].dates.push(newGrade.date);
            periods[periodCode].generalAverage = generalAverage;

            const classGeneralAverage = calcClassGeneralAverage(periods[periodCode]);
            classGeneralAverageHistory[periodCode].classGeneralAverages.push(classGeneralAverage);
            classGeneralAverageHistory[periodCode].dates.push(newGrade.date);
            periods[periodCode].classGeneralAverage = classGeneralAverage;

            // création des badges
            const gradeBadges = [];
            if (!isNaN(newGrade.value)) {
                if (newGrade.value === newGrade.scale) { // si la note est au max on donne l'étoile (le parfait)
                    gradeBadges.push("star");
                    periods[periodCode].subjects[subjectCode].badges.star++
                    totalBadges.star++
                }
                if (newGrade.value === newGrade.classMax) { // si la note est la meilleure de la classe on donne le plus
                    gradeBadges.push("bestStudent");
                    periods[periodCode].subjects[subjectCode].badges.bestStudent++
                    totalBadges.bestStudent++
                }
                if (newGrade.value > newGrade.classAverage) { // si la note est > que la moyenne de la classe on donne le badge checkBox tier
                    gradeBadges.push("greatStudent");
                    periods[periodCode].subjects[subjectCode].badges.greatStudent++
                    totalBadges.greatStudent++
                }
                if ((newGrade.value / newGrade.scale * 20) > subjectAverage) { // si la note est > que la moyenne de la matiere on donne le badge stonks tier
                    gradeBadges.push("stonks");
                    periods[periodCode].subjects[subjectCode].badges.stonks++
                    totalBadges.stonks++
                }
                if (newGrade.upTheStreak) { // si la note up la streak on donne le badge de streak
                    gradeBadges.push("keepOnFire");
                    periods[periodCode].subjects[subjectCode].badges.keepOnFire++
                    totalBadges.keepOnFire++
                }
                if ((newGrade.value / newGrade.scale * 20) === subjectAverage) { // si la note est = à la moyenne de la matiere on donne le badge = tier
                    gradeBadges.push("meh");
                    periods[periodCode].subjects[subjectCode].badges.meh++
                    totalBadges.meh++
                }
            }
            newGrade.badges = gradeBadges;
            newGrade.skill = formatSkills(grade.elementsProgramme)

            periods[periodCode].subjects[subjectCode].grades.push(newGrade);
            if (lastGrades.includes(grade)) {
                newLastGrades.push(newGrade)
            }
        }
    }

    // supprime les périodes vides et examens blancs
    let i = 0;
    let firstPeriod;
    for (const key in periods) {
        if (i === 0) {
            firstPeriod = { key: key, value: periods[key] }
        }
        i++;
        let isEmpty = true;
        if (periods[key])
            for (const subject in periods[key].subjects) {
                if (periods[key].subjects[subject].grades.length !== 0) {
                    isEmpty = false;
                }
            }
        if (isEmpty || periods[key].isMockExam) {
            delete periods[key];
        }
    }
    // Ajoute une première période si c'est le début de l'année et que toutes les périodes sont vides
    if (firstPeriod !== undefined && Object.keys(periods).length < 1) {
        periods[firstPeriod.key] = firstPeriod.value;
    }

    const settings = grades.parametrage;
    const enabledFeatures = {};
    enabledFeatures.moyenneMin = settings.moyenneMin;
    enabledFeatures.moyenneMax = settings.moyenneMax;
    enabledFeatures.coefficient = settings.coefficientNote;
    enabledFeatures.rank = settings.moyenneRang;

    // add the average of all subjects a special type of chart
    for (const period in periods) {
        for (const subject in periods[period].subjects) {
            for (const subjectID in subjectsComparativeInformation[period]) {
                if (periods[period].subjects[subject].name === subjectsComparativeInformation[period][subjectID].subjectFullname) {
                    const newAverage = periods[period].subjects[subject].average;
                    if (newAverage === "N/A" || periods[period].subjects[subject].classAverage === "N/A" || periods[period].subjects[subject].code.includes("category")) {
                        subjectsComparativeInformation[period].splice(subjectID, 1);
                        break;
                    }
                    subjectsComparativeInformation[period][subjectID].average = newAverage;
                    break;
                }
            }
        }
    }

    let activePeriodIndex = 0;
    for (let periodCode in periods) {
        if (Date.now() > periods[periodCode].endDate) {
            if (activePeriodIndex < Object.keys(periods).length - 1) {
                activePeriodIndex++;
            }
        }
    }
    const activePeriod = Object.keys(periods)[activePeriodIndex];

    return {
        grades: periods,
        totalBadges,
        generalAverageHistory, // used for charts
        classGeneralAverageHistory, // used for charts
        streakScoreHistory, // used for charts
        subjectsComparativeInformation, // used for charts
        gradesEnabledFeatures: enabledFeatures,
        lastGrades: newLastGrades.reverse(),
        activePeriod,
        activeGradeElement: null, // set this will change the default element selected by user when loading grades.
    }
}