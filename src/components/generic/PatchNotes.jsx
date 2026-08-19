import InfoPopUp from "./PopUps/InfoPopUp";
import "./PatchNotes.css";

export default function PatchNotes({ currentEDPVersion, onClose }) {
    return (
        <div id="patch-notes">
            <InfoPopUp
                type="info"
                header={`ED+ Student Suite 🎓 v${currentEDPVersion}`}
                subHeader="19 Août 2026"
                contentTitle="Patch notes :"
                onClose={onClose}
            >
                <div>
                    <hr />
                    <p className="first-paragraph">
                        Une grosse mise à jour centrée sur le suivi scolaire, la personnalisation et les outils utiles au quotidien.
                    </p>

                    <h3 className="sub-header">✨ Nouveautés</h3>
                    <ul>
                        <li><b>Emploi du temps amélioré</b> — vue hebdomadaire, navigation entre les semaines, horaires, matières, professeurs et salles.</li>
                        <li><b>Médiane des notes</b> — disponible en complément de la moyenne pour mieux situer son niveau.</li>
                        <li><b>Mon niveau</b> — moyenne, médiane, streak quotidien et record regroupés sur l'accueil.</li>
                        <li><b>Notes prévisionnelles</b> — ajoute une note fictive, son barème et son coefficient pour estimer son impact sur la moyenne.</li>
                        <li><b>Brevets blancs</b> — enregistre les résultats de Français, Maths, Histoire-Géo/EMC, Sciences et Oral avec calcul automatique.</li>
                        <li><b>Thèmes ED+</b> — Classique, Vert, Rouge, Orange, Bleu, Violet et OLED, configurables depuis les paramètres.</li>
                        <li><b>Mes outils</b> — nouvel espace sur l'accueil afin de garder la page Notes claire.</li>
                    </ul>

                    <h3 className="sub-header">🛠️ Améliorations & corrections</h3>
                    <ul>
                        <li>Refonte et optimisation du moteur de calcul des notes et coefficients.</li>
                        <li>Correction de l'affichage des champs des brevets blancs.</li>
                        <li>Correction et réorganisation du sélecteur de thèmes dans Paramètres.</li>
                        <li>Amélioration du responsive pour les différentes tailles d'écran.</li>
                        <li>Nettoyage et découpage du code pour faciliter les prochaines évolutions.</li>
                    </ul>

                    <h3 className="sub-header">🧹 Changements</h3>
                    <p className="sub-paragraph">
                        Les prototypes QCM ED+ et Arcade ont été retirés afin de garder l'interface centrée sur les fonctionnalités scolaires utiles et suffisamment abouties.
                    </p>
                </div>
            </InfoPopUp>
        </div>
    );
}
