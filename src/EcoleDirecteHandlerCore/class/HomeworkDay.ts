import { format } from "date-fns";
import { HomeworksCodes } from "../constants/codes";
import { mapHomeworksDay } from "../mappers/homeworksDay";
import fetchHomeworksDay from "../requests/fetchHomeworksDay";
import SessionContent from "./SessionContent";
import Task from "./Task";
import { handleFetchError } from "../utils/requests/handleFetchError";
import { DetailledHomeworkData, DetailledHomeworkResponse } from "../structures/DetailledHomeworkResponse";
import { guestDataPath } from "../constants/config";
import { Account } from "../hooks/useEcoleDirecteAccount";

export default class HomeworkDay {
	date: Date;
	account: Account;
	detailed: boolean;
	taskList: Task[];
	sessionContentList: SessionContent[];
	/**
	 * 
	 * @param {Date} `date` the date of the homeworkDay
	 * @param {any} `account` the account object initialized in the useEcoleDirecteSession.js file
	 */
	constructor(account: Account, date: Date) {
		this.date = date;
		this.account = account;
		this.detailed = false;
		this.taskList = [];
		this.sessionContentList = [];
	}

	/**
	 * @param {Task|Task[]} `tasks` task(s) that will be added to this object's task list
	*/
	addTasks(tasks: Task | Task[]) {
		if (tasks instanceof Task) {
			this.taskList.push(tasks);
		} else {
			this.taskList.push(...tasks);
		}
	}

	/**
	 * @param {SessionContent|SessionContent[]} `sessionContents` sessionContent(s) that will be added to this object's sessionContent list
	*/
	addSessionContents(sessionContents: SessionContent | SessionContent[]) {
		if (sessionContents instanceof SessionContent) {
			this.sessionContentList.push(sessionContents);
		} else {
			this.sessionContentList.push(...sessionContents);
		}
	}

	getInterrogations() {
		return this.taskList.filter((task) => task.isInterrogation);
	}

	get empty() {
		return !this.taskList.length && !this.sessionContentList.length;
	}

	get ISODate() {
		return format(this.date, "yyyy-MM-dd");
	}

	applyDetail(detailData: DetailledHomeworkData) {
		const { mappedTaskList, mappedSessionContentList } = mapHomeworksDay(detailData);

		for (const mappedTask of mappedTaskList) {
			const existingTask = this.taskList.find((task) => task.id === mappedTask.id);

			if (existingTask)
				existingTask.applyDetail(mappedTask);
			else
				this.taskList.push(new Task(this.account, this, mappedTask).applyDetail(mappedTask));
		}

		for (const mappedSessionContent of mappedSessionContentList) {
			const existingSessionContent = this.sessionContentList.find((sessionContent) => sessionContent.id === mappedSessionContent.id);

			if (existingSessionContent)
				existingSessionContent.applyDetail(mappedSessionContent);
			else
				this.sessionContentList.push(new SessionContent(this.account, this, mappedSessionContent).applyDetail(mappedSessionContent));
		}

		this.detailed = true;
	}

	async detail(controller: AbortController) {
		let response: DetailledHomeworkResponse;

		try {
			response = this.account.selectedUser.id < 0
				? await import(/* @vite-ignore */ guestDataPath.detailed_homeworks) as DetailledHomeworkResponse
				: await fetchHomeworksDay(this.ISODate, this.account.selectedUser.id, this.account.token.value, controller);
			this.account.token.set((old: string) => (response?.token || old));
			switch (response.code) {
				case 200:
					this.applyDetail(response.data);
					return HomeworksCodes.SUCCESS;
				default:
					return { code: -1, message: response.message };
			}
		} catch (error: unknown) {
			if (error instanceof Error) {
				return handleFetchError(error, this.account.loginStates.set);
			}
		}
	}

	static createFromUpcoming(account: Account, homeworkDayData: any, ISODate: string) {
		const homeworkDay = new HomeworkDay(account, new Date(ISODate));

		for (const homework of homeworkDayData) {
			if (homework.aFaire) {
				const task = Task.createFromUpcoming(account, homeworkDay, homework);
				homeworkDay.addTasks(task);
			} else {
				const sessionContent = SessionContent.createFromUpcoming(account, homeworkDay, homework);
				homeworkDay.addSessionContents(sessionContent);
			}
		}

		return homeworkDay;
	}
}