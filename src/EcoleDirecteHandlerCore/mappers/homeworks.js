import { decodeBase64 } from "../utils/utils";
import EcoleDirecteFile from "../class/EcoleDirecteFile";
import { getToday } from "../utils/date";
import Task from "../class/Task";
const tomorrow = getToday();
tomorrow.setDate(tomorrow.getDate() + 1);

export function mapUpcomingHomeworks(homeworks, account) {
    // This function will map (I would rather call it translate) the EcoleDirecte response to a better js object
    let activeHomeworkDate = null;
    let activeHomeworkId = null;
    const mappedUpcomingAssignments = []
    const mappedHomeworks = Object.fromEntries(Object.entries(homeworks).map((day) => {
        if (activeHomeworkDate === null && tomorrow < new Date(day[0])) {
            activeHomeworkDate = day[0];
        }
        return [day[0], day[1].map((homework) => {
            const { codeMatiere, aFaire, donneLe, effectue, idDevoir, interrogation, matiere, /* rendreEnLigne, documentsAFaire // I don't know what to do with that for now */ } = homework;
            const task = new Task({
                id: idDevoir,
                date: day[0],
                account: account,
                detailed: false,
                type: aFaire ? "task" : "sessionContent",
                subjectCode: codeMatiere,
                subject: matiere,
                addDate: donneLe,
                isInterrogation: interrogation,
                isDone: effectue
            })

            if (interrogation && mappedUpcomingAssignments.length < 3) {
                mappedUpcomingAssignments.push(task);
            }

            return task;
        })]
    }))

    return {
        mappedHomeworks,
        mappedUpcomingAssignments,
        activeHomeworkDate,
        activeHomeworkId,
    }
}

export function mapDayHomeworks(homeworks, account) { // This function will sort (I would rather call it translate) the EcoleDirecte response to a better js object 
    const mappedHomeworks = homeworks.matieres.map((homework) => {
        const { aFaire, codeMatiere, id, interrogation, matiere, nomProf } = homework;
        var contenuDeSeance = homework.contenuDeSeance;
        if (!aFaire && !contenuDeSeance) {
            return null;
        }

        if (!contenuDeSeance) {
            contenuDeSeance = aFaire.contenuDeSeance;
        }

        if (aFaire) {
            const { donneLe, effectue, contenu, documents } = aFaire;
            return new Task({
                id: id,
                date: homeworks.date,
                account: account,
                detailed: true,
                type: "task",
                subjectCode: codeMatiere,
                subject: matiere,
                addDate: donneLe,
                isInterrogation: interrogation,
                isDone: effectue,
                teacher: nomProf,
                content: decodeBase64(contenu),
                files: documents.map((e) => (new EcoleDirecteFile(e.id, e.type, e.libelle))),
                sessionContent: decodeBase64(contenuDeSeance.contenu),
                sessionContentFiles: contenuDeSeance.documents.map((e) => (new EcoleDirecteFile(e.id, e.type, e.libelle)))
            });
        } else {
            // This handles the case where there is no homework but there is a session content. I think it can be improved but for now it's fine
            return new Task({
                id: id,
                date: homeworks.date,
                account: account,
                detailed: true,
                type: "sessionContent",
                subjectCode: codeMatiere,
                subject: matiere,
                addDate: day[0],
                teacher: nomProf,
                sessionContent: contenuDeSeance.contenu,
                sessionContentFiles: contenuDeSeance.documents.map((e) => (new File(e.id, e.type, e.libelle)))
            })
        }
    }).filter((item) => item);

    return { mappedDay: { [homeworks.date]: mappedHomeworks } }
}