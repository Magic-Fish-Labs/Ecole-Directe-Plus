import { format } from "date-fns";
import { HomeworksCodes } from "../constants/codes";
import { mapHomeworksDay } from "../mappers/homeworksDay";
import fetchHomeworksDay from "../requests/fetchHomeworksDay";
import SessionContent from "./SessionContent";
import Task from "./Task";

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

	async detail(controller) {
		let response;
		if (this.account.selectedUser.id === -1) {
			response = import(/* @vite-ignore */ guestDataPath.detailed_homeworks);
		} else {
			response = fetchHomeworksDay(this.ISODate, this.account.selectedUser.id, this.account.token.value, controller);
		}
		return response.then((response) => {
			this.account.token.set((old) => (response?.token || old));
			switch (response.code) {
				case 200:
					const { mappedTaskList, mappedSessionContentList } = mapHomeworksDay(response.data);
					if (this.account.selectedUser.id < 0) {
						mappedTaskList.forEach(mappedTask => {
							this.taskList.find((task) => task.id === mappedTask.id).detail(mappedTask);
						});
						mappedSessionContentList.forEach(mappedSessionContent => {
							this.sessionContentList.find((sessionContent) => sessionContent.id === mappedSessionContent.id).detail(mappedSessionContent);
						});
					} else {
						mappedTaskList.forEach(mappedTask => {
							this.taskList.find((task) => task.id === mappedTask.id).detail(mappedTask);
						});
						mappedSessionContentList.forEach(mappedSessionContent => {
							this.sessionContentList.find((sessionContent) => sessionContent.id === mappedSessionContent.id).detail(mappedSessionContent);
						});
					}
					this.detailed = true;
					return HomeworksCodes.SUCCESS;
				default:
					return { code: -1, message: response.message };
			}
		})
			.catch((error) => {
				if (error.type === "ED_ERROR") {
					switch (error.code) {
						case 520:
							loginStates.set(LoginStates.REQUIRE_LOGIN);
							return HomeworksCodes.INVALID_TOKEN;
						case 525:
							loginStates.set(LoginStates.REQUIRE_LOGIN);
							return HomeworksCodes.EXPIRED_TOKEN;
						default:
							return { code: -1, message: error.message };
					}
				}
				if (error.name !== "AbortError") {
					console.error(error);
					return { code: -1, message: error.message };
				}
			})
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