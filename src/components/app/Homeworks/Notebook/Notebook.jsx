import { useContext, useRef } from "react";
import ContentLoader from "react-content-loader";

import { AppContext, SettingsContext, UserDataContext } from "../../../../App";
import Task from "./Task";
import DetailedTask from "./DetailedTask";
import DateSelector from "./DateSelector";
import NotebookDay from "./NotebookDay";
import { getISODate } from "../../../../utils/utils";

import "./Notebook.css";
export default function Notebook({ hideDateController = false }) {
    const { isLoggedIn, usedDisplayTheme } = useContext(AppContext);

    const userData = useContext(UserDataContext);
    const {
        homeworks: { value: homeworks, get: getHomeworks },
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
        speed: 0
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
        const TRIGGER_SHIFT = 5;
        if (notebookMovement.current.distance > TRIGGER_SHIFT && !isNotebookGrabed.current) {
            isNotebookGrabed.current = true;
        }
        const mouseMovement = notebookMovement.current;
        mouseMovement.speed = -event.movementX;
        notebookContainerRef.current.scrollBy({ left: mouseMovement.speed, behavior: "instant" });
        notebookMovement.current.distance += Math.abs(mouseMovement.speed);
    }

    function handleMouseUp() {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        if (!isNotebookGrabed.current) return;
        isNotebookMouseDown.current = false;

        const SCROLL_FRICTION = 0.99;
        const SCROLL_COEF = 1.15;
        let dragSpeed = notebookMovement.current.speed;
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
            return;
        }
        // That one is tricky, actually, if you set it to false in handleMouseUp function, the click event will be dispatched after mouseup is handled, so after isNotebookGrabed.current is set to false.
        isNotebookGrabed.current = false;
        isNotebookMouseDown.current = true;
        notebookMovement.current.distance = 0;
        notebookMovement.current.speed = 0;
        preventDraggingIssues();

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    }

    return <>
        {(!hideDateController && (!homeworks || Object.keys(homeworks).length > 0))
            ? <DateSelector homeworks={homeworks} onChange={setActiveHomeworkDate} selectedDate={activeHomeworkDate} defaultDate={getISODate(new Date())} defaultDisplayDate={"À venir"} />
            : null
        }
        <div className="notebook-container" ref={notebookContainerRef} onMouseDown={handleMouseDown}>
            {homeworks
                ? Object.values(homeworks).length > 0
                    ? Object.values(homeworks).sort((day) => day.date).map((day) => (day.taskList.length || day.sessionContentList.length)
                        ? <NotebookDay day={day} isNotebookGrabed={isNotebookGrabed} />
                        : null
                    ).filter(e => e)
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