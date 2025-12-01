import { decodeBase64 } from "../utils/utils";
import EcoleDirecteFile from "../class/EcoleDirecteFile";
import { getToday } from "../utils/date";
import { DetailledHomeworkData, SessionContentData } from "../structures/DetailledHomeworkResponse";
const tomorrow = getToday();
tomorrow.setDate(tomorrow.getDate() + 1);

export function mapHomeworksDay(detailedHomeworksDayData: DetailledHomeworkData) {
    const mappedTaskList = [];
    const mappedSessionContentList = [];

    for (let { aFaire, id, codeMatiere, matiere, nomProf, contenuDeSeance, interrogation } of detailedHomeworksDayData.matieres) {
        if (!contenuDeSeance) {
            if (!aFaire) continue;
            contenuDeSeance = aFaire.contenuDeSeance as SessionContentData;
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
            mappedSessionContentList.push({
                id: id,
                subjectCode: codeMatiere,
                subject: matiere,
                teacher: nomProf,
                sessionContent: contenuDeSeance.contenu,
                sessionContentFiles: contenuDeSeance.documents.map((e) => (new EcoleDirecteFile(e.id, e.type, e.libelle)))
            });
        }
    }

    console.log(mappedSessionContentList);

    return { mappedTaskList, mappedSessionContentList };
}