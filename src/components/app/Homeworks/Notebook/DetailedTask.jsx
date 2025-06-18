import { useEffect, useRef, useContext } from "react"
import ContentLoader from "react-content-loader"
import EncodedHTMLDiv from "../../../generic/CustomDivs/EncodedHTMLDiv"
import CheckBox from "../../../generic/UserInputs/CheckBox"
import { AppContext, SettingsContext, UserDataContext } from "../../../../App"
import { applyZoom, getZoomedBoudingClientRect } from "../../../../utils/zoom";

import PatchNotesIcon from "../../../graphics/PatchNotesIcon"
import DownloadIcon from "../../../graphics/DownloadIcon"
import CopyButton from "../../../generic/CopyButton"
import { clearHTML } from "../../../../utils/html"

import { useCreateNotification } from "../../../generic/PopUps/Notification"
import "./DetailedTask.css"

const EMPTY_SESSION_CONTENT = [
    "PHAgc3R5bGU9Ii13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwKTsiPjxicj48L3A+PHAgc3R5bGU9Ii13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwKTsiPjxicj48L3A+",
    "",
]

export default function DetailedTask({ task, ...props }) {
    const { usedDisplayTheme } = useContext(AppContext);

    const userData = useContext(UserDataContext);
    const {
        homeworks: { value: homeworks, set: setHomeworks },
        activeHomeworkId: { set: setActiveHomeworkId }
    } = userData;

    const settings = useContext(SettingsContext);
    const { isPartyModeEnabled, displayMode, isStreamerModeEnabled } = settings.user;

    const detailedTaskRef = useRef(null);
    const contentLoadersRandomValues = useRef({ labelWidth: Math.floor(Math.random() * 150) + 100, contentHeight: Math.floor(Math.random() * 200) + 50 });

    function checkTask(task) {
        const isTaskDone = task.isDone;
        task.check()
            .catch((error) => {
                console.error(error);
                task.isDone = isTaskDone;
                setHomeworks(homeworks);
            });
        task.isDone = !isTaskDone;
        setHomeworks(homeworks);
    }

    // !:!
    const summonNotification = useCreateNotification();

    return task?.content
        ? <div ref={detailedTaskRef} onClick={(e) => { setActiveHomeworkId(task.id); e.stopPropagation() }} className={`detailed-task ${task.isDone ? "done" : ""}`} id={"task-" + task.id} {...props} >
            <div className="task-header">
                <CheckBox
                    id={"task-cb-" + task.id}
                    confetti={{ onCheck: displayMode.value === "quality" && isPartyModeEnabled.value }}
                    label="Effectué"
                    onChange={() => { checkTask(task) }}
                    checked={task.isDone}
                    onClick={(event) => { event.stopPropagation() }}
                />
                <h4>
                    {task.subject.replaceAll(". ", ".").replaceAll(".", ". ")}
                </h4>
            </div>
            <div className="task-subtitle">
                {task.addDate && <span className="add-date">Donné le {(new Date(task.addDate)).toLocaleDateString("fr-FR")} par {isStreamerModeEnabled.value ? task.teacher.split(" ")[0] + " " + "-".repeat(task.teacher.length) : task.teacher}</span>}
                {task.isInterrogation && <span className="interrogation-alert">évaluation</span>}
            </div>
            <EncodedHTMLDiv className="task-content" nonEncodedChildren={<CopyButton content={clearHTML(task.content, undefined, false).innerText} />} backgroundColor={usedDisplayTheme === "dark" ? "#40405b" : "#e4e4ff"} >{task.content}</EncodedHTMLDiv>
            <div className="task-footer">
                {/* <Link to={`#${day};${task.id};s`} onClick={(e) => e.stopPropagation()} replace={true} className={`task-footer-button ${EMPTY_SESSION_CONTENT.includes(task.sessionContent) ? "disabled" : ""}`}><PatchNotesIcon className="session-content-icon" />Contenu de séance</Link>
                <Link to={`#${day};${task.id};f`} onClick={(e) => e.stopPropagation()} replace={true} className={`task-footer-button ${task.files.length === 0 ? "disabled" : ""}`}><DownloadIcon className="download-icon" />Fichiers</Link> */}
                <button onClick={(e) => {summonNotification(<p>Il faut mettre les contenus de séance</p>, {timer: 3000}); e.stopPropagation()}} disabled={EMPTY_SESSION_CONTENT.includes(task.sessionContent)} className={`task-footer-button ${EMPTY_SESSION_CONTENT.includes(task.sessionContent) ? "disabled" : ""}`}><PatchNotesIcon className="session-content-icon" />Contenu de séance</button>
                <button onClick={(e) => {summonNotification(<p>Il faut mettre les fichiers</p>, {timer: 3000}); e.stopPropagation()}} disabled={task.files.length === 0} className={`task-footer-button ${task.files.length === 0 ? "disabled" : ""}`}><DownloadIcon className="download-icon" />Fichiers</button>
            </div>
        </div>
        : <div className={`detailed-task`} {...props} >
            <div className="task-header">
                <CheckBox id={"task-cb-" + crypto.randomUUID()} label="Effectué" checked={false} />
                <h4>
                    <ContentLoader
                        animate={displayMode.value === "quality"}
                        speed={1}
                        backgroundColor={usedDisplayTheme === "dark" ? "#63638c" : "#9d9dbd"}
                        foregroundColor={usedDisplayTheme === "dark" ? "#7e7eb2" : "#bcbce3"}
                        style={{ width: contentLoadersRandomValues.current.labelWidth + "px", maxHeight: "30px" }}
                    >
                        <rect x="0" y="0" rx="10" ry="10" style={{ width: "100%", height: "100%" }} />
                    </ContentLoader>
                </h4>
            </div>
            <div className="task-subtitle">
                <ContentLoader
                    animate={displayMode.value === "quality"}
                    speed={1}
                    backgroundColor={'#7e7eab7F'}
                    foregroundColor={'#9a9ad17F'}
                    height="14"
                    style={{ width: contentLoadersRandomValues.current.labelWidth / 1.5 + "px" }}
                >
                    <rect x="0" y="0" rx="5" ry="5" style={{ width: "100%", height: "100%" }} />
                </ContentLoader>
            </div>
            <div style={{ width: "100%", height: contentLoadersRandomValues.current.contentHeight + "px", marginBlock: "5px", borderRadius: "10px", backgroundColor: usedDisplayTheme === "dark" ? "#40405b" : "#ffffff4d" }}></div>
            <div className="task-footer">
                <div className={`task-footer-button disabled`}><PatchNotesIcon className="session-content-icon" />Contenu de séance</div>
                <div className={`task-footer-button disabled`}><DownloadIcon className="download-icon" />Fichiers</div>
            </div>
        </div>
}
