import ContentLoader from "react-content-loader";
import { useNavigate } from "react-router-dom";

import "./SessionContent.css";
export default function SessionContent({ day, sessionContent, sessionContentIndex, ...props }) {
    const navigate = useNavigate();


    function handleSessionContentClick(event) {
        if (event) {
            event.stopPropagation();
        }
        const notebookContainer = document.getElementsByClassName("notebook-container")[0];
        if (!notebookContainer.classList.contains("mouse-moved")) {
            navigate(`#${day};${sessionContent.id}${location.hash.split(";").length === 3 ? ";" + location.hash.split(";")[2] : ""}`, { replace: true });
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === "Enter" || event.key === " ") {
            handleSessionContentClick()
        }
    }

    return (
        sessionContent?.id
            ? <div className={`session-content ${sessionContent.isDone ? "done" : ""}`} id={"session-content-" + sessionContent.id} onClick={handleSessionContentClick} onKeyDown={handleKeyDown} tabIndex={0} {...props} >
                <div className="session-content-title">
                    <h4>
                        {sessionContent.subject.replaceAll(". ", ".").replaceAll(".", ". ")}
                    </h4>
                    {sessionContent.addDate && <span className="add-date">Écrit le {(new Date(sessionContent.addDate)).toLocaleDateString("fr-FR")}</span>}
                </div>
            </div>
            : <ContentLoader
                animate={settings.get("displayMode") === "quality"}
                speed={1}
                backgroundColor={usedDisplayTheme === "dark" ? "#63638c" : "#9d9dbd"}
                foregroundColor={usedDisplayTheme === "dark" ? "#7e7eb2" : "#bcbce3"}
                style={{ width: `100%`, maxHeight: "50px" }}
            >
                <rect x="0" y="0" rx="10" ry="10" style={{ width: "100%", height: "100%" }} />
            </ContentLoader>
    )
}

