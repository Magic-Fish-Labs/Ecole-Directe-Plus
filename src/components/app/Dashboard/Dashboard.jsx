
import { useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchGrades } from "../../../utils/requests/fetchFunctions";
import { AppContext } from "../../../App";

import {
    WindowsContainer,
    WindowsLayout,
    Window,
    WindowHeader,
    WindowContent
} from "../../generic/Window";
import LastGrades from "./LastGrades";
import Notebook from "../Homeworks/Notebook";
import BottomSheet from "../../generic/PopUps/BottomSheet";
import EncodedHTMLDiv from "../../generic/CustomDivs/EncodedHTMLDiv";
import UpcomingAssignments from "../Homeworks/UpcomingAssignments";
import PopUp from "../../generic/PopUps/PopUp";

import "./Dashboard.css";

export default function Dashboard({ fetchHomeworks, activeAccount, isLoggedIn, isTabletLayout }) {
    const { fetchData, useUserData, useUserSettings } = useContext(AppContext)

    const navigate = useNavigate();
    const location = useLocation()
    const userData = useUserData();
    const userSettings = useUserSettings();

    const grades = userData.get("grades");
    const fetchSchoolYear = userSettings.get("isSchoolYearEnabled") ? userSettings.get("schoolYear").join("-") : ""
    

    const homeworks = useUserData("sortedHomeworks");
    const hashParameters = location.hash.split(";")
    const selectedTask = hashParameters.length > 1 && homeworks.get() && homeworks.get()[hashParameters[0].slice(1)]?.find(e => e.id == hashParameters[1])
    // Behavior
    useEffect(() => {
        document.title = "Accueil • Ecole Directe Plus";
    }, [])

    useEffect(() => {
        const controller = new AbortController();
        if (isLoggedIn && grades === undefined) {
            fetchGrades(fetchData, fetchSchoolYear, controller).then(console.log);
        }

        return () => {
            controller.abort();
        }
    }, [grades, isLoggedIn, activeAccount]);

    useEffect(() => {
        const controller = new AbortController();
        if (isLoggedIn) {
            if (homeworks.get() === undefined) {
                fetchHomeworks(controller);
            }
        }

        return () => {
            controller.abort();
        }
    }, [homeworks.get(), isLoggedIn, activeAccount]);

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
                            <LastGrades activeAccount={activeAccount} />
                            {/* <Window WIP={true}>
                                <WindowHeader onClick={() => navigate("../grades")}>
                                    <h2>Dernière notes</h2>
                                </WindowHeader>
                                <WindowContent>
                                    
                                </WindowContent>
                            </Window> */}

                            <Window>
                                <WindowHeader onClick={() => navigate("../homeworks")}>
                                    <h2>Prochains devoirs surveillés</h2>
                                </WindowHeader>
                                <WindowContent className="upcoming-assignments-container">
                                    <UpcomingAssignments homeworks={homeworks} />
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
                <h2>Fichiers</h2>
                <div>{selectedTask.file}</div>
            </PopUp>}
        </div>
    )
}