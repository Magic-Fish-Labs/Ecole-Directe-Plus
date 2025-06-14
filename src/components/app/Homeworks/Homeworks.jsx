
import { useContext, useEffect } from "react";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";

import {
    WindowsContainer,
    WindowsLayout,
    Window,
    WindowHeader,
    WindowContent
} from "../../generic/Window";

import { AccountContext, UserDataContext } from "../../../App";
import Notebook from "./Notebook/Notebook";
import BottomSheet from "../../generic/PopUps/BottomSheet";
import EncodedHTMLDiv from "../../generic/CustomDivs/EncodedHTMLDiv";
import UpcomingAssignments from "./UpcomingAssignments";
import PopUp from "../../generic/PopUps/PopUp";
import { formatDateRelative } from "../../../utils/date";
import FileComponent from "../../generic/FileComponent";
import { getISODate } from "../../../utils/utils";
import Calendar from "./Calendar";
import InfoButton from "../../generic/Informative/InfoButton";
import DownloadIcon from "../../graphics/DownloadIcon"

import "./Homeworks.css";

const supposedNoSessionContent = [
    "PHAgc3R5bGU9Ii13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwKTsiPjxicj48L3A+PHAgc3R5bGU9Ii13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwKTsiPjxicj48L3A+",
    "",
]

export default function Homeworks() {
    const userData = useContext(UserDataContext);
    const {
        homeworks: { value: homeworks },
        activeHomeworkDate: { value: activeHomeworkDate },
        activeHomeworkId: { value: activeHomeworkId }
    } = userData;

    const account = useContext(AccountContext);
    const { loginStates: { isLoggedIn } } = account;

    const navigate = useNavigate();
    const location = useLocation();

    const hashParameters = location.hash.split(";")
    const selectedDate = hashParameters.length ? hashParameters[0].slice(1) : getISODate(new Date())
    const selectedTask = hashParameters.length > 1 && homeworks && homeworks[selectedDate]?.find(e => e.id == hashParameters[1])

    useEffect(() => {
        document.title = "Cahier de texte • Ecole Directe Plus";
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        if (isLoggedIn && homeworks === undefined) {
            userData.get.homeworks(null, controller);
        }

        return () => {
            controller.abort();
        }
    }, [isLoggedIn, homeworks]);

    // JSX
    return <>
        <div id="homeworks">
            <WindowsContainer name="homeworks">
                <WindowsLayout direction="row" ultimateContainer={true}>
                    <WindowsLayout direction="column">
                        <Window>
                            <WindowHeader>
                                <h2>Prochains devoirs surveillés</h2>
                            </WindowHeader>
                            <WindowContent className="upcoming-assignments-container">
                                <UpcomingAssignments />
                            </WindowContent>
                        </Window>
                        <Window growthFactor={1.75} >
                            <WindowHeader>
                                <h2>Calendrier</h2>
                                <InfoButton className="calendar-info">
                                    <p>Cliquez sur une date pour accéder aux devoirs associés.</p><br />
                                    <p>SHIFT + CLIC ou apppui prolongé pour charger tous les devoirs à partir de la date sélectionnée jusqu'à aujourd'hui.</p><br />
                                    <center>Légende</center>
                                    <p>GRIS : aujourd'hui</p>
                                    <p>BLEU : devoirs</p>
                                    <p>VERT : devoirs effectués</p>
                                    <p>ROUGE : contrôle</p>
                                </InfoButton>
                            </WindowHeader>
                            <WindowContent>
                                <Calendar />
                            </WindowContent>
                        </Window>
                    </WindowsLayout>
                    <Window growthFactor={2.2} allowFullscreen={true} className="notebook-window">
                        <WindowHeader>
                            <h2>Cahier de texte</h2>
                        </WindowHeader>
                        <WindowContent id="notebook">
                            <Notebook />
                        </WindowContent>
                    </Window>
                </WindowsLayout>
            </WindowsContainer>
        </div>
        {(hashParameters.length > 2 && hashParameters[2] === "s" && selectedTask) && (!supposedNoSessionContent.includes(selectedTask.sessionContent)
            ? <BottomSheet heading="Contenu de séance" onClose={() => { navigate(`${hashParameters[0]};${hashParameters[1]}`, { replace: true }) }}>
                <EncodedHTMLDiv className="bottomsheet-session-content">{selectedTask.sessionContent}</EncodedHTMLDiv>
                <div className="task-footer">
                    <div
                        to={`#${selectedDate};${selectedTask.id};s;f`}
                        onClick={(e) => e.stopPropagation()}
                        replace={true}
                        className={`task-footer-button ${selectedTask.sessionContentFiles.length === 0 ? "disabled" : ""}`}
                    >
                        <DownloadIcon className="download-icon" />Fichiers
                    </div>
                </div>
            </BottomSheet>
            : <Navigate to={`${hashParameters[0]};${hashParameters[1]}`} />)}
        {(hashParameters.length > 2 && hashParameters[2] === "f" && selectedTask) && ((selectedTask.type === "task" ? selectedTask.files.length : selectedTask.sessionContentFiles.length)
            ? <PopUp className="task-file-pop-up" onClose={() => { navigate(`${hashParameters[0]};${hashParameters[1]}`, { replace: true }) }}>
                <div className="header-container">
                    <h2 className="file-title">Fichiers joints</h2>
                    <p className="file-subject">{selectedTask.subject} • {formatDateRelative(new Date(selectedTask.addDate))}</p>
                </div>
                <div className="file-scroller">
                    <div className="file-wrapper">
                        <p className="file-subject">Note : maintenir pour télécharger</p>
                        {selectedTask.type === "task"
                            ? selectedTask.files.map((file) => <FileComponent key={file.id} file={file} />)
                            : selectedTask.sessionContentFiles.map((file) => <FileComponent key={file.id} file={file} />)}
                    </div>
                </div>
            </PopUp>
            : <Navigate to={`${hashParameters[0]};${hashParameters[1]}`} />)}
        {(hashParameters.length > 3 && hashParameters[2] === "s" && hashParameters[3] === "f" && selectedTask) && (selectedTask.sessionContentFiles.length
            ? <PopUp className="task-file-pop-up" onClose={() => { navigate(`${hashParameters[0]};${hashParameters[1]};s`, { replace: true }) }}>
                <div className="header-container">
                    <h2 className="file-title">Fichiers joints</h2>
                    <p className="file-subject">{selectedTask.subject} • {formatDateRelative(new Date(selectedTask.addDate))}</p>
                </div>
                <div className="file-scroller">
                    <div className="file-wrapper">
                        <p className="file-subject">Note : maintenir pour télécharger</p>
                        {selectedTask.sessionContentFiles.map((file) => <FileComponent key={file.id} file={file} />)}
                    </div>
                </div>
            </PopUp>
            : <Navigate to={`${hashParameters[0]};${hashParameters[1]}`} />)}
    </>
}