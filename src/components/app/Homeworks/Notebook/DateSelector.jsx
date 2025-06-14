import { getISODate } from "../../../../utils/utils";
import DropDownArrow from "../../../graphics/DropDownArrow";

import "./DateSelector.css"

export default function DateSelector({ homeworks, selectedDate, onChange, defaultDate, defaultDisplayDate,...props }) {
	/**
	 * Return the nearest date on which there is homeworks according to the given date
	 * @param direction Direction in time to check : 1 to move forward ; -1 to move backwards
	 */
	function nearestHomeworkDate(direction, date) {
		if (!homeworks) {
			return getISODate(new Date());
		}

		const dates = Object.keys(homeworks).filter(e => homeworks[e].length);
		if (!dates.includes(date)) {
			dates.push(date);
		}
		dates.sort();
		const newDateIdx = dates.indexOf(date) + direction;
		if (newDateIdx < 0) {
			const prevDate = new Date(date);
			prevDate.setDate(prevDate.getDate() - 1);
			return getISODate(prevDate);
		} else if (newDateIdx >= dates.length) {
			const nextDate = new Date(date);
			nextDate.setDate(nextDate.getDate() + 1);
			return getISODate(nextDate);
		}

		return dates[newDateIdx];
	}

	return <div className="date-selector" {...props}>
		<button type="button" className="change-date-arrow" onClick={() => onChange(nearestHomeworkDate(-1, selectedDate))} >
			<DropDownArrow />
		</button>
		<span className="selected-date" onClick={() => onChange(nearestHomeworkDate(1, getISODate(new Date())))}>
			<div>
				<time dateTime={selectedDate}>
					{(new Date(selectedDate)).toLocaleDateString("fr-FR") == "Invalid Date" ? "JJ/MM/AAAA" : (new Date(selectedDate)).toLocaleDateString("fr-FR")}
				</time>
				<time dateTime={defaultDate}>{defaultDisplayDate}</time>
			</div>
		</span>
		<button type="button" className="change-date-arrow" onClick={() => onChange(nearestHomeworkDate(1, selectedDate))} >
			<DropDownArrow />
		</button>
	</div>
}