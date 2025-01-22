import { useRef, useContext } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import CheckBox from "../../generic/UserInputs/CheckBox";
import { AppContext, SettingsContext, UserDataContext } from "../../../App";
import { applyZoom, getZoomedBoudingClientRect } from "../../../utils/zoom";

import "./Task.css";
import ContentLoader from "react-content-loader";

export default function Task({ task, day, ...props }) {
    const { actualDisplayTheme, fetchHomeworksDone, useUserSettings } = useContext(AppContext)

    const userData = useContext(UserDataContext);
    const { homeworks } = userData;

    const settings = useContext(SettingsContext);
    const { isPartyModeEnabled, displayMode } = settings.user;

    const navigate = useNavigate();
    const location = useLocation();

    const isMouseInCheckBoxRef = useRef(false);
    const taskCheckboxRef = useRef(null);

    function completedTaskAnimation() {
        const bounds = getZoomedBoudingClientRect(taskCheckboxRef.current.getBoundingClientRect());
        const origin = {
            x: bounds.left + bounds.width / 2,
            y: bounds.top + bounds.height / 2
        }
        confetti({
            particleCount: 40,
            spread: 70,
            origin: {
                x: origin.x / applyZoom(window.innerWidth),
                y: origin.y / applyZoom(window.innerHeight)
            },
        });
    }

    function checkTask(date, task) {
        const tasksToUpdate = (task.isDone ? {
            tasksNotDone: [task.id],
        } : {
            tasksDone: [task.id],
        })
        fetchHomeworksDone(tasksToUpdate);
        if (tasksToUpdate.tasksDone !== undefined) {
            if (isPartyModeEnabled.value && displayMode.value === "quality") {
                completedTaskAnimation();
            }
        }
        homeworks[date].find((item) => item.id === task.id).isDone = !task.isDone;
        userData.set("homeworks", homeworks);
    }

    function handleTaskClick(event) {
        if (event) {
            event.stopPropagation();
        }
        const notebookContainer = document.getElementsByClassName("notebook-container")[0];
        if (!isMouseInCheckBoxRef.current && !notebookContainer.classList.contains("mouse-moved")) {
            navigate(`#${day};${task.id}${location.hash.split(";").length === 3 ? ";" + location.hash.split(";")[2] : ""}`, { replace: true });
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === "Enter" || event.key === " ") {
            handleTaskClick()
        }
    }

    return (
        task?.id
            ? <div className={`task ${task.isDone ? "done" : ""}`} id={"task-" + task.id} onClick={handleTaskClick} onKeyDown={handleKeyDown} tabIndex={0} {...props} >
                <CheckBox id={"task-cb-" + task.id} ref={taskCheckboxRef} onChange={() => { checkTask(day, task) }} checked={task.isDone} onMouseEnter={() => isMouseInCheckBoxRef.current = true} onMouseLeave={() => isMouseInCheckBoxRef.current = false} />
                <div className="task-title">
                    <h4>
                        {task.subject.replace(". ", ".").replace(".", ". ")}
                    </h4>
                    {task.addDate && <span className="add-date">Donné le {(new Date(task.addDate)).toLocaleDateString("fr-FR")}</span>}
                    {task.isInterrogation && <span className="interrogation-alert">évaluation</span>}
                </div>
            </div>
            : <ContentLoader
                animate={displayMode.value === "quality"}
                speed={1}
                backgroundColor={actualDisplayTheme === "dark" ? "#63638c" : "#9d9dbd"}
                foregroundColor={actualDisplayTheme === "dark" ? "#7e7eb2" : "#bcbce3"}
                style={{ width: `100%`, maxHeight: "50px" }}
            >
                <rect x="0" y="0" rx="10" ry="10" style={{ width: "100%", height: "100%" }} />
            </ContentLoader>
    )
}

