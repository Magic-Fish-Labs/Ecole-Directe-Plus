import { format } from "date-fns";
import { HomeworksCodes } from "../constants/codes";
import { mapHomeworksDay } from "../mappers/homeworksDay";
import fetchHomeworksDay from "../requests/fetchHomeworksDay";
import SessionContent from "./SessionContent";
import Task from "./Task";
import { handleFetchError } from "../utils/requests/handleFetchError";

export default class HomeworkDay {
	/**
	 * 
	 * @param {Date} date the date of the homeworkDay
	 * @param {object} account the account object initialized in the useEcoleDirecteSession.js file
	 */
	constructor(account, date) {
		this.date = date;
		this.account = account;
		this.detailed = false;
		this.taskList = [];
		this.sessionContentList = [];
	}

	/**
	 * @param {Task|Task[]} tasks task(s) that will be added to this object's task list
	*/
	addTasks(tasks) {
		if (tasks instanceof Task) {
			this.taskList.push(tasks);
		} else {
			this.taskList.push(...tasks);
		}
	}

	/**
	 * @param {SessionContent|SessionContent[]} sessionContents  sessionContent(s) that will be added to this object's sessionContent list
	*/
	addSessionContents(sessionContents) {
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

	applyDetail(detailData) {
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

	async detail(controller) {
		let response;

		try {
			response = this.account.selectedUser.id < 0
				? await import(/* @vite-ignore */ guestDataPath.detailed_homeworks)
				: await fetchHomeworksDay(this.ISODate, this.account.selectedUser.id, this.account.token.value, controller);
		} catch (error) {
			return handleFetchError(error, this.account.loginStates.set);
		}
		this.account.token.set((old) => (response?.token || old));
		switch (response.code) {
			case 200:
				this.applyDetail(response.data);
				return HomeworksCodes.SUCCESS;
			default:
				return { code: -1, message: response.message };
		}
	}

	static createFromRaw(account, homeworkDayData, ISODate) {
		const homeworkDay = new HomeworkDay(account, new Date(ISODate));

		for (const homework of homeworkDayData) {
			if (homework.aFaire) {
				const task = Task.createFromRaw(account, homeworkDay, homework);
				homeworkDay.addTasks(task);
			} else {
				const sessionContent = SessionContent.createFromRaw(homework);
				homeworkDay.addSessionContents(sessionContent);
			}
		}

		return homeworkDay;
	}
}