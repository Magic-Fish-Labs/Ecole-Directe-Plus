import { da } from "date-fns/locale";
import { getToday } from "../utils/date";
import HomeworkDay from "./HomeworkDay";
import { isValidDateFormat } from "../../utils/date";

export default class Homeworks {
	constructor(account, homeworkDays) {
		this.account = account;
		this.days = homeworkDays;
	}

	getUpcomingAssignements() {
		const upcomingAssignements = [];

		for (const ISODate in this.days) {
			const homeworkDay = this.days[ISODate];
			for (const task of homeworkDay.getInterrogations()) {
				upcomingAssignements.push(task);
				if (upcomingAssignements.length === 3) {
					return upcomingAssignements;
				}
			}
		}
		return upcomingAssignements;
	}

	getDefaultActiveHomeworkDate() {
		const tomorrow = getToday();
		tomorrow.setDate(tomorrow.getDate() + 1);
		for (const ISODate in this.days) {
			if (new Date(ISODate < tomorrow))
				continue;
			const homeworkDay = this.days[ISODate];
			if (homeworkDay.taskList.length)
				return ISODate;
		}
		return null;
	}

	getDayByISODate(ISODate) {
		if (!isValidDateFormat(ISODate))
			throw new Error("invalid ISO date format.");
		if (!this.days.hasOwnProperty(ISODate))
			this.days[ISODate] = new HomeworkDay(this.account, new Date(ISODate));
		return this.days[ISODate];
	}

	get empty() {
		const homeworkDayList = Object.values(this.days);
		return !homeworkDayList.length || homeworkDayList.every((homeworkDay) => homeworkDay.empty)
	}

	static createFromRaw(account, homeworksData) {
		const homeworkDays = [];

		for (const ISODate in homeworksData) {
			const homeworkDay = HomeworkDay.createFromRaw(account, homeworksData[ISODate], ISODate);

			homeworkDays[ISODate] = homeworkDay;
		}

		return new Homeworks(account, homeworkDays);
	}
}
