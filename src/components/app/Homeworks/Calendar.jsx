import React, { useState, useEffect, useRef } from 'react';
import { useContext } from "react";
import { AppContext } from "../../../App";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, addDays } from 'date-fns';
import { useLocation, useNavigate, Link } from "react-router-dom";
import { fr } from 'date-fns/locale';
import DropDownArrow from "../../graphics/DropDownArrow";

import './Calendar.css';
import { isValidDateFormat } from '../../../utils/date';

export default function Calendar({ onDateClick, homeworks }) {
    const today = new Date()
    const location = useLocation();
    const [calendarDays, setCalendarDays] = useState([]);
    const [longPressTimeout, setLongPressTimeout] = useState(null);

    const progressBarRef = useRef(null);
    const oldSelectedDate = useRef(null);

    const navigate = useNavigate();
    const hashParameters = location.hash.split(";");
    const selectedISODate = isValidDateFormat(hashParameters[0].slice(1)) ? hashParameters[0].slice(1) : Date.now();
    const selectedDate = new Date(selectedISODate);

    // For each homework, check the date and add it to the events array if it is a test set redf
    const events = [];

    for (const date in homeworks) {
        for (const task of homeworks[date]) {
            // console.log("task.type:", task.type);
            if (task.type === "sessionContent") continue;
            if (task.isDone) {
                events.push({ date, color: '#48d948' });
            } else if (task.isInterrogation) {
                events.push({ date, color: '#d94848' });
            } else {
                events.push({ date, color: '#4b48d9' });
            }
        }
    }

    
    function generateCalendar() {
        const startDate = startOfWeek(startOfMonth(selectedDate), { weekStartsOn: 1 });
        const endDate = endOfWeek(endOfMonth(selectedDate), { weekStartsOn: 1 });

        let date = startDate;
        const days = [];

        while (date <= endDate) {
            days.push(date);
            date = addDays(date, 1);
        }
        setCalendarDays(days);
    };

    useEffect(() => {
        if (!oldSelectedDate.current || oldSelectedDate.current.getMonth() !== selectedDate.getMonth() || oldSelectedDate.current.getFullYear() !== selectedDate.getFullYear()) {
            generateCalendar();
            oldSelectedDate.current = selectedDate;
        }
    }, [location.hash]);

    const handleDayClick = (day, event) => {
        navigate(`#${format(day, 'yyyy-MM-dd')};${hashParameters.slice(1).join(";")}`, { replace: true });
        if (onDateClick) onDateClick(day); // Call the callback with the selected date
        if (event.shiftKey) fetchAllHomeworks(day);
    };

    const handleTouchStart = (day) => {
        const timeout = setTimeout(() => {
            fetchAllHomeworks(day);
        }, 800); // 800ms long press threshold
        setLongPressTimeout(timeout);
    };

    const handleTouchEnd = () => {
        clearTimeout(longPressTimeout);
    };

    const getDayClass = (day) => {
        // const dayStr = format(day, 'yyyy-MM-dd');
        const isDifferentMonth = format(day, 'MM') !== format(selectedDate, 'MM');
        const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
        const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
        // const highlight = events.find(event => event.date === dayStr)?.color;

        let className = 'day';
        if (isDifferentMonth) className += ' grey';
        if (isSelected) className += ' selected';
        if (isToday) className += ' today';
        // if (highlight) className += ` ${highlight}`;

        return className;
    };

    const getDayStyle = (day) => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const eventsfiltered = events.filter(event => event.date === dayStr);
        const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

        if (eventsfiltered.length > 0) {
            //if all the events in the day have the color green, we want to set the color to green
            if (eventsfiltered.every(events => events.color === '#48d948')) {
                return { backgroundColor: '#48d948' };
            }
            //if one event in the day has the color d94848, we want to set the color to red and ignore the other color
            else if (eventsfiltered.find(events => events.color === '#d94848')) {
                return { backgroundColor: '#d94848' };
            }
            else {
                // Get the color of the first event by 
                return { backgroundColor: '#4b48d9' };
            }
        } else if (isToday) {
            //if this is a grey day, we want to keep the grey color
            if (day.getMonth() !== selectedDate.getMonth()) {
                return { backgroundColor: '#525273' };
            } else {
                return { backgroundColor: '#8989c0' }; // Special color for today
            }
        }

        return {};
    };

    async function fetchAllHomeworks(day) {
        // Set the button to loading by changing the class
        // Set display to block for the progress bar
        day = new Date(day)
        progressBarRef.current.style.display = "block";
        var progressPercentage = 0.0;
        const controller = new AbortController();
        let currentDate = new Date(day);

        while (currentDate <= today) {
            await fetchHomeworksSequentially(controller, currentDate);
            // Set the progress bar to the percentage of completion (a value between 0.0 and 1.0)
            // the date should be all taken at midnight
            const midnightCurrentDate = new Date(currentDate.setHours(0, 0, 0, 0));
            const midnightDate = new Date(day).setHours(0, 0, 0, 0);
            const midnightToday = new Date().setHours(0, 0, 0, 0);

            progressPercentage = (midnightDate - midnightCurrentDate) > 0 ? 0 : (midnightCurrentDate - midnightDate) / (midnightToday - midnightDate);
            progressBarRef.current.value = progressPercentage;
            // Go to the date on the clendar
            currentDate = addDays(currentDate, 1);
        }
        // When all the homeworks are fetchInitiated, remove the loading class

        setTimeout(() => {
            // Hide the progress bar
            progressBarRef.current.style.display = "none";
        }, 500);
    }

    return (
        <div className="calendar">
            <div className="month">
                <Link to={`#${format(addMonths(new Date(selectedISODate), -1), 'yyyy-MM-dd')};${hashParameters.slice(1).join(";")}`} className="arrow arrow-left" replace={true}>
                    <DropDownArrow />
                </Link>
                <time  className="month-label" dateTime={format(selectedDate, 'yyyy-MM-dd', { locale: fr })}>{format(selectedDate, 'MMMM yyyy', { locale: fr })}</time>
                <Link to={`#${format(addMonths(new Date(selectedISODate), 1), 'yyyy-MM-dd')};${hashParameters.slice(1).join(";")}`} className="arrow arrow-right" replace={true}>
                    <DropDownArrow />
                </Link>
            </div>
            <div className="weekdays">
                <span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
            </div>
            <div className="days">
                {calendarDays.map((day, index) => (
                    <span
                        key={index}
                        className={getDayClass(day)}
                        style={getDayStyle(day)}
                        onClick={(event) => handleDayClick(day, event)}
                        onTouchStart={() => handleTouchStart(day)}
                        onTouchEnd={handleTouchEnd}
                    >
                        {day.getDate()}
                    </span>
                ))}
            </div>
            <progress ref={progressBarRef} className="progress-bar" value={0} />
        </div>
    );
};