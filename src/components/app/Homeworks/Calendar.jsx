import { useState, useRef, useContext, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

import { UserDataContext } from '../../../App';

import DropDownArrow from "../../graphics/DropDownArrow";
import CalendarDay from './CalendarDay';

import './Calendar.css';

function generateCalendar(month) {
    const monthDate = new Date()
    monthDate.setMonth(month);

    const startDate = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 });
    const endDate = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });

    let currentDate = startDate;
    const dayList = [];

    while (currentDate <= endDate) {
        dayList.push(currentDate);
        currentDate = addDays(currentDate, 1);
    }
    return dayList;
};


export default function Calendar({ }) {
    const userData = useContext(UserDataContext);
    const {
        homeworks: { value: homeworks },
        activeHomeworkDate: { value: activeHomeworkDate }
    } = userData;

    const [calendarMonth, setCalendarMonth] = useState(new Date(activeHomeworkDate).getMonth());

    const calendarDays = useRef(generateCalendar(calendarMonth));

    const monthDate = new Date()
    monthDate.setMonth(calendarMonth);

    useEffect(() => {
        calendarDays.current = generateCalendar(calendarMonth);
    }, [calendarMonth]);

    function onClickToPreviousMonth() {
        setCalendarMonth(calendarMonth - 1);
    }

    function onClickToNextMonth() {
        setCalendarMonth(calendarMonth + 1);
    }

    return (
        <div className="calendar">
            <div className="month">
                <button onClick={onClickToPreviousMonth} className="arrow arrow-left" >
                    <DropDownArrow />
                </button>
                <time className="month-label" dateTime={monthDate.toISOString()}>{format(monthDate, 'MMMM yyyy', { locale: fr })}</time>
                <button onClick={onClickToNextMonth} className="arrow arrow-right" >
                    <DropDownArrow />
                </button>
            </div>
            <div className="weekdays">
                <span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
            </div>
            {homeworks
                ? <div className="days">
                    {calendarDays.current.map((date, i) => <CalendarDay key={i} date={date} calendarMonth={calendarMonth} />)}
                </div>
                : "content Loader"
            }
        </div>
    );
};