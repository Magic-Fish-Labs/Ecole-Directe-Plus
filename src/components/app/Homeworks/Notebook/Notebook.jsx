import { useContext, useEffect, useRef } from "react";
import ContentLoader from "react-content-loader";
import { capitalizeFirstLetter, getISODate } from "../../../../utils/utils";

import { AppContext, SettingsContext, UserDataContext } from "../../../../App";
import Task from "./Task";
import SessionContent from "./SessionContent";
import DetailedTask from "./DetailedTask";
import DetailedSessionContent from "./DetailedSessionContent";
import DateSelector from "./DateSelector";

import "./Notebook.css";
export default function Notebook({ hideDateController = false }) {
    const { isLoggedIn, usedDisplayTheme } = useContext(AppContext);

    const userData = useContext(UserDataContext);
    const {
        homeworks: { value: homeworks },
        activeHomeworkDate: { value: activeHomeworkDate, set: setActiveHomeworkDate },
        activeHomeworkId: { value: activeHomeworkId, set: setActiveHomeworkId },
    } = userData;

    const settings = useContext(SettingsContext);
    const { displayMode } = settings.user;

    const notebookContainerRef = useRef(null);
    const contentLoadersRandomValues = useRef({ days: Array.from({ length: Math.floor(Math.random() * 5) + 5 }, (_, i) => i), tasks: Array.from({ length: 10 }, (_, i) => Math.floor(Math.random() * 3) + 1) })
    const isNotebookMouseDown = useRef(false);
    const isNotebookGrabed = useRef(false);
    const notebookMovement = useRef({
        distance: 0,
        speed: {
            x: 0,
            y: 0
        }
    });

    // - - Drag to scroll - -

    function preventDraggingIssues() {
        document.body.style.overflow = "hidden";
        document.body.style.userSelect = "none";
        document.body.style.webkitUserSelect = "none";
        document.body.style.overscrollBehavior = "contain";
        notebookContainerRef.current.style.scrollSnapType = "none";
    }

    function unpreventDraggingIssues() {
        document.body.style.overflow = "";
        document.body.style.userSelect = "";
        document.body.style.webkitUserSelect = "";
        document.body.style.overscrollBehavior = "";
        notebookContainerRef.current.style.scrollSnapType = "";
        if (window.getSelection) {
            var selection = window.getSelection();
            selection.removeAllRanges();
        }
    }

    function handleMouseMove(event) {
        const TRIGGER_SHIFT = 13;
        if (notebookMovement.current.distance > TRIGGER_SHIFT && !isNotebookGrabed.current) {
            isNotebookGrabed.current = true;
        }
        const mouseSpeed = notebookMovement.current.speed;
        mouseSpeed.x = -event.movementX;
        mouseSpeed.y = -event.movementY;
        notebookContainerRef.current.scrollBy({ left: mouseSpeed.x, top: mouseSpeed.y, behavior: "instant" });
        notebookMovement.current.distance += Math.sqrt((-event.movementX) ** 2 + (-event.movementY) ** 2);
    }

    function handleMouseUp() {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        isNotebookMouseDown.current = false;

        const SCROLL_FRICTION = 0.99;
        const SCROLL_COEF = 1.20;
        let dragSpeed = notebookMovement.current.speed.x;
        let bufferedMovement = 0;
        function applyInertia() {
            if (!isNotebookMouseDown.current && displayMode.value === "quality" && Math.abs(dragSpeed) > 0.1) {
                bufferedMovement += dragSpeed * SCROLL_COEF;
                if (Math.abs(bufferedMovement) >= 1) {
                    notebookContainerRef.current.scrollBy({ left: bufferedMovement * SCROLL_COEF, behavior: "instant" });
                    bufferedMovement -= Math.round(bufferedMovement);
                }
                dragSpeed *= SCROLL_FRICTION;
                requestAnimationFrame(applyInertia);
            }
        }
        requestAnimationFrame(applyInertia);
        unpreventDraggingIssues();
    }

    function handleMouseDown(event) {
        if (event.button != 0 && event.buttons != 3) {
            return ;
        }
        // That one is tricky, actually, if you set it to false in handleMouseUp function, the click event will be dispatched after mouseup is handled, so after isNotebookGrabed.current is set to false.
        isNotebookGrabed.current = false;
        isNotebookMouseDown.current = true;
        notebookMovement.current.distance = 0;
        notebookMovement.current.speed.x = 0;
        notebookMovement.current.speed.y = 0;
        preventDraggingIssues();

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    }

    useEffect(() => {
        const controller = new AbortController();
        if ((homeworks !== undefined // SI l'objet des devoirs existe
            && (activeHomeworkDate !== null // MAIS qu'une date est choisie
                && (homeworks[activeHomeworkDate] === undefined // ET que les devoirs de cette date selectionnée ne sont pas fetch
                    || (homeworks[activeHomeworkDate].length // OU que les devoir d'aujourd'hui ont été fetch mais qu'ils ne sont pas vides
                        && !(homeworks[activeHomeworkDate][0].content || homeworks[activeHomeworkDate][0].sessionContent))))) // MAIS que le contenu OU le contenu de séance n'a pas été fetch
            && isLoggedIn) {
            userData.get.homeworks(activeHomeworkDate, controller);
        }

        return () => {
            controller.abort();
        }
    }, [activeHomeworkDate, homeworks, isLoggedIn]);

    return <>
        {(!hideDateController && (!homeworks || Object.keys(homeworks).length > 0))
            ? <DateSelector homeworks={homeworks} onChange={setActiveHomeworkDate} selectedDate={activeHomeworkDate} defaultDate={getISODate(new Date())} defaultDisplayDate={"À venir"} />
            : null
        }
        <div className="notebook-container" ref={notebookContainerRef} onMouseDown={handleMouseDown}>
            {homeworks
                ? Object.keys(homeworks).length > 0/* && Object.values(homeworks).some(arr => arr.some(task => task.content))*/
                    ? Object.keys(homeworks).sort().map((day, index) => {
                        const tasks = homeworks[day].filter(element => element.type === "task");
                        const sessionContents = homeworks[day].filter(element => element.type === "sessionContent");
                        const progression = tasks.filter((task) => task.isDone).length / tasks.length;
                        const dayDate = new Date(day);
                        const selected = activeHomeworkDate === day;
                        return (homeworks[day].length
                            ? <div
                                key={day}
                                id={day}
                                onClick={() => {
                                    if (isNotebookGrabed.current) return;
                                    if (day !== activeHomeworkDate)
                                        setActiveHomeworkDate(day);
                                    if (!activeHomeworkId)
                                        setActiveHomeworkId(tasks[0].id);
                                }}
                                className={`notebook-day${selected ? " selected" : ""}`}
                                style={{ "--day-progression": `${progression * 100}%` }}
                            >
                                <div className="notebook-day-header" style={{ "--after-opacity": (progression === 1 ? 1 : 0) }}>
                                    <span className="notebook-day-date">
                                        <time dateTime={dayDate.toISOString()}>
                                            {capitalizeFirstLetter(dayDate.toLocaleDateString("fr-FR", { weekday: "long", month: "long", day: "numeric" }))}
                                        </time>
                                    </span>
                                </div>
                                <hr />
                                {/* <hr style={{ width: `${progression * 100}%`}} /> */}
                                <div className="tasks-container" >
                                    {tasks.map((task, taskIndex) => {
                                        if (selected) {
                                            const result = [<DetailedTask key={"detailed-" + task.id} task={task} day={day} />];
                                            if (taskIndex < tasks.length - 1) {
                                                result.push(<hr key={`${task.id}-hr`} className="detailed-task-separator" />)
                                            }
                                            return result;
                                        }
                                        return <Task key={task.id} task={task} isNotebookGrabed={isNotebookGrabed} />;
                                    })}
                                    {sessionContents.length !== 0 && (selected
                                        ? <div className="detailed-section-separator"><hr /><span>Contenus de Séances</span><hr /></div>
                                        : <hr className="section-separator" />)
                                    }
                                    {sessionContents.map((sessionContent, sessionContentIndex) => {
                                        if (selected) {
                                            result = [<DetailedSessionContent key={"detailed-" + sessionContent.id} day={day} sessionContent={sessionContent} sessionContentIndex={sessionContentIndex} />];
                                            if (sessionContentIndex < sessionContents.length - 1) {
                                                result.push(<hr key={`${sessionContent.id}-hr`} className="detailed-task-separator" />)
                                            }
                                            return result;
                                        }
                                        return <SessionContent key={sessionContent.id} day={day} sessionContent={sessionContent} sessionContentIndex={sessionContentIndex} />
                                    })}
                                </div>
                            </div>
                            : null)
                    }).filter(e => e)
                    : <p className="no-homework-placeholder">Vous n'avez aucun devoir à venir. Profitez de ce temps libre pour venir discuter sur le <a href="https://discord.gg/AKAqXfTgvE" target="_blank">serveur Discord d'Ecole Directe Plus</a> et contribuer au projet via le <a href="https://github.com/Magic-Fish-Lab/Ecole-Directe-Plus" target="_blank">dépôt Github</a> !</p>
                : contentLoadersRandomValues.current.days.map((el, index) => {
                    return <div className={`notebook-day ${index === 0 ? "selected" : ""}`} key={index} >
                        <div className="notebook-day-header">
                            <span className="notebook-day-date">
                                <ContentLoader
                                    animate={displayMode.value === "quality"}
                                    speed={1}
                                    backgroundColor={usedDisplayTheme === "dark" ? "#9E9CCC" : "#676997"}
                                    foregroundColor={usedDisplayTheme === "dark" ? "#807FAD" : "#8F90C1"}
                                    style={{ width: `${130}px`, maxHeight: "25px" }}
                                >
                                    <rect x="0" y="0" rx="10" ry="10" style={{ width: "100%", height: "100%" }} />
                                </ContentLoader>
                            </span>
                        </div>
                        <hr />
                        <div className="tasks-container" >
                            {
                                index === 0
                                    ? Array.from({ length: contentLoadersRandomValues.current.tasks[el] }).map((el, i) => <DetailedTask key={"detailed-" + i} task={{}} day={el} />)
                                    : Array.from({ length: contentLoadersRandomValues.current.tasks[el] }).map((el, i) => <Task key={i} task={{}} day={el} />)
                            }
                        </div>
                    </div>
                })}
        </div>
    </>
}