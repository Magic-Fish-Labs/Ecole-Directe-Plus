import { useState } from "react";

import PopUp from "../../generic/PopUps/PopUp";
import DropDownMenu from "../../generic/UserInputs/DropDownMenu";
import InfoButton from "../../generic/Informative/InfoButton";
import CanardmanSleeping from "../../graphics/CanardmanSleeping";
import { calcGeneralAverage, calcClassGeneralAverage, getGradeValue, safeParseFloat } from "../../../utils/gradesTools";

import "./Statistics.css";

function isPeriodCurrent(period) {
    const now = Date.now();
    const startDate = new Date(period?.dateDebut).getTime();
    const endDate = new Date(period?.dateFin).getTime();
    return !isNaN(startDate) && !isNaN(endDate) && now >= startDate && now <= endDate;
}

function formatAverage(value) {
    if (typeof value !== "number" || isNaN(value)) {
        return "N/A";
    }
    return value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatGrade(value) {
    if (typeof value !== "number" || isNaN(value)) {
        return "N/A";
    }
    return value.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
}

function formatCount(value) {
    return Number(value || 0).toLocaleString("fr-FR");
}

function findMostRated(gradeList, isBetter) {
    let result = null;
    for (const grade of gradeList) {
        if (result === null || isBetter(grade, result)) {
            result = grade;
        }
    }
    return result;
}

function formatBestNote(grade) {
    if (!grade) {
        return "N/A";
    }
    const scale = typeof grade.scale === "number" && grade.scale > 0 ? ` / ${formatGrade(grade.scale)}` : "";
    return `${formatGrade(grade.value)}${scale}`;
}

export default function Statistics({ grades, activeAccount, onClose }) {
    const accountGrades = grades?.[activeAccount];
    const periods = accountGrades?.periodes ?? [];
    const notes = accountGrades?.notes ?? [];

    const availablePeriods = periods.filter((period) => (
        Boolean(period?.codePeriode)
        && (
            notes.some((note) => note.codePeriode === period.codePeriode)
            || safeParseFloat(period?.ensembleMatieres?.moyenneGenerale) !== "N/A"
        )
    ));

    const [selectedPeriod, setSelectedPeriod] = useState("");

    const currentPeriod = availablePeriods.find(isPeriodCurrent);
    const selectedPeriodCode = availablePeriods.some((period) => period.codePeriode === selectedPeriod)
        ? selectedPeriod
        : ((currentPeriod ?? availablePeriods[0])?.codePeriode ?? "");
    const selectedPeriodData = availablePeriods.find((period) => period.codePeriode === selectedPeriodCode);
    const periodNotes = notes.filter((note) => note.codePeriode === selectedPeriodCode);
    const disciplines = (selectedPeriodData?.ensembleMatieres?.disciplines ?? []).filter((discipline) => !discipline.groupeMatiere);

    const subjectsMap = {};
    disciplines.forEach((discipline, index) => {
        const subjectCode = `${discipline.codeMatiere ?? ""}${discipline.codeSousMatiere ?? ""}` || `subject${index}`;
        subjectsMap[subjectCode] = {
            name: discipline.sousMatiere ? `${discipline.codeMatiere ?? ""} - ${discipline.codeSousMatiere ?? ""}` : (discipline.discipline ?? ""),
            coef: Number(discipline.coef) || 0,
            isCategory: false,
            isSubSubject: Boolean(discipline.sousMatiere),
            average: safeParseFloat(discipline.moyenne),
            classAverage: safeParseFloat(discipline.moyenneClasse),
        };
    });
    const subjectsPeriod = { subjects: subjectsMap };
    const generalAverage = calcGeneralAverage(subjectsPeriod);
    const edClassGeneralAverage = safeParseFloat(selectedPeriodData?.ensembleMatieres?.moyenneClasse);
    const classGeneralAverage = typeof edClassGeneralAverage === "number"
        ? edClassGeneralAverage
        : calcClassGeneralAverage(subjectsPeriod);

    const subjectRows = disciplines.map((discipline, index) => ({
        name: discipline.sousMatiere ? `${discipline.codeMatiere ?? ""} - ${discipline.codeSousMatiere ?? ""}` : (discipline.discipline ?? `subject${index}`),
        average: safeParseFloat(discipline.moyenne),
        classAverage: safeParseFloat(discipline.moyenneClasse),
    })).filter((row) => row.average !== "N/A" || row.classAverage !== "N/A");

    const significantNotes = periodNotes
        .filter((note) => !note.nonSignificatif)
        .map((note) => ({
            value: getGradeValue(note.valeur ?? ""),
            scale: safeParseFloat(note.noteSur),
            classAverage: safeParseFloat(note.moyenneClasse),
            subject: note.libelleMatiere ?? "",
        }));
    const numericNotes = significantNotes.filter((note) => typeof note.value === "number");
    const comparableNotes = numericNotes.filter((note) => typeof note.scale === "number" && note.scale > 0);
    const bestNote = findMostRated(comparableNotes, (note, other) => (note.value / note.scale) > (other.value / other.scale));
    const worstNote = findMostRated(comparableNotes, (note, other) => (note.value / note.scale) < (other.value / other.scale));

    let aboveClassAverage = 0;
    let belowClassAverage = 0;
    for (const note of numericNotes) {
        if (typeof note.classAverage === "number") {
            if (note.value > note.classAverage) {
                aboveClassAverage++;
            } else if (note.value < note.classAverage) {
                belowClassAverage++;
            }
        }
    }

    const appreciation = typeof selectedPeriodData?.ensembleMatieres?.appreciationPP === "string" ? selectedPeriodData.ensembleMatieres.appreciationPP.trim() : "";
    const decision = typeof selectedPeriodData?.ensembleMatieres?.decisionDuConseil === "string" ? selectedPeriodData.ensembleMatieres.decisionDuConseil.trim() : "";

    const periodCodes = availablePeriods.map((period) => period.codePeriode);
    const periodLabels = availablePeriods.map((period) => period.periode ?? period.codePeriode);

    return (
        <PopUp className="statistics-pop-up" onClose={onClose}>
            <div className="statistics-container">
                <div className="statistics-heading-container">
                    <h2 className="statistics-heading">Statistiques</h2>
                    <InfoButton>La moyenne générale est calculée à partir des moyennes de chaque matière, pondérées par leurs coefficients. La moyenne de classe provient des informations fournies par École Directe.</InfoButton>
                </div>
                {availablePeriods.length > 0 ? (
                    <>
                        <div className="statistics-period-selector">
                            <span>Période</span>
                            <DropDownMenu
                                name="statistics-period"
                                options={periodCodes}
                                displayedOptions={periodLabels}
                                selected={selectedPeriodCode}
                                onChange={setSelectedPeriod}
                            />
                        </div>
                        <div className="statistics-summary">
                            <div className="statistics-item">
                                <span className="statistics-item-label">Moyenne générale</span>
                                <span className="statistics-item-value">{formatAverage(generalAverage)}</span>
                            </div>
                            <div className="statistics-item">
                                <span className="statistics-item-label">Moyenne de classe</span>
                                <span className="statistics-item-value">{formatAverage(classGeneralAverage)}</span>
                            </div>
                            <div className="statistics-item">
                                <span className="statistics-item-label">Nombre de notes</span>
                                <span className="statistics-item-value">{formatCount(periodNotes.length)}</span>
                            </div>
                            <div className="statistics-item">
                                <span className="statistics-item-label">Meilleure note</span>
                                <span className="statistics-item-value">
                                    {formatBestNote(bestNote)}
                                    {bestNote && <span className="statistics-item-subvalue">{bestNote.subject}</span>}
                                </span>
                            </div>
                            <div className="statistics-item">
                                <span className="statistics-item-label">Plus faible note</span>
                                <span className="statistics-item-value">
                                    {formatBestNote(worstNote)}
                                    {worstNote && <span className="statistics-item-subvalue">{worstNote.subject}</span>}
                                </span>
                            </div>
                            <div className="statistics-item">
                                <span className="statistics-item-label">Au-dessus de la moyenne de la classe</span>
                                <span className="statistics-item-value">{formatCount(aboveClassAverage)}</span>
                            </div>
                            <div className="statistics-item">
                                <span className="statistics-item-label">En dessous de la moyenne de la classe</span>
                                <span className="statistics-item-value">{formatCount(belowClassAverage)}</span>
                            </div>
                        </div>
                        {subjectRows.length > 0 && (
                            <>
                                <h3 className="statistics-subheading">Moyennes par matière</h3>
                                <table className="statistics-subjects-table">
                                    <thead>
                                        <tr>
                                            <th>Matière</th>
                                            <th>Moyenne</th>
                                            <th>Moyenne de classe</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subjectRows.map((row, index) => (
                                            <tr key={`${row.name}-${index}`}>
                                                <td>{row.name}</td>
                                                <td>{formatAverage(row.average)}</td>
                                                <td>{formatAverage(row.classAverage)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}
                        {(appreciation || decision) && (
                            <div className="statistics-commentaries">
                                {appreciation && (
                                    <div className="statistics-commentary">
                                        <span className="statistics-commentary-label">Appréciation générale</span>
                                        <p>{appreciation}</p>
                                    </div>
                                )}
                                {decision && (
                                    <div className="statistics-commentary">
                                        <span className="statistics-commentary-label">Décision du conseil</span>
                                        <p>{decision}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="statistics-empty">
                        <CanardmanSleeping className="statistics-empty-logo" alt="Canardman endormi" />
                        <span>{accountGrades ? "Aucune note disponible pour le moment" : "Les notes ne sont pas encore chargées"}</span>
                    </div>
                )}
            </div>
        </PopUp>
    );
}
