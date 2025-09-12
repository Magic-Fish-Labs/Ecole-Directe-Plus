export default class SessionContent {
	teacher;
	sessionContent;
	sessionContentFiles;

	constructor(account, day, { id, subjectCode, subject, addDate }) {
		this.account = account;
		this.day = day;

		this.id = id;
		this.subjectCode = subjectCode;
		this.subject = subject;
		this.addDate = addDate;
	}

	detail({ teacher, sessionContent, sessionContentFiles }) {
		this.teacher = teacher;
		this.sessionContent = sessionContent;
		this.sessionContentFiles = sessionContentFiles;
	}

	static createFromRaw(account, homeworkDay, sessionContentData) {
		const { idDevoir, codeMatiere, donneLe, matiere } = sessionContentData;

		return new SessionContent(account, homeworkDay, {
			id: idDevoir,
			subjectCode: codeMatiere,
			subject: matiere,
			addDate: donneLe,
		});
	}
}
