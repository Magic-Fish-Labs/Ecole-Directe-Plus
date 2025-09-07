import { format } from "date-fns";
import classBuilder from "../../../utils/classBuilder";

/*
COLORS :
#48d948 all done
#d94848 interrogation
#4b48d9 homework to do
#8989c0 no homework
#525273 not this month
*/

export default function CalendarDay({ date }) {
	const ISODate = format(date, "yyyy-MM-dd");

	return <span className={classBuilder("calendar-day", {
		"different-month": true,
		"selected": true,
		"today": false
	})}>
		{date.getDay()}
	</span>
}