import fetchHomeworksDone from "../requests/fetchHomeworkDone";
import fetchHomeworksDay from "../requests/fetchHomeworksDay";
import HomeworkDay from "./HomeworkDay";

export default class Task {
	// !:! WARNING: This needs to be really really thougt about a bit more because actually event doing a setHomeworks({...homworks}), will not rerender if the only props in a component is an sub object of homeworks,
	// meaning we have to do a useContext in all component that use the grades or homeworks userData for instance event if they doin't need the full grades/homeworks object.
	teacher;
	content;
	files;
	sessionContent;
	sessionContentFiles;
	/**
	 * 
	 * @param {object} account 
	 * @param {HomeworkDay} day 
	 * @param {object} params 
	 */
	constructor(account, day, { id, subjectCode, isDone, subject, addDate, isInterrogation }) {
		this.id = id;
		this.subjectCode = subjectCode;
		this.isDone = isDone;
		this.isInterrogation = isInterrogation;
		this.subject = subject;
		this.addDate = addDate;
		this.account = account;
		this.day = day;
	}

	detail({teacher, content, files, sessionContent, sessionContentFiles}) {
		this.teacher = teacher;
		this.content = content;
		this.files = files;
		this.sessionContent = sessionContent;
		this.sessionContentFiles = sessionContentFiles;
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
}
