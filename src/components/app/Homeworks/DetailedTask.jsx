import { useEffect, useRef, useContext } from "react"
import ContentLoader from "react-content-loader"
import EncodedHTMLDiv from "../../generic/CustomDivs/EncodedHTMLDiv"
import CheckBox from "../../generic/UserInputs/CheckBox"
import { AppContext } from "../../../App"
import { applyZoom, getZoomedBoudingClientRect } from "../../../utils/zoom";
import { Link, useLocation, useNavigate } from "react-router-dom"

import PatchNotesIcon from "../../graphics/PatchNotesIcon"
import DownloadIcon from "../../graphics/DownloadIcon"
import CopyButton from "../../generic/CopyButton"
import { clearHTML } from "../../../utils/html"

import "./DetailedTask.css"

const supposedNoSessionContent = [
    "PHAgc3R5bGU9Ii13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwKTsiPjxicj48L3A+PHAgc3R5bGU9Ii13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwKTsiPjxicj48L3A+",
    "",
]

export default function DetailedTask({ task, userHomeworks, day, ...props }) {
    const navigate = useNavigate()

    const isMouseInCheckBoxRef = useRef(false);
    const detailedTaskRef = useRef(null);
    const taskCheckboxRef = useRef(null);
    const { actualDisplayTheme, fetchHomeworksDone, useUserSettings } = useContext(AppContext)
    const settings = useUserSettings();
    const homeworks = userHomeworks.get()

    const contentLoadersRandomValues = useRef({ labelWidth: Math.floor(Math.random() * 150) + 100, contentHeight: Math.floor(Math.random() * 200) + 50 })


    const location = useLocation();
    const oldLocationHash = useRef(null);

    function scrollIntoViewNearestParent(element) {
        const parent = element.parentElement;
        const parentBounds = getZoomedBoudingClientRect(parent.getBoundingClientRect());
        const bounds = getZoomedBoudingClientRect(element.getBoundingClientRect());
        
        parent.scrollTo(0, bounds.y - parentBounds.y + parent.scrollTop - 20)
    }

    useEffect(() => {
        if (oldLocationHash.current === location.hash) {
            return;
        }

        oldLocationHash.current = location.hash;
        
        if (["#patch-notes", "#policy", "#feedback"].includes(location.hash)) {
            return;
        }

        const anchors = location.hash.split(";");

        if (anchors.length < 2) {
            return;
        }

        const taskId = parseInt(anchors[1]);

        if (isNaN(taskId)) {
            return;
        }

        if (taskId === task.id && detailedTaskRef.current) {
            setTimeout(() => scrollIntoViewNearestParent(detailedTaskRef.current), 200);
        }

    }, [location, detailedTaskRef.current, homeworks])

    function completedTaskAnimation() {
        const bounds = getZoomedBoudingClientRect(taskCheckboxRef.current.getBoundingClientRect());
        const origin = {
            x: bounds.left + 15 / 2,
            y: bounds.top + 15 / 2
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
            if (settings.get("isPartyModeEnabled") && settings.get("displayMode") === "quality") {
                completedTaskAnimation();
            }
        }
        homeworks[date].find((item) => item.id === task.id).isDone = !task.isDone;
        userHomeworks.set(homeworks);
    }

    return <>{(task?.content
        ? <div ref={detailedTaskRef} onClick={(e) => {navigate(`#${day};${task.id}`); e.stopPropagation()}} className={`detailed-task ${task.isDone ? "done" : ""}`} id={"task-" + task.id} {...props} >
            <div className="task-header">
                <CheckBox id={"task-cb-" + task.id} ref={taskCheckboxRef} label="Effectué" onChange={() => { checkTask(day, task) }} checked={task.isDone} onMouseEnter={() => isMouseInCheckBoxRef.current = true} onMouseLeave={() => isMouseInCheckBoxRef.current = false} />
                <h4>
                    {task.subject.replace(". ", ".").replace(".", ". ")}
                </h4>
            </div>
            <div className="task-subtitle">
                {task.addDate && <span className="add-date">Donné le {(new Date(task.addDate)).toLocaleDateString("fr-FR")} par {settings.get("isStreamerModeEnabled") ? task.teacher.split(" ")[0] + " " + "-".repeat(task.teacher.length) : task.teacher}</span>}
                {task.isInterrogation && <span className="interrogation-alert">évaluation</span>}
            </div>
            <EncodedHTMLDiv className="task-content" nonEncodedChildren={<CopyButton content={clearHTML(task.content, undefined, false).innerText} />} backgroundColor={actualDisplayTheme === "dark" ? "#40405b" : "#e4e4ff"} >{task.content}</EncodedHTMLDiv>
            <div className="task-footer">
                <Link to={`#${day};${task.id};s`} onClick={(e) => e.stopPropagation()} replace={true} className={`task-footer-button ${supposedNoSessionContent.includes(task.sessionContent) ? "disabled" : ""}`}><PatchNotesIcon className="session-content-icon" />Contenu de séance</Link>
                <Link to={`#${day};${task.id};f`} onClick={(e) => e.stopPropagation()} replace={true} className={`task-footer-button ${task.files.length === 0 ? "disabled" : ""}`}><DownloadIcon className="download-icon" />Fichiers</Link>
            </div>
        </div>
        : <div className={`detailed-task`} {...props} >
            <div className="task-header">
                <CheckBox id={"task-cb-" + crypto.randomUUID()} ref={taskCheckboxRef} label="Effectué" onChange={() => { }} checked={false} onMouseEnter={() => isMouseInCheckBoxRef.current = true} onMouseLeave={() => isMouseInCheckBoxRef.current = false} />
                <h4>
                    <ContentLoader
                        animate={settings.get("displayMode") === "quality"}
                        speed={1}
                        backgroundColor={actualDisplayTheme === "dark" ? "#63638c" : "#9d9dbd"}
                        foregroundColor={actualDisplayTheme === "dark" ? "#7e7eb2" : "#bcbce3"}
                        style={{ width: contentLoadersRandomValues.current.labelWidth + "px", maxHeight: "30px" }}
                    >
                        <rect x="0" y="0" rx="10" ry="10" style={{ width: "100%", height: "100%" }} />
                    </ContentLoader>
                </h4>
            </div>
            <div className="task-subtitle">
                <ContentLoader
                    animate={settings.get("displayMode") === "quality"}
                    speed={1}
                    backgroundColor={'#7e7eab7F'}
                    foregroundColor={'#9a9ad17F'}
                    height="14"
                    style={{ width: contentLoadersRandomValues.current.labelWidth/1.5 + "px" }}
                >
                    <rect x="0" y="0" rx="5" ry="5" style={{ width: "100%", height: "100%" }} />
                </ContentLoader>
            </div>
            <div style={{ width: "100%", height: contentLoadersRandomValues.current.contentHeight + "px", marginBlock: "5px", borderRadius: "10px", backgroundColor: actualDisplayTheme === "dark" ? "#40405b" : "#ffffff4d" }}></div>
            <div className="task-footer">
                <div className={`task-footer-button disabled`}><PatchNotesIcon className="session-content-icon" />Contenu de séance</div>
                <div className={`task-footer-button disabled`}><DownloadIcon className="download-icon" />Fichiers</div>
            </div>
        </div>
    )}
    </>
}
