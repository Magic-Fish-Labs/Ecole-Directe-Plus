import { useContext } from "react"
import CheckBox from "../../../generic/UserInputs/CheckBox";
import { AppContext, SettingsContext, UserDataContext } from "../../../../App";
import ContentLoader from "react-content-loader";

import "./Task.css";
export default function Task({ task, isNotebookGrabed, ...props }) {
    const { usedDisplayTheme } = useContext(AppContext)

    const userData = useContext(UserDataContext);
    const {
        homeworks: { value: homeworks, set: setHomeworks },
        activeHomeworkId: { set: setActiveHomeworkId }
    } = userData;

    const settings = useContext(SettingsContext);
    const {
        displayMode: { value: displayMode },
        isPartyModeEnabled: { value: isPartyModeEnabled }
    } = settings.user;

    function checkTask(task) {
        const isTaskDone = task.isDone;
        task.check()
            .catch((error) => {
                task.isDone = isTaskDone;
                setHomeworks(homeworks);
                console.error(error);
            });
        task.isDone = !isTaskDone;
        setHomeworks(homeworks);
    }

    function handleTaskClick() {
        if (!isNotebookGrabed.current) {
            setActiveHomeworkId(task.id);
        }
    }

    function handleKeyDown(event) {
        if (event.key === "Enter" || event.key === " ") {
            handleTaskClick();
        }
    }

    return (
        task?.id
            ? <div className={`task ${task.isDone ? "done" : ""}`} onClick={handleTaskClick} onKeyDown={handleKeyDown} tabIndex={0} {...props} >
                <CheckBox
                    id={"task-cb-" + task.id}
                    confetti={{ onCheck: displayMode === "quality" && isPartyModeEnabled }}
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
                animate={displayMode === "quality"}
                speed={1}
                backgroundColor={usedDisplayTheme === "dark" ? "#63638c" : "#9d9dbd"}
                foregroundColor={usedDisplayTheme === "dark" ? "#7e7eb2" : "#bcbce3"}
                style={{ width: `100%`, maxHeight: "50px" }}
            >
                <rect x="0" y="0" rx="10" ry="10" style={{ width: "100%", height: "100%" }} />
            </ContentLoader>
    )
}

