import { getToday } from "../utils/date";
import Task from "../class/Task";
import HomeworkDay from "../class/HomeworkDay";
import SessionContent from "../class/SessionContent";
const tomorrow = getToday();
tomorrow.setDate(tomorrow.getDate() + 1);

export function mapHomeworks(homeworks, account) {
    // This function will map (I would rather call it translate) the EcoleDirecte response to a better js object
    let activeHomeworkDate = null;
    let activeHomeworkId = null;
    const mappedUpcomingAssignments = []
    const mappedHomeworks = {}

    Object.entries(homeworks).forEach(([date, rawTaskList]) => {
        if (activeHomeworkDate === null && tomorrow < new Date(date)) {
            activeHomeworkDate = date;
        }

        const homeworkDay = new HomeworkDay(date, account);
        rawTaskList.forEach((homework) => {
            const { idDevoir, codeMatiere, aFaire, donneLe, effectue, interrogation, matiere, /* rendreEnLigne, documentsAFaire // I don't know what to do with that for now */ } = homework;
            if (aFaire) {
                const task = new Task(account, homeworkDay, {
                    id: idDevoir,
                    subjectCode: codeMatiere,
                    isDone: effectue,
                    isInterrogation: interrogation,
                    subject: matiere,
                    addDate: donneLe,
                });

                homeworkDay.addTasks(task);
                if (interrogation && mappedUpcomingAssignments.length < 3) {
                    mappedUpcomingAssignments.push(task);
                }
            } else {
                const sessionContent = new SessionContent({
                    id: idDevoir,
                    subjectCode: codeMatiere,
                    account: account,
                    day: homeworkDay,
                    subject: matiere,
                    addDate: donneLe,
                });
                homeworkDay.addSessionContents(sessionContent);
            }
            mappedHomeworks[date] = homeworkDay;
        });
    })

    return {
        mappedHomeworks,
        mappedUpcomingAssignments,
        activeHomeworkDate,
        activeHomeworkId,
    }
}
