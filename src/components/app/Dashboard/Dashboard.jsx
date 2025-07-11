
import { useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AccountContext, SettingsContext, UserDataContext } from "../../../App";

import {
    WindowsContainer,
    WindowsLayout,
    Window,
    WindowHeader,
    WindowContent
} from "../../generic/Window";
import LastGrades from "./LastGrades";
import Notebook from "../Homeworks/Notebook/Notebook";
import BottomSheet from "../../generic/PopUps/BottomSheet";
import EncodedHTMLDiv from "../../generic/CustomDivs/EncodedHTMLDiv";
import UpcomingAssignments from "../Homeworks/UpcomingAssignments";
import PopUp from "../../generic/PopUps/PopUp";

import "./Dashboard.css";
import { formatDateRelative } from "../../../utils/date";
import FileComponent from "../../generic/FileComponent";

export default function Dashboard({ isTabletLayout }) {
    const userData = useContext(UserDataContext);
    const {
        grades: {value: grades, get: getGrades},
        homeworks: {value: homeworks, get: getHomeworks}
    } = userData;

    const account = useContext(AccountContext);
    const { loginStates: { isLoggedIn } } = account;

    const settings = useContext(SettingsContext);
    const { isSchoolYearEnabled, schoolYear } = settings.user;

    const fetchSchoolYear = isSchoolYearEnabled.value ? schoolYear.value.join("-") : ""

    const navigate = useNavigate();
    const location = useLocation()

    const hashParameters = location.hash.split(";")
    const selectedTask = hashParameters.length > 1 && homeworks && homeworks[hashParameters[0].slice(1)]?.find(e => e.id == hashParameters[1])

    // Behavior
    useEffect(() => {
        document.title = "Accueil • Ecole Directe Plus";
    }, [])

    useEffect(() => {
        const controller = new AbortController();
        if (isLoggedIn && grades === undefined) {
            getGrades(null, controller);
        }

        return () => {
            controller.abort();
        }
    }, [grades, isLoggedIn]);

    useEffect(() => {
        const controller = new AbortController();
        if (isLoggedIn && homeworks === undefined) {
            getHomeworks(controller);
        }

        return () => {
            controller.abort();
        }
    }, [homeworks, isLoggedIn]);

    useEffect(() => {
        if (hashParameters.length > 2 && (hashParameters[2] === "s" && !selectedTask?.sessionContent)) {
            navigate(`${hashParameters[0]};${hashParameters[1]}`, { replace: true })
        }
    }, [location.hash])

    // JSX DISCODO
    return (
        <div id="dashboard">
            <WindowsContainer name="dashboard">
                <WindowsLayout direction="row" ultimateContainer={true}>
                    <WindowsLayout direction="column" growthFactor={2.5}>
                        <WindowsLayout direction="row">
                            <LastGrades />
                            <Window>
                                <WindowHeader onClick={() => navigate("../homeworks")}>
                                    <h2>Prochains devoirs surveillés</h2>
                                </WindowHeader>
                                <WindowContent className="upcoming-assignments-container">
                                    <UpcomingAssignments />
                                </WindowContent>
                            </Window>
                        </WindowsLayout>

                        <Window growthFactor={1.7} className="notebook-window">
                            <WindowHeader onClick={() => navigate("../homeworks")}>
                                <h2>Cahier de texte</h2>
                            </WindowHeader>
                            <WindowContent id="notebook">
                                <Notebook hideDateController={!isTabletLayout} />
                            </WindowContent>
                        </Window>
                    </WindowsLayout>
                    <WindowsLayout>
                        <Window WIP={true}>
                            <WindowHeader onClick={() => navigate("../timetable")}>
                                <h2>Emploi du temps</h2>
                            </WindowHeader>
                            <WindowContent>

                            </WindowContent>
                        </Window>
                    </WindowsLayout>
                </WindowsLayout>
            </WindowsContainer>
            {(hashParameters.length > 2 && hashParameters[2] === "s" && selectedTask) && <BottomSheet heading="Contenu de séance" onClose={() => { navigate(`${hashParameters[0]};${hashParameters[1]}`, { replace: true }) }}>
                <EncodedHTMLDiv>{selectedTask.sessionContent}</EncodedHTMLDiv>
            </BottomSheet>}
            {(hashParameters.length > 2 && hashParameters[2] === "f" && selectedTask) && <PopUp className="task-file-pop-up" onClose={() => { navigate(`${hashParameters[0]};${hashParameters[1]}`, { replace: true }) }}>
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
            </PopUp>}
        </div>
    )
}