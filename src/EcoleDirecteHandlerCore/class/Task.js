import fetchHomeworksDone from "../requests/fetchHomeworkDone";

export default class Task {
	constructor({ id, date, account, type, subjectCode, subject, addDate, isInterrogation, isDone, detailed, teacher, content, files, sessionContent, sessionContentFiles }) {
		this.id = id;
		this.date = date;
		this.account = account;
		this.type = type;
		this.subjectCode = subjectCode;
		this.subject = subject;
		this.addDate = addDate;
		this.isInterrogation = isInterrogation;
		this.isDone = isDone;
		this.detailed = detailed;
		this.teacher = teacher;
		this.content = content;
		this.files = files;
		this.sessionContent = sessionContent;
		this.sessionContentFiles = sessionContentFiles;
	}

	async check(controller = (new AbortController())) {
		const param = this.isDone
			? {tasksNotDone: [this.id]}
			: {tasksDone: [this.id]};
		fetchHomeworksDone(param, this.account.selectedUser.id, this.account.token.value, controller)
			.then((result) => {
				if (result.token) {
					this.account.token.set(result.token);
				}
			});
	}
}
