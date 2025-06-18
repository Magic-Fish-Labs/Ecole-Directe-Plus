import { useRef, useContext } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import CheckBox from "../../../generic/UserInputs/CheckBox";
import { AppContext, SettingsContext, UserDataContext } from "../../../../App";
import ContentLoader from "react-content-loader";

import "./Task.css";
export default function Task({ task, day, ...props }) {
    const { usedDisplayTheme, fetchHomeworksDone, useUserSettings } = useContext(AppContext)

    const userData = useContext(UserDataContext);
    const { homeworks: {value: homeworks, set: setHomeworks} } = userData;

    const settings = useContext(SettingsContext);
    const { isPartyModeEnabled, displayMode } = settings.user;

    const navigate = useNavigate();
    const location = useLocation();
    function checkTask(task) {
        task.check()
        .catch((error) => {
            console.error(error);
            homeworks[date].find((item) => item.id === task.id).isDone = isTaskDone;
            setHomeworks(homeworks);
        });
        homeworks[date].find((item) => item.id === task.id).isDone = !isTaskDone;
        setHomeworks(homeworks);
    }

    function handleTaskClick(event) {
        if (event) {
            event.stopPropagation();
        }
        const notebookContainer = document.getElementsByClassName("notebook-container")[0];
        if (!notebookContainer.classList.contains("mouse-moved")) {
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
            ? <div className={`task ${task.isDone ? "done" : ""}`} onClick={handleTaskClick} onKeyDown={handleKeyDown} tabIndex={0} {...props} >
                <CheckBox
                    id={"task-cb-" + task.id}
                    confetti={{ onCheck: displayMode.value === "quality" && isPartyModeEnabled.value }}
                    checked={task.isDone}
                    onChange={(event) => { checkTask(task); }}
                    onClick={(event) => { event.stopPropagation() }}
                />
                <div className="task-title">
                    <h4>
                        {task.subject.replaceAll(". ", ".").replaceAll(".", ". ")}
                    </h4>
                    {task.addDate && <span className="add-date">Donné le {(new Date(task.addDate)).toLocaleDateString("fr-FR")}</span>}
                    {task.isInterrogation && <span className="interrogation-alert">évaluation</span>}
                </div>
            </div>
            : <ContentLoader
                animate={displayMode.value === "quality"}
                speed={1}
                backgroundColor={usedDisplayTheme === "dark" ? "#63638c" : "#9d9dbd"}
                foregroundColor={usedDisplayTheme === "dark" ? "#7e7eb2" : "#bcbce3"}
                style={{ width: `100%`, maxHeight: "50px" }}
            >
                <rect x="0" y="0" rx="10" ry="10" style={{ width: "100%", height: "100%" }} />
            </ContentLoader>
    )
}

