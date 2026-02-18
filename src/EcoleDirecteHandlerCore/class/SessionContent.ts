import { Account } from "../hooks/useEcoleDirecteAccount";
import { DetailledHomeworkDayData } from "../structures/DetailledHomeworkResponse";
import { UpcomingHomeworkDayData } from "../structures/UpcomingHomeworkResponse";
import EcoleDirecteFile from "./EcoleDirecteFile";
import HomeworkDay from "./HomeworkDay";

export default class SessionContent {
	account: Account;
	day: HomeworkDay;
	id: number;
	subjectCode: string;

	subject: string;
	teacher: string | null;
	sessionContent: any | null;
	sessionContentFiles: Array<EcoleDirecteFile> | null;

	constructor(
		account: Account,
		day: HomeworkDay,
		{
			id,
			subjectCode,
			subject,
		}: { id: number; subjectCode: string; subject: string },
	) {
		this.account = account;
		this.day = day;

		this.id = id;
		this.subjectCode = subjectCode;
		this.subject = subject;

		this.teacher = null;
		this.sessionContent = null;
		this.sessionContentFiles = null;
	}

	applyDetail({
		teacher,
		sessionContent,
		sessionContentFiles,
	}: {
		teacher: string;
		sessionContent: any;
		sessionContentFiles: Array<EcoleDirecteFile>;
	}) {
		this.teacher = teacher;
		this.sessionContent = sessionContent;
		this.sessionContentFiles = sessionContentFiles;
		return this;
	}

	get detailed() {
		return this.day.detailed;
	}

	static createFromUpcoming(
		account: Account,
		homeworkDay: HomeworkDay,
		sessionContentData: UpcomingHomeworkDayData,
	) {
		const { idDevoir, codeMatiere, matiere } = sessionContentData;

		return new SessionContent(account, homeworkDay, {
			id: idDevoir,
			subjectCode: codeMatiere,
			subject: matiere,
		});
	}

	static createFromDetail(
		account: Account,
		homeworkDay: HomeworkDay,
		sessionContentData: DetailledHomeworkDayData,
	) {
		const { id, codeMatiere, matiere } = sessionContentData;

		return new SessionContent(account, homeworkDay, {
			id: id,
			subjectCode: codeMatiere,
			subject: matiere,
		});
	}
}
