import { useEffect, useRef, useContext } from "react"
import EncodedHTMLDiv from "../../generic/CustomDivs/EncodedHTMLDiv"
import { AppContext } from "../../../App"
import { getZoomedBoudingClientRect } from "../../../utils/zoom";
import { Link, useLocation, useNavigate } from "react-router-dom"
import DownloadIcon from "../../graphics/DownloadIcon"

import "./DetailedSessionContent.css"

export default function DetailedSessionContent({ sessionContent, day, sessionContentIndex, ...props }) {
    const navigate = useNavigate()

    const detailedTaskRef = useRef(null);
    const { usedDisplayTheme, fetchHomeworksDone, useUserSettings } = useContext(AppContext)
    const settings = useUserSettings();

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

    }, [location, detailedTaskRef.current])
    // }, [location, detailedTaskRef.current, homeworks])
    // !:! I assumed that set the homeworks as a dependence of this useEffect was useless and just a 

    return <div ref={detailedTaskRef} onClick={(e) => { navigate(`#${day};${sessionContent.id}`); e.stopPropagation() }} className={`detailed-session-content ${sessionContent.isDone ? "done" : ""}`} id={"session-content-" + sessionContent.id} {...props} >
        <div className="session-content-header">
            <h4>
                {sessionContent.subject.replaceAll(". ", ".").replaceAll(".", ". ")}
            </h4>
        </div>
        <div className="session-content-subtitle">
            {sessionContent.addDate && <span className="add-date">Donné le {(new Date(sessionContent.addDate)).toLocaleDateString("fr-FR")} par {settings.get("isStreamerModeEnabled") ? "M. -------" : sessionContent.teacher}</span>}
            {sessionContent.isInterrogation && <span className="interrogation-alert">évaluation</span>}
        </div>
        <Link to={`#${day};${sessionContent.id};s`} className="session-content-link" onClick={(e) => e.stopPropagation()} replace={true} >
            <EncodedHTMLDiv className="session-content-content" backgroundColor={usedDisplayTheme === "dark" ? "#40405b" : "#e4e4ff"} >{sessionContent.sessionContent}</EncodedHTMLDiv>
        </Link>
        <div className="session-content-footer">
            <Link to={`#${day};${sessionContent.id};f`} onClick={(e) => e.stopPropagation()} replace={true} className={`session-content-footer-button ${sessionContent.sessionContentFiles.length === 0 ? "disabled" : ""}`}><DownloadIcon className="download-icon" />Fichiers</Link>
        </div>
    </div>
}