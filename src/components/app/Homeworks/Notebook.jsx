import { useContext, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ContentLoader from "react-content-loader";
import { capitalizeFirstLetter, getISODate } from "../../../utils/utils";

import { AppContext } from "../../../App";
import Task from "./Task";
import SessionContent from "./SessionContent";
import DropDownArrow from "../../graphics/DropDownArrow";
import { applyZoom, getZoomedBoudingClientRect } from "../../../utils/zoom";
import DetailedTask from "./DetailedTask";
import DetailedSessionContent from "./DetailedSessionContent";
import { canScroll } from "../../../utils/DOM";

import { currentPeriodEvent } from "../../generic/events/setPeriodEvent";

import "./Notebook.css";
export default function Notebook({ hideDateController = false }) {
    const { isLoggedIn, actualDisplayTheme, useUserData, useUserSettings, fetchHomeworks, isTabletLayout } = useContext(AppContext);
    const settings = useUserSettings();
    const userHomeworks = useUserData("sortedHomeworks");
    const location = useLocation();
    const navigate = useNavigate();

    const isPartyModeEnabled = settings.get("isPartyModeEnabled");
    const isPeriodEventEnabled = settings.get("isPeriodEventEnabled");

    const notebookContainerRef = useRef(null);
    const tasksContainersRefs = useRef([]);
    const isMouseOverTasksContainer = useRef(false);
    const isMouseIntoScrollableContainer = useRef(false);
    const anchorElement = useRef(null);
    const contentLoadersRandomValues = useRef({ days: Array.from({ length: Math.floor(Math.random() * 5) + 5 }, (_, i) => i), tasks: Array.from({ length: 10 }, (_, i) => Math.floor(Math.random() * 3) + 1) })
    const isNotebookGrab = useRef(false);
    // const hasMouseMoved = useRef(false);
    const [hasMouseMoved, setHasMouseMoved] = useState(false);

    const homeworks = userHomeworks.get();
    const hashParameters = location.hash.split(";")
    const selectedDate = hashParameters[0].slice(1)

    /*function calcStrokeColorColorProgression(progression) {
        const startColor = [255, 66, 66];
        const endColor = [0, 255, 56];
        // I have absolutely no idea of why but with the condition under it makes orange when progresion is on the middle
        // (this what I wanted but I though that it would need another intermediate color)
        // so for no reason this works and I will not change it (it's only luck)
        return `rgb(${progression >= 0.5 ? (endColor[0] * ((progression - 0.5) * 2) + startColor[0] * (1 - ((progression - 0.5) * 2))) : (endColor[0] * progression + startColor[0] * (1 - progression))}, ${endColor[1] * progression + startColor[1] * (1 - progression)}, ${endColor[2] * progression + startColor[2] * (1 - progression)})`;
    }*/


    function validDateFormat(dateString) {
        const date = dateString.split("-");
        if (date.length !== 3) {
            return false;
        }
        for (let str of date) {
            if (isNaN(parseInt(str))) {
                return false;
            }
        }
        if (date[1].length !== 2 || date[2].length !== 2) {
            return false;
        }

        return true;
    }

    function navigateToDate(newDate, cleanup = false) {
        navigate(`#${newDate};${(cleanup && hashParameters[1]) || ""}${hashParameters.length === 3 ? ";" + hashParameters[2] : ""}`, { replace: true });
    }

    function nearestHomeworkDate(dir = 1, date) {
        /**
         * Return the nearest date on which there is homeworks according to the given date
         * @param dir Direction in time to check : 1 to move forward ; -1 to move backwards
         */
        if (!homeworks) {
            return getISODate(new Date());
        }

        const dates = Object.keys(homeworks).filter(e => homeworks[e].length);
        if (!dates.includes(date)) {
            dates.push(date);
        }
        dates.sort();
        const newDateIdx = dates.indexOf(date) + dir;
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

    function customScrollIntoView(element) {
        const container = notebookContainerRef.current;

        const elements = container.querySelectorAll(".notebook-day");

        // get the old selected element (because the behavior changes according to its position with the new selected element)
        let oldSelectedElementBounds;
        for (let element of elements) {
            const elementBounds = getZoomedBoudingClientRect(element.getBoundingClientRect());

            if (elementBounds.width > (document.fullscreenElement?.classList.contains("notebook-window") ? 400 : 300)) {
                oldSelectedElementBounds = elementBounds;
                break;
            }
        }
        if (!oldSelectedElementBounds) {
            return;
        }

        const bounds = getZoomedBoudingClientRect(element.getBoundingClientRect());
        const containerBounds = getZoomedBoudingClientRect(notebookContainerRef.current.getBoundingClientRect());
        const TASK_MAX_WIDTH = Math.min(document.fullscreenElement?.classList.contains("notebook-window") ? 800 : 600, containerBounds.width);
        notebookContainerRef.current.scrollTo(bounds.x - containerBounds.x + TASK_MAX_WIDTH / 2 * (oldSelectedElementBounds.x >= bounds.x) + notebookContainerRef.current.scrollLeft - containerBounds.width / 2, 0)
    }

    useEffect(() => {
        if (["#patch-notes", "#policy", "#feedback"].includes(location.hash)) {
            return;
        }
        if (validDateFormat(selectedDate)) {
            const element = anchorElement.current;
            if (element !== null) {
                // element.scrollIntoView({ inline: "center" });
                customScrollIntoView(element);
            }
        } else {
            if (homeworks) {
                // navigateToDate(getISODate(new Date()));
                navigateToDate(nearestHomeworkDate(1, getISODate(new Date())))
            }
        }
    }, [location, homeworks, anchorElement.current]);

    useEffect(() => {
        const verticalToHorizontalScrolling = (event) => {
            if (!isMouseIntoScrollableContainer.current.vertical) {
                if (event.deltaY !== 0 && !event.shiftKey) {
                    event.preventDefault();
                    if (event.deltaY !== 0) {
                        notebookContainerRef.current.style.scrollBehavior = "revert";
                        notebookContainerRef.current.scrollLeft += event.deltaY;
                        notebookContainerRef.current.style.scrollBehavior = "";
                        // const newDate = nearestHomeworkDate(1 - 2 * (event.deltaY < 0), selectedDate);
                        // if (!!newDate) {
                        //     navigateToDate(newDate)
                        // }
                    }
                }
            }
        }
        notebookContainerRef.current.addEventListener("wheel", verticalToHorizontalScrolling);

        return () => {
            if (notebookContainerRef.current) {
                notebookContainerRef.current.removeEventListener("wheel", verticalToHorizontalScrolling);
            }
        }
    }, [selectedDate, homeworks, isMouseIntoScrollableContainer]);

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
        const handleMouseDown = () => {
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
                        if (!isNotebookGrab.current && settings.get("displayMode") === "quality" && (mouseSpeed.x < -0.1 || mouseSpeed.x > 0.1) || (mouseSpeed.y < -0.1 && mouseSpeed.y > 0.1)) {
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
        const script = document.createElement("script");

        script.src = "https://cdn.jsdelivr.net/npm/@tsparticles/confetti@3.0.3/tsparticles.confetti.bundle.min.js";
        script.async = true;

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        }
    }, []);

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

        for (let tasksContainerRef of tasksContainersRefs.current) {
            if (tasksContainerRef) {
                tasksContainerRef.addEventListener("mouseenter", handleMouseEnter);
                tasksContainerRef.addEventListener("mouseleave", handleMouseLeave);
            }
        }

        return () => {
            for (let tasksContainerRef of tasksContainersRefs.current) {
                if (tasksContainerRef) {
                    tasksContainerRef.removeEventListener("mouseenter", handleMouseEnter);
                    tasksContainerRef.removeEventListener("mouseleave", handleMouseLeave);
                }
            }
        }

    }, [isMouseOverTasksContainer, isMouseIntoScrollableContainer, tasksContainersRefs.current, selectedDate])

    useEffect(() => {
        const controller = new AbortController();
        if ((homeworks // SI l'objet des devoirs existe MAIS
            && (homeworks[selectedDate] === undefined // que les devoirs de la date selectionnée ne sont pas fetch OU
                || (homeworks[selectedDate].length // que les devoir d'aujourd'hui aient été fetch mais qu'ils ne soient pas vides MAIS
                    && (!homeworks[selectedDate][0].content && !homeworks[selectedDate][0].sessionContent)))) // que ni le contenu ni le contenu de séance n'ait été fetch
            && isLoggedIn) {
            fetchHomeworks(controller, selectedDate)
        }

        return () => {
            controller.abort();
        }
    }, [location.hash, homeworks, isLoggedIn]);

    return <>
        {!hideDateController && (!homeworks || Object.keys(homeworks).length > 0)
            ? <div className="date-selector">
                <span className="change-date-arrow" onClick={() => navigateToDate(nearestHomeworkDate(-1, selectedDate))} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { navigateToDate(nearestHomeworkDate(-1, selectedDate)) } }} >
                    <DropDownArrow />
                </span>
                <span className="selected-date" onClick={() => {navigate(`#${nearestHomeworkDate(1, getISODate(new Date()))}`, { replace: true })}}>
                    <div>
                        <time dateTime={selectedDate || null}>{(new Date(selectedDate)).toLocaleDateString("fr-FR") == "Invalid Date" ? "JJ/MM/AAAA" : (new Date(selectedDate)).toLocaleDateString("fr-FR")}</time>
                        <time dateTime={getISODate(new Date())}>Aujourd'hui</time>
                    </div>
                </span>
                <span className="change-date-arrow" onClick={() => navigateToDate(nearestHomeworkDate(1, selectedDate))} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { navigateToDate(nearestHomeworkDate(1, selectedDate)) } }} >
                    <DropDownArrow />
                </span>
            </div>
            : null
        }
        <div className={`notebook-container ${hasMouseMoved ? "mouse-moved" : ""}`} ref={notebookContainerRef}>
            {homeworks
                ? Object.keys(homeworks).length > 0/* && Object.values(homeworks).some(arr => arr.some(task => task.content))*/
                    ? Object.keys(homeworks).sort().map((el, index) => {
                        const tasks = homeworks[el].filter(element => element.type === "task");
                        const sessionContents = homeworks[el].filter(element => element.type === "sessionContent");

                        const progression = tasks.filter((task) => task.isDone).length / tasks.length;
                        const elDate = new Date(el);
                        return (homeworks[el].length
                            ? <div className={`notebook-day ${selectedDate === el ? "selected" : ""}`} style={{ "--day-progression": `${progression * 100}%` }} onClick={() => !hasMouseMoved && navigate(`#${el};${(selectedDate === el ? hashParameters[1] : homeworks[el].find((item) => item.type === "task")?.id ?? homeworks[el][0].id)}${hashParameters.length === 3 ? ";" + hashParameters[2] : ""}`, { replace: true })} key={el} id={el} ref={selectedDate === el ? anchorElement : null}>
                                <div className={`notebook-day-header ${isPartyModeEnabled && isPeriodEventEnabled && currentPeriodEvent === "halloween" && "halloween-window-header-sec"}`} style={{ "--after-opacity": (progression === 1 ? 1 : 0) }}>
                                    <span className="notebook-day-date">
                                        <time dateTime={elDate.toISOString()}>{capitalizeFirstLetter(elDate.toLocaleDateString("fr-FR", { weekday: "long", month: "long", day: "numeric" }))}</time>
                                    </span>
                                </div>
                                <hr />
                                {/* <hr style={{ width: `${progression * 100}%`}} /> */}
                                <div className={`tasks-container ${isPartyModeEnabled && isPeriodEventEnabled && currentPeriodEvent === "halloween" && "halloween-window-sec"}`} ref={(el) => (tasksContainersRefs.current[index] = el)}>
                                    {tasks.map((task, taskIndex) => {
                                        const result = [
                                            selectedDate === el
                                                ? <DetailedTask key={"detailed-" + task.id} task={task} userHomeworks={userHomeworks} day={el} />
                                                : <Task key={task.id} day={el} task={task} userHomeworks={userHomeworks} />]
                                        if (selectedDate === el && taskIndex < tasks.length - 1) {
                                            result.push(<hr key={toString(task.id) + "-hr"} className="detailed-task-separator" />)
                                        }
                                        return result.flat()
                                    })}
                                    {sessionContents.length !== 0 && (selectedDate === el
                                        ? <div className="detailed-section-separator"><hr /><span>Contenus de Séances</span><hr /></div>
                                        : <hr className="section-separator" />)
                                    }
                                    {sessionContents.map((sessionContent, sessionContentIndex) => {
                                        const result = [
                                            selectedDate === el
                                                ? <DetailedSessionContent key={"detailed-" + sessionContent.id} sessionContent={sessionContent} userHomeworks={userHomeworks} sessionContentIndex={sessionContentIndex} day={el} />
                                                : <SessionContent key={sessionContent.id} day={el} sessionContent={sessionContent} sessionContentIndex={sessionContentIndex} userHomeworks={userHomeworks} />]
                                        if (selectedDate === el && sessionContentIndex < sessionContents.length - 1) {
                                            result.push(<hr key={toString(sessionContent.id) + "-hr"} className="detailed-task-separator" />)
                                        }
                                        return result.flat()
                                    })}
                                </div>
                            </div>
                            : null)
                    }).filter(e => e)
                    : <p className="no-homework-placeholder">Vous n'avez aucun devoir à venir. Profitez de ce temps libre pour venir discuter sur le <a href="https://discord.gg/AKAqXfTgvE" target="_blank">serveur Discord d'Ecole Directe Plus</a> et contribuer au projet via le <a href="https://github.com/Magic-Fishes/Ecole-Directe-Plus" target="_blank">dépôt Github</a> !</p>
                : contentLoadersRandomValues.current.days.map((el, index) => {
                    return <div className={`notebook-day ${index === 0 ? "selected" : ""}`} key={index} ref={selectedDate === el ? anchorElement : null}>
                        <div className="notebook-day-header">
                            <span className="notebook-day-date">
                                <ContentLoader
                                    animate={settings.get("displayMode") === "quality"}
                                    speed={1}
                                    backgroundColor={actualDisplayTheme === "dark" ? "#9E9CCC" : "#676997"}
                                    foregroundColor={actualDisplayTheme === "dark" ? "#807FAD" : "#8F90C1"}
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
                                    ? Array.from({ length: contentLoadersRandomValues.current.tasks[el] }).map((el, i) => <DetailedTask key={"detailed-" + i} task={{}} userHomeworks={userHomeworks} day={el} />)
                                    : Array.from({ length: contentLoadersRandomValues.current.tasks[el] }).map((el, i) => <Task key={i} day={el} task={{}} userHomeworks={userHomeworks} />)
                            }
                        </div>
                    </div>
                })}
        </div>
    </>
}