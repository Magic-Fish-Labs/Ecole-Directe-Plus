import fetchHomeworksDone from "../requests/fetchHomeworkDone";
import fetchHomeworksDay from "../requests/fetchHomeworksDay";
import HomeworkDay from "./HomeworkDay";

export default class Task {

	/**
	 * 
	 * @param {object} account 
	 * @param {HomeworkDay} day 
	 * @param {object} params 
	 */
	constructor(account, day, { id, subjectCode, isDone, subject, addDate, isInterrogation }) {
		this.account = account;
		this.day = day;

		this.id = id;
		this.subjectCode = subjectCode;
		this.subject = subject;
		this.isDone = isDone;
		this.isInterrogation = isInterrogation;
		this.addDate = addDate;
	}

	applyDetail({ teacher, content, files, sessionContent, sessionContentFiles }) {
		this.teacher = teacher;
		this.content = content;
		this.files = files;
		this.sessionContent = sessionContent;
		this.sessionContentFiles = sessionContentFiles;
		return this;
	}

	get detailed() {
		return this.day.detailed;
	}

	async check(controller) {
		const param = this.isDone
			? { tasksNotDone: [this.id] }
			: { tasksDone: [this.id] };
		fetchHomeworksDone(param, this.account.selectedUser.id, this.account.token.value, controller)
			.then((result) => {
				if (result.token) {
					this.account.token.set(result.token);
				}
			});
	}

	static createFromUpcoming(account, homeworkDay, taskData) {
		const { idDevoir, codeMatiere, donneLe, effectue, interrogation, matiere /* rendreEnLigne, documentsAFaire // I don't know what to do with that for now */ } = taskData;

		return new Task(account, homeworkDay, {
			id: idDevoir,
			subjectCode: codeMatiere,
			isDone: effectue,
			isInterrogation: interrogation,
			subject: matiere,
			addDate: donneLe,
		});
	}
}
