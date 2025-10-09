import { format } from "date-fns";
import classBuilder from "../../../utils/classBuilder";
import { UserDataContext } from "../../../App";
import { useContext } from "react";

const DayColorsClass = {
    COMPLETED: "completed",         // #48d948 all done
    INTERROGATION: "interrogation", // #d94848 interrogation
    TODO: "todo",                   // #4b48d9 homework to do
    EMPTY: "empty",                 // #8989c0 no homework
    INACTIVE: "inactive"            // #525273 not this month
}

function getDayColorClass(day, calendarMonth) {
    if (day.date.getMonth() != calendarMonth)
        return DayColorsClass.INACTIVE;
    if (day.taskList.length == 0)
        return DayColorsClass.EMPTY;
    if (day.taskList.every((task) => task.isDone))
        return DayColorsClass.COMPLETED;
    if (day.taskList.some((task) => task.isInterrogation))
        return DayColorsClass.INTERROGATION;
    return DayColorsClass.TODO;
}

export default function CalendarDay({ date, calendarMonth }) {
    const userData = useContext(UserDataContext);
    const {
        homeworks: { value: homeworks },
        activeHomeworkDate: { value: activeHomeworkDate, set: setActiveHomeworkDate },
        activeHomeworkId: { value: activeHomeworkId, set: setActiveHomeworkId },
    } = userData;

    const ISODate = format(date, "yyyy-MM-dd");

    return <span className={classBuilder(`calendar-day ${getDayColorClass(homeworks.getDayByDate(ISODate), calendarMonth)}`, {
        "selected": activeHomeworkDate === ISODate,
        "today": format(new Date(), "yyyy-MM-dd") === ISODate,
    })} onClick={() => { setActiveHomeworkDate(ISODate) }}>
        {date.getDate()}
    </span>
}