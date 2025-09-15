import { decodeBase64 } from "../utils/utils";
import EcoleDirecteFile from "../class/EcoleDirecteFile";
import { getToday } from "../utils/date";
import Task from "../class/Task";
const tomorrow = getToday();
tomorrow.setDate(tomorrow.getDate() + 1);

export function mapHomeworksDay(detailedHomeworksDayData) {
    const mappedTaskList = [];
    const mappedSessionContentList = [];

    for (let { aFaire, id, codeMatiere, matiere, nomProf, contenuDeSeance, interrogation } of detailedHomeworksDayData.matieres) {
        if (!contenuDeSeance) {
            if (!aFaire) continue;
            contenuDeSeance = aFaire.contenuDeSeance;
        }

        if (aFaire) {
            const { donneLe, effectue, contenu, documents } = aFaire;
            mappedTaskList.push({
                id: id,
                subjectCode: codeMatiere,
                subject: matiere,
                isDone: effectue,
                isInterrogation: interrogation,
                teacher: nomProf,
                addDate: donneLe,
                content: decodeBase64(contenu),
                files: documents.map((e) => (new EcoleDirecteFile(e.id, e.type, e.libelle))),
                sessionContent: decodeBase64(contenuDeSeance.contenu),
                sessionContentFiles: contenuDeSeance.documents.map((e) => (new EcoleDirecteFile(e.id, e.type, e.libelle)))
            });
        } else {
            mappedTaskList.push({
                id: id,
                subjectCode: codeMatiere,
                subject: matiere,
                teacher: nomProf,
                addDate: donneLe,
                sessionContent: contenuDeSeance.contenu,
                sessionContentFiles: contenuDeSeance.documents.map((e) => (new File(e.id, e.type, e.libelle)))
            });
        }
    }

    return { mappedTaskList, mappedSessionContentList };
}