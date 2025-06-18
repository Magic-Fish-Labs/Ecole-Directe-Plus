import { useContext, useRef } from "react";
import { textToHSL } from "../../../utils/utils"
import { formatDateRelative } from "../../../utils/date"
import CheckBox from "../../generic/UserInputs/CheckBox"
import { AppContext, SettingsContext, UserDataContext } from "../../../App";
import { useNavigate } from "react-router-dom";
import { applyZoom, getZoomedBoudingClientRect } from "../../../utils/zoom";

export default function Interrogation({ date, id }) { // This component only exists to give a ref for each interrogation
    const { fetchHomeworksDone, usedDisplayTheme } = useContext(AppContext)
    const userData = useContext(UserDataContext);
    const { homeworks } = userData;

    const userSettings = useContext(SettingsContext);
    const {
        displayMode: { value: displayMode },
        isPartyModeEnabled: { value: isPartyModeEnabled },
    } = userSettings;

    const navigate = useNavigate()

    const task = homeworks[date].find((el) => el.id === id);

    function checkTask() {
        const tasksToUpdate = (task.isDone
            ? { tasksNotDone: [task.id] }
            : { tasksDone: [task.id] })
        fetchHomeworksDone(tasksToUpdate); // !:! handle errors and return stuff etc
        if (tasksToUpdate.tasksDone !== undefined) {
            completedTaskAnimation();
        }
        task.isDone = !task.isDone;
        sortedHomeworks.set(homeworks);
    }

    function handleClick() {
        navigate(`#${date};${id}`);
    }

    function handleKeyDown(e) {
        if (["Enter", " "].includes(e.key)) {
            navigate(`#${task.date};${task.id}`)
        }
    }

    const taskColor = typeof task.id === "number" ? textToHSL(task.subjectCode) : undefined;

    return typeof task.id === "number"
        // ? <div tabIndex="0" role="a" onKeyDown={(e) => handleKeyDown(e, task.date, task.id)} onClick={() => handleClick(task.date, task.id)} className={`upcoming-assignments ${homeworks[task.date][task.index].isDone ? "done" : ""}`}
        ? <div tabIndex="0" role="a" onKeyDown={(e) => handleKeyDown(e)} onClick={handleClick} className={`upcoming-assignments ${task.isDone ? "done" : ""}`}
            style={{
                "--subject-main-color": usedDisplayTheme === "dark" ? `hsl(${taskColor[0]}, ${taskColor[1]}%, ${taskColor[2]}%)` : `hsl(${taskColor[0]}, ${taskColor[1] - 20}%, ${taskColor[2] - 30}%)`,
                "--subject-bg-color": usedDisplayTheme === "dark" ? `hsla(${taskColor[0]}, ${taskColor[1]}%, ${taskColor[2]}%, .2)` : `hsla(${taskColor[0]}, ${taskColor[1] - 20}%, ${taskColor[2] - 30}%, .2)`,
            }}>
            <CheckBox
                id={`upcoming-assignments-cb-${task.id}`}
                confetti={{ onCheck: displayMode === "quality" && isPartyModeEnabled }}
                onChange={checkTask}
                checked={task.isDone}
                onClick={(event) => { event.stopPropagation() }}
                style={{ "backgroundImage": task.isDone ? `url("data:image/svg+xml,%3Csvg width='126' height='90' viewBox='0 0 126 90' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3.00999 29.4982L4.7539 27.7442C8.77118 23.7036 15.3475 23.8312 19.205 28.0246L47.306 58.5723C48.849 60.2496 51.4795 60.3007 53.0864 58.6844L108.318 3.13256C112.228 -0.799963 118.591 -0.799963 122.501 3.13256L122.99 3.62419C126.868 7.5247 126.868 13.8249 122.99 17.7254L52.9741 88.147C51.4102 89.72 48.8649 89.72 47.301 88.147L3.00999 43.5994C-0.868052 39.6989 -0.868055 33.3987 3.00999 29.4982Z' fill='hsl(${taskColor[0]}, ${taskColor[1]}%, ${taskColor[2]}%)'/%3E%3C/svg%3E")` : "" }}
            />
            <span><span className="interrogation-label">{task.subject}</span></span>
            <span>{formatDateRelative(new Date(task.date))}</span>
        </div>
        : <div className="dummy-interrogation" />
}