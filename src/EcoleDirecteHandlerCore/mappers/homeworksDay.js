import { decodeBase64 } from "../utils/utils";
import EcoleDirecteFile from "../class/EcoleDirecteFile";
import { getToday } from "../utils/date";
import Task from "../class/Task";
const tomorrow = getToday();
tomorrow.setDate(tomorrow.getDate() + 1);

export function mapHomeworksDay(homeworksDay) {
    const mappedTaskList = [];
    const mappedSessionContentList = [];
    homeworksDay.matieres.forEach((homeworkElement) => {
        const { aFaire, id, nomProf } = homeworkElement;
        let contenuDeSeance = homeworkElement.contenuDeSeance;
        if (!contenuDeSeance) {
            if (!aFaire) return;
            contenuDeSeance = aFaire.contenuDeSeance;
        }

        if (aFaire) {
            const { donneLe, effectue, contenu, documents } = aFaire;
            mappedTaskList.push({
                id: id,
                isDone: effectue,
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
                teacher: nomProf,
                sessionContent: contenuDeSeance.contenu,
                sessionContentFiles: contenuDeSeance.documents.map((e) => (new File(e.id, e.type, e.libelle)))
            });
        }
    });
    return { mappedTaskList, mappedSessionContentList };
}