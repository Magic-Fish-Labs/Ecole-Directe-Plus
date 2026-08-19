import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
    WindowsContainer,
    WindowsLayout,
    Window,
    WindowHeader,
    WindowContent
} from "../../generic/Window";
import LastGrades from "./LastGrades";
import StudentTools from "./StudentTools";
import Notebook from "../Homeworks/Notebook";
import BottomSheet from "../../generic/PopUps/BottomSheet";
import EncodedHTMLDiv from "../../generic/CustomDivs/EncodedHTMLDiv";
import UpcomingAssignments from "../Homeworks/UpcomingAssignments";
import PopUp from "../../generic/PopUps/PopUp";

import "./Dashboard.css";
import { formatDateRelative } from "../../../utils/date";
import FileComponent from "../../generic/FileComponent";

export default function Dashboard({ fetchUserGrades, grades, fetchHomeworks, activeAccount, isLoggedIn, useUserData, sortGrades, isTabletLayout }) {
    const navigate = useNavigate();
    const userData = useUserData();
    const location = useLocation();

    const sortedGrades = userData.get("sortedGrades");
    const selectedPeriod = userData.get("activePeriod");
    const homeworks = useUserData("sortedHomeworks");

    const hashParameters = location.hash.split(";");
    const selectedTask = hashParameters.length > 1 && homeworks.get() && homeworks.get()[hashParameters[0].slice(1)]?.find(e => e.id == hashParameters[1]);
    const showPatchNotes = location.hash === "#patch-notes";

    useEffect(() => {
        document.title = "Accueil • Ecole Directe Plus";
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        if (isLoggedIn) {
            if (grades.length < 1 || grades[activeAccount] === undefined) {
                fetchUserGrades(controller);
            } else if (!sortedGrades) {
                sortGrades(grades, activeAccount);
            }
        }
        return () => controller.abort();
    }, [grades, isLoggedIn, activeAccount]);

    useEffect(() => {
        const controller = new AbortController();
        if (isLoggedIn && homeworks.get() === undefined) {
            fetchHomeworks(controller);
        }
        return () => controller.abort();
    }, [homeworks.get(), isLoggedIn, activeAccount]);

    useEffect(() => {
        if (hashParameters.length > 2 && (hashParameters[2] === "s" && !selectedTask?.sessionContent)) {
            navigate(`${hashParameters[0]};${hashParameters[1]}`, { replace: true });
        }
    }, [location.hash]);

    return (
        <div id="dashboard">
            <WindowsContainer name="dashboard">
                <WindowsLayout direction="row" ultimateContainer={true}>
                    <WindowsLayout direction="column" growthFactor={2.5}>
                        <WindowsLayout direction="row">
                            <LastGrades activeAccount={activeAccount} />
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
                    <WindowsLayout growthFactor={1.35}>
                        <Window className="student-tools-window">
                            <WindowHeader>
                                <h2>Mes outils</h2>
                            </WindowHeader>
                            <WindowContent>
                                <StudentTools sortedGrades={sortedGrades} selectedPeriod={selectedPeriod} />
                            </WindowContent>
                        </Window>
                    </WindowsLayout>
                </WindowsLayout>
            </WindowsContainer>

            {showPatchNotes && <PopUp className="patch-notes-pop-up" onClose={() => navigate({ hash: "" }, { replace: true })}>
                <div className="patch-notes">
                    <div className="patch-notes-heading">
                        <span className="patch-notes-badge">ED+ STUDENT SUITE</span>
                        <h1>Patch notes</h1>
                        <p>Une grosse mise à jour centrée sur le suivi scolaire, la personnalisation et les outils utiles au quotidien.</p>
                    </div>

                    <section>
                        <h2>✨ Nouveautés</h2>
                        <ul>
                            <li><strong>Emploi du temps amélioré</strong> — vue hebdomadaire, navigation entre les semaines, horaires, matières, professeurs, salles et états des cours.</li>
                            <li><strong>Médiane des notes</strong> — disponible en complément de la moyenne pour mieux situer son niveau.</li>
                            <li><strong>Mon niveau</strong> — moyenne, médiane, streak quotidien et record regroupés sur l'accueil.</li>
                            <li><strong>Notes prévisionnelles</strong> — ajoute une note fictive, son barème et son coefficient pour estimer son impact sur la moyenne.</li>
                            <li><strong>Brevets blancs</strong> — enregistre les résultats de Français, Maths, Histoire-Géo/EMC, Sciences et Oral avec calcul automatique.</li>
                            <li><strong>Thèmes ED+</strong> — Classique, Vert, Rouge, Orange, Bleu, Violet et OLED, configurables depuis les paramètres.</li>
                            <li><strong>Mes outils</strong> — nouvel espace sur l'accueil afin de garder la page Notes claire.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>🛠️ Améliorations & corrections</h2>
                        <ul>
                            <li>Refonte et optimisation du moteur de calcul des notes et coefficients.</li>
                            <li>Correction de l'affichage des champs des brevets blancs.</li>
                            <li>Correction et réorganisation du sélecteur de thèmes dans Paramètres.</li>
                            <li>Amélioration du responsive pour les différentes tailles d'écran.</li>
                            <li>Nettoyage et découpage du code pour faciliter les prochaines évolutions.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>🧹 Changements</h2>
                        <p>Les prototypes QCM ED+ et Arcade ont été retirés afin de garder l'interface centrée sur les fonctionnalités scolaires utiles et suffisamment abouties.</p>
                    </section>
                </div>
            </PopUp>}

            {(hashParameters.length > 2 && hashParameters[2] === "s" && selectedTask) && <BottomSheet heading="Contenu de séance" onClose={() => { navigate(`${hashParameters[0]};${hashParameters[1]}`, { replace: true }); }}>
                <EncodedHTMLDiv>{selectedTask.sessionContent}</EncodedHTMLDiv>
            </BottomSheet>}
            {(hashParameters.length > 2 && hashParameters[2] === "f" && selectedTask) && <PopUp className="task-file-pop-up" onClose={() => { navigate(`${hashParameters[0]};${hashParameters[1]}`, { replace: true }); }}>
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
    );
}
