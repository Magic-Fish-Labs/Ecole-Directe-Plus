export default class SessionContent {
	teacher;
	sessionContent;
	sessionContentFiles;
	
	constructor(account, day, { id, subjectCode, type, isDone, subject, addDate, isInterrogation }) {
		this.id = id;
		this.subjectCode = subjectCode;
		this.type = type;
		this.isDone = isDone;
		this.isInterrogation = isInterrogation;
		this.account = account;
		this.subject = subject;
		this.addDate = addDate;
	}

	detail({teacher, sessionContent, sessionContentFiles}) {
		this.teacher = teacher;
		this.sessionContent = sessionContent;
		this.sessionContentFiles = sessionContentFiles;
	}
}
