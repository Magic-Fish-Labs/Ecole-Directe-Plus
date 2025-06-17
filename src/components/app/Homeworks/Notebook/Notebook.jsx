import { useContext, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ContentLoader from "react-content-loader";
import { capitalizeFirstLetter, getISODate } from "../../../../utils/utils";

import { AppContext, SettingsContext, UserDataContext } from "../../../../App";
import Task from "./Task";
import SessionContent from "./SessionContent";
import { getZoomedBoudingClientRect } from "../../../../utils/zoom";
import DetailedTask from "./DetailedTask";
import DetailedSessionContent from "./DetailedSessionContent";
import { canScroll } from "../../../../utils/DOM";
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

    const navigate = useNavigate();

    const notebookContainerRef = useRef(null);
    const tasksContainersRefs = useRef([]);
    const isMouseOverTasksContainer = useRef(false);
    const isMouseIntoScrollableContainer = useRef(false);
    const anchorElement = useRef(null);
    const contentLoadersRandomValues = useRef({ days: Array.from({ length: Math.floor(Math.random() * 5) + 5 }, (_, i) => i), tasks: Array.from({ length: 10 }, (_, i) => Math.floor(Math.random() * 3) + 1) })
    const isNotebookGrab = useRef(false);
    const [hasMouseMoved, setHasMouseMoved] = useState(false);

    const hashParameters = location.hash.split(";")

    // function customScrollIntoView(element) {
    //     const container = notebookContainerRef.current;

    //     const elements = container.querySelectorAll(".notebook-day");

    //     // get the old selected element (because the behavior changes according to its position with the new selected element)
    //     let oldSelectedElementBounds;
    //     for (let element of elements) {
    //         const elementBounds = getZoomedBoudingClientRect(element.getBoundingClientRect());

    //         if (elementBounds.width > (document.fullscreenElement?.classList.contains("notebook-window") ? 400 : 300)) {
    //             oldSelectedElementBounds = elementBounds;
    //             break;
    //         }
    //     }
    //     if (!oldSelectedElementBounds) {
    //         return;
    //     }

    //     const bounds = getZoomedBoudingClientRect(element.getBoundingClientRect());
    //     const containerBounds = getZoomedBoudingClientRect(notebookContainerRef.current.getBoundingClientRect());
    //     const TASK_MAX_WIDTH = Math.min(document.fullscreenElement?.classList.contains("notebook-window") ? 800 : 600, containerBounds.width);
    //     notebookContainerRef.current.scrollTo(bounds.x - containerBounds.x + TASK_MAX_WIDTH / 2 * (oldSelectedElementBounds.x >= bounds.x) + notebookContainerRef.current.scrollLeft - containerBounds.width / 2, 0)
    // }

    // useEffect(() => {
    //     const verticalToHorizontalScrolling = (event) => {
    //         if (!isMouseIntoScrollableContainer.current.vertical) {
    //             if (event.deltaY !== 0 && !event.shiftKey) {
    //                 event.preventDefault();
    //                 if (event.deltaY !== 0) {
    //                     notebookContainerRef.current.style.scrollBehavior = "revert";
    //                     notebookContainerRef.current.scrollLeft += event.deltaY;
    //                     notebookContainerRef.current.style.scrollBehavior = "";
    //                     // const newDate = nearestHomeworkDate(1 - 2 * (event.deltaY < 0), activeHomeworkDate);
    //                     // if (!!newDate) {
    //                     //     navigateToDate(newDate)
    //                     // }
    //                 }
    //             }
    //         }
    //     }
    //     notebookContainerRef.current.addEventListener("wheel", verticalToHorizontalScrolling);

    //     return () => {
    //         if (notebookContainerRef.current) {
    //             notebookContainerRef.current.removeEventListener("wheel", verticalToHorizontalScrolling);
    //         }
    //     }
    // }, [activeHomeworkDate, homeworks, isMouseIntoScrollableContainer]);

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

    useEffect(() => {
        let timeoutId;
        const handleMouseDown = (event) => {
            if (event.button != 0 && event.buttons != 3) {
                return ;
            }
            isNotebookGrab.current = true;
            preventDraggingIssues();
            let movedDistance = 0;

            const mouseSpeed = {};

            const handleMouseMove = (event) => {
                const TRIGGER_SHIFT = 13;
                if (movedDistance > TRIGGER_SHIFT) {
                    setHasMouseMoved(true);
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                    }
                }
                mouseSpeed.x = -event.movementX;
                mouseSpeed.y = -event.movementY;
                notebookContainerRef.current.scrollBy({ left: mouseSpeed.x, top: mouseSpeed.y, behavior: "instant" });
                movedDistance += Math.sqrt((-event.movementX) ** 2 + (-event.movementY) ** 2);
            }

            document.addEventListener("mousemove", handleMouseMove);

            const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove);
                isNotebookGrab.current = false;
                const SCROLL_FRICTION = 0.95;
                const SCROLL_COEF = 1.05;
                function applyInertia() {
                    if (!isNotebookGrab.current && displayMode.value === "quality" && (mouseSpeed.x < -0.1 || mouseSpeed.x > 0.1) || (mouseSpeed.y < -0.1 && mouseSpeed.y > 0.1)) {
                        notebookContainerRef.current.scrollBy({ left: mouseSpeed.x * SCROLL_COEF, top: mouseSpeed.y * SCROLL_COEF, behavior: "instant" });
                        mouseSpeed.x *= SCROLL_FRICTION;
                        mouseSpeed.y *= SCROLL_FRICTION;
                        requestAnimationFrame(applyInertia);
                    }
                }
                requestAnimationFrame(applyInertia);
                unpreventDraggingIssues();
                document.removeEventListener("mouseup", handleMouseUp);
                timeoutId = setTimeout(() => {
                    setHasMouseMoved(false);
                }, 0);
            }

            document.addEventListener("mouseup", handleMouseUp);
        }

        notebookContainerRef.current.addEventListener("mousedown", handleMouseDown);

        return () => {
            if (notebookContainerRef.current) {
                notebookContainerRef.current.removeEventListener("mousedown", handleMouseDown);
            }
        }
    }, [notebookContainerRef.current]);

    useEffect(() => {
        tasksContainersRefs.current = [...tasksContainersRefs.current]; // met à jour les références

        const handleMouseEnter = (event) => {
            isMouseOverTasksContainer.current = true;
            isMouseIntoScrollableContainer.current = canScroll(event.target);
        }
        const handleMouseLeave = (event) => {
            isMouseOverTasksContainer.current = false;
            isMouseIntoScrollableContainer.current = canScroll(event.target);
        }

        for (let tasksContainer of tasksContainersRefs.current) {
            if (tasksContainer) {
                tasksContainer.addEventListener("mouseenter", handleMouseEnter);
                tasksContainer.addEventListener("mouseleave", handleMouseLeave);
            }
        }

        return () => {
            for (let tasksContainer of tasksContainersRefs.current) {
                if (tasksContainer) {
                    tasksContainer.removeEventListener("mouseenter", handleMouseEnter);
                    tasksContainer.removeEventListener("mouseleave", handleMouseLeave);
                }
            }
        }

    }, [isMouseOverTasksContainer, isMouseIntoScrollableContainer, tasksContainersRefs.current, activeHomeworkDate])

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
        <div className={`notebook-container ${hasMouseMoved ? "mouse-moved" : ""}`} ref={notebookContainerRef}>
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
                                    if (hasMouseMoved) return;
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
                                <div className="tasks-container" ref={(el) => (tasksContainersRefs.current[index] = el)}>
                                    {tasks.map((task, taskIndex) => {
                                        if (selected) {
                                            const result = [<DetailedTask key={"detailed-" + task.id} task={task} day={day} />];
                                            if (taskIndex < tasks.length - 1) {
                                                result.push(<hr key={`${task.id}-hr`} className="detailed-task-separator" />)
                                            }
                                            return result;
                                        }
                                        return <Task key={task.id} task={task} day={day} />;
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
                    : <p className="no-homework-placeholder">Vous n'avez aucun devoir à venir. Profitez de ce temps libre pour venir discuter sur le <a href="https://discord.gg/AKAqXfTgvE" target="_blank">serveur Discord d'Ecole Directe Plus</a> et contribuer au projet via le <a href="https://github.com/Magic-Fishes/Ecole-Directe-Plus" target="_blank">dépôt Github</a> !</p>
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
                        <div className="tasks-container" ref={(el) => (tasksContainersRefs.current[index] = el)}>
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