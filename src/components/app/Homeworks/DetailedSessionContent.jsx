import { useEffect, useRef, useContext } from "react"
import ContentLoader from "react-content-loader"
import EncodedHTMLDiv from "../../generic/CustomDivs/EncodedHTMLDiv"
import CheckBox from "../../generic/UserInputs/CheckBox"
import { AppContext } from "../../../App"
import { applyZoom, getZoomedBoudingClientRect } from "../../../utils/zoom";
import { Link, useLocation, useNavigate } from "react-router-dom"
import DownloadIcon from "../../graphics/DownloadIcon"
import { TaskComments } from "./DetailedTask"

import { clearHTML } from "../../../utils/html"

import "./DetailedSessionContent.css"
import "./DetailedTask.css"

export default function DetailedSessionContent({ sessionContent, userHomeworks, day, sessionContentIndex, ...props }) {
    const navigate = useNavigate()

    const detailedTaskRef = useRef(null);
    const { actualDisplayTheme, fetchHomeworksDone, useUserSettings } = useContext(AppContext)
    const settings = useUserSettings();
    const homeworks = userHomeworks.get()

    const contentLoadersRandomValues = useRef({ labelWidth: Math.floor(Math.random() * 100) + 200, contentHeight: Math.floor(Math.random() * 200) + 50 })
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

        const sessionContentId = parseInt(anchors[1]);

        if (isNaN(sessionContentId)) {
            return;
        }

        if (sessionContentId === sessionContent.id && detailedTaskRef.current) {
            setTimeout(() => scrollIntoViewNearestParent(detailedTaskRef.current), 200);
        }

    }, [location, detailedTaskRef.current, homeworks])

    return <div ref={detailedTaskRef} onClick={(e) => { navigate(`#${day};${sessionContent.id}`); e.stopPropagation() }} className={`detailed-session-content ${sessionContent.isDone ? "done" : ""}`} id={"session-content-" + sessionContent.id} {...props} >
        <div className="session-content-header">
            <h4>
                {sessionContent.subject.replace(". ", ".").replace(".", ". ")}
            </h4>
        </div>
        <div className="session-content-subtitle">
            {sessionContent.addDate && <span className="add-date">Donné le {(new Date(sessionContent.addDate)).toLocaleDateString("fr-FR")} par {settings.get("isStreamerModeEnabled") ? "M. -------" : sessionContent.teacher}</span>}
            {sessionContent.isInterrogation && <span className="interrogation-alert">évaluation</span>}
        </div>
        <Link to={`#${day};${sessionContent.id};s`} className="session-content-link" onClick={(e) => e.stopPropagation()} replace={true} >
            <EncodedHTMLDiv className="session-content-content" backgroundColor={actualDisplayTheme === "dark" ? "#40405b" : "#e4e4ff"} >{sessionContent.sessionContent}</EncodedHTMLDiv>
        </Link>
        <TaskComments comments={sessionContent.sessionComments} idContenu={sessionContent.id} day={day} />
        <div className="session-content-footer">
            <Link to={`#${day};${sessionContent.id};f`} onClick={(e) => e.stopPropagation()} replace={true} className={`session-content-footer-button ${sessionContent.sessionContentFiles.length === 0 ? "disabled" : ""}`}><DownloadIcon className="download-icon" />Fichiers</Link>
        </div>
    </div>
}