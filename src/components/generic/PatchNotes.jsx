import InfoPopUp from "./PopUps/InfoPopUp";
import { Link } from "react-router-dom";
import "./PatchNotes.css";

const contributors = [
    "saumon-brule",
    "TruiteSeche",
    "Vooxify",
    "Fefedu973",
    "FU0X0",
    "Ewalwi",
    "akash02ab",
    "Beta-Way",
    "xav35000",
    "misieur",
    "AldessScratch",
    "M6a5x98",
    "mTxBeN"
]

export default function PatchNotes({ currentEDPVersion, onClose }) {

    return (
        <div id="patch-notes">
            <InfoPopUp type="info" header={"Nouvelle mise à jour EDP ! 🎊 v" + currentEDPVersion} subHeader={"09 septembre 2026"} contentTitle={"Patch notes :"} onClose={onClose} >
                <div>
                    <hr />
                    <p className="first-paragraph">
                        Grande nouvelle pour fêter la rentrée 🥳
                    </p>
                    <h3 className="sub-header">Nouveautés</h3>
                    Après 1 an et demi sans mise à jour majeure, du fait d'une réécriture d'une partie du code d'EDP (encore en cours),
                    cette mise à jour introduit une fonctionnalité très attendue sur EDP :<br/>✨ l'emploi du temps ✨<br/> Vous pouvez profiter de cet emploi du temps enrichi de fonctionnalités de qualité de vie exclusives grâce à la contribution appréciée de <a href="https://github.com/mTxBeN" target="_blank">mTxBeN</a>.
                    {contributors && <>
                        <h3 className="sub-header">Contributeurs</h3>
                        {contributors.length > 1
                            ? contributors.reduce((acc, element, index) => {
                                if (index == 1) {
                                    return [
                                        <a className="contributor" href={`https://github.com/${acc}`} target="_blank">{acc}</a>,
                                        ", ",
                                        <a className="contributor" href={`https://github.com/${element}`} target="_blank">{element}</a>
                                    ]
                                } else {
                                    acc.push(", ");
                                    acc.push(<a className="contributor" href={`https://github.com/${element}`} target="_blank">{element}</a>);
                                    return acc;
                                }
                            })
                            : <a href={`https://github.com/${contributors[0]}`}>{contributors[0]}</a>
                        }
                    </>}
                    <h3 className="sub-header">Divers</h3>
                    <ul>
                        <li>Veuillez noter qu'Ecole Directe Plus est un service non-affilié à Aplim ou EcoleDirecte et est encore en cours de développement. Bénévolement, nous travaillons d'arrache-pied pour vous fournir la meilleure version possible du service.</li>
                        <li>Vous avez un problème ou avez rencontré un bug ? Vous pouvez nous partager votre expérience dans la page de feedback</li>
                        <li>Ecole Directe Plus a son propre <a href="https://discord.gg/AKAqXfTgvE" target="_blank">serveur Discord</a> ! Rejoignez le maintenant pour discuter avec les développeurs et tout le Canardman-Gang !</li>
                        <li>Découvrez le trailer d'annonce d'Ecole Directe Plus qui expose en quelques images les ambitions que nous avons pour ce projet en constante évolution :</li>
                        <iframe style={{ display: "block", margin: "0 auto", width: "100%", aspectRatio: "16/9" }} src="https://www.youtube.com/embed/E3mhS5UPNYk" title="Ecole Directe Plus • Trailer d&#39;annonce" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowFullScreen></iframe>
                    </ul>
                    {/* 
                    
                    <p className="first-paragraph">
                        Les messages c'est bien, mais les dossiers c'est mieux ! Non ? Eh bien on les a quand même fait pour vous.
                    </p>
                    <h3 className="sub-header">Nouveautés</h3>
                    <ul>
                        <li>L'onglet Messagerie permet maintenant d'organiser vos discussions dans <b>les dossiers de messages</b>. Vous pourrez créer, renommer et supprimer vos dossiers et y déplacer vos messages</li>
                        <li>C'est plutôt positif de connaître là où on excelle grâce aux points forts, et bien découvrez maintenant là où vous êtes le plus mauvais grâce aux <b>points faibles</b>. Une bonne occasion de s'améliorer !</li>
                        <li>Accédez dès maintenant à vos <b>documents administratifs</b> sur Ecole Directe Plus depuis la page de compte</li>
                        <li>Si votre école le permet, vous pourrez maintenant voir votre <b>rang</b> dans chaque matières</li>
                        <li>Les comptes <b>profs</b> sont maintenant compatibles avec EDP. Il y a maintenant un message spécial pour leur dire qu'il ne peuvent pas utiliser l'application 🤡</li>
                        <li>Le graphique sélectionné sera maintenant <b>sauvegardé</b> pour vos prochaines consultations</li>
                    </ul>
                    <h3 className="sub-header">Améliorations</h3>
                    <ul>
                        <li>Si vous avez installé la PWA EDP, elle s'ouvrira maintenant directement sur l'application (ou la page de connexion) et non sur la page d'accueil</li>
                        <li>Le message d'installation de l'extension sur mobile n'est plus</li>
                        <li>Amélioration du mode streamer</li>
                        <li>La limite de message récupéré par l'API est maintenant illimitée</li>
                        <li>Système de recherche de messages plus pertinent</li>
                        <li>L'intégration de l'extension avec le site a été améliorée</li>
                        <li>Le comportement responsive permet de gérer des écrans moins hauts</li>
                    </ul>
                    <h3 className="sub-header">Correction de bugs</h3>
                    <ul>
                        <li>Le problème du scroll horizontal de la page d'accueil sur mobile a été résolu</li>
                        <li>Les sous-matière n'étaient pas bien gérées lorsqu'elles n'avaient pas de coefficient</li>
                        <li>Les moyennes minimums et maximums des moyennes de la classe ne sont plus affichées dans le graphiques lorsqu'elles ne sont pas fournies</li>
                        <li>Les pop-ups de fichiers des devoirs du dashboard ne sont plus vides</li>
                        <li>Fix d'un crash causé par un hash invalide lors du clic sur le feedback sur la page des devoirs (solution temporaire)</li>
                    </ul>
                    
                    */}
                    {/* Nouvelle mise à jour EDP ! 🎊 v0.4.0
                    
                    <hr />
                    <p className="first-paragraph">
                        La messagerie fait son arrivée ! Vous pouvez dès à présent consulter les messages passionnants de vos profs et éducateurs sans aucune distraction.
                    </p>
                    <h3 className="sub-header">Nouveautés</h3>
                    <ul>
                        <li>L'onglet Messagerie est désormais disponible (lecture seule)</li>
                        <li>Vous pourrez désormais voir l'influence de chaque matières sur votre moyenne générale pour que vous puissiez identifier où vous devez vous améliorer</li>
                        <li>La moyenne générale de la classe est désormais calculée par EDP, prenant certains paramètres en compte afin de représenter votre niveau par rapport à votre classe avec plus de précision. Elle sera désormais affichée au survol de la moyenne générale</li>
                        <li>Dans le cahier de textes, l'affichage des tâches ayant uniquement un contenu de séance a été entièrement revu afin de se différencier nettement des devoirs</li>
                        <li>Scroller dans les devoirs en maintenant la souris conserve désormais l'inertie, comme sur mobile</li>
                        <li>Lorsque vous n'avez pas de note récente, la fenêtre "Dernières notes" affichera un placeholder</li>
                    </ul>
                    <h3 className="sub-header">Améliorations</h3>
                    <ul>
                        <li>Amélioration du rendu et de l'interface pour les utilisateurs mobiles</li>
                        <li>Amélioration du style des prochains contrôles</li>
                        <li>Amélioration du style des boutons de fichiers</li>
                        <li>Amélioration de style du cahier de texte en light mode</li>
                        <li>Le scroll dans le cahier de texte fera défiler les jours à l'horizontal au lieu de passer au prochain</li>
                        <li>Déplacement des boutons du calendrier. Shift + clic pour charger tous les devoirs depuis le jours cliqué et cliquer sur la date du cahier de texte pour revenir au prochains jour avc des dvoirs le plus proche</li>
                        <li>Affichage de toutes les dates en français peu importe votre localisation</li>
                        <li>Scroll dans la liste des prochains devoirs au lieu de modifier la taille quand la fenêtre est trop petite</li>
                    </ul>
                    <h3 className="sub-header">Correction de bugs</h3>
                    <ul>
                        <li>Les prochains devoirs seront chargés peu importe la date initialement séléctionnée</li>
                        <li>Supression d'un lien dans un lien causant un log d'erreur sur le login</li>
                        <li>Gestion du nouveau comportement de zoom avec les coordonées de la méthode getBoudingClientRect</li>
                        <li>Le rayement des prochains devoirs ne s'affichera plus après qu'une fenêtre ait été grab</li>
                    </ul>
                    <h3 className="sub-header">EDP sur mobile ? Sans extension ?</h3>
                    <p>
                        EDP revient en force sur mobile, un nouveau système rend possible l'accès aux données de EcoleDirecte sans utiliser l'extension ce qui permet une utilisation sans restriction sur mobile. Cette solution est toutefois expérimentale et pourrait être bloquée c'est pourquoi l'extension est toujours nécessaire sur PC pour le moment (Cette dernière a d'ailleurs reçu une récente mise-à-jour comprenant quelques correctif). 
                    </p>
                    {contributors && <>
                        <h3 className="sub-header">Contributeurs</h3>
                        {contributors.length > 1
                            ? contributors.reduce((acc, element, index) => {
                                if (index == 1) {
                                    return [
                                        <a className="contributor" href={`https://github.com/${acc}`} target="_blank">{acc}</a>,
                                        ", ",
                                        <a className="contributor" href={`https://github.com/${element}`} target="_blank">{element}</a>
                                    ]
                                } else {
                                    acc.push(", ");
                                    acc.push(<a className="contributor" href={`https://github.com/${element}`} target="_blank">{element}</a>);
                                    return acc;
                                }
                            })
                            : <a href={`https://github.com/${contributors[0]}`}>{contributors[0]}</a>
                        }
                    </>}
                    <h3 className="sub-header">Divers</h3>
                    <ul>
                        <li>Veuillez noter qu'Ecole Directe Plus est un service non-affilié à Aplim ou EcoleDirecte et est encore en cours de développement. Bénévolement, nous travaillons d'arrache-pied pour vous fournir la meilleure version possible du service.</li>
                        <li>Vous avez un problème ou avez rencontré un bug ? Vous pouvez nous partager votre expérience dans la nouvelle page de feedback</li>
                        <li>Ecole Directe Plus a son propre <a href="https://discord.gg/AKAqXfTgvE" target="_blank">serveur Discord</a> ! Rejoignez le maintenant pour discuter avec les développeurs et tout le Canardman-Gang !</li>
                        <li>Découvrez le trailer d'annonce d'Ecole Directe Plus qui expose en quelques images les ambitions que nous avons pour ce projet en constante évolution :</li>
                        <iframe style={{ display: "block", margin: "0 auto", width: "100%", aspectRatio: "16/9" }} src="https://www.youtube.com/embed/E3mhS5UPNYk" title="Ecole Directe Plus • Trailer d&#39;annonce" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowFullScreen></iframe>
                    </ul> */}
                    {/* ---Enfin la rentrée ! 🎉🤡 --- v0.3.1
                    
                    <hr />
                    <p className="first-paragraph">
                        Les vacances laissent subitement place aux heures de Maths et de Français, mais pas de panique, Ecole Directe Plus reste avec vous cette année !
                    </p>
                    <h3 className="sub-header">Revue de l'année</h3>
                    <p>L'année scolaire précédente a été très riche et mouvementée pour EDP. D'un côté, malgré une fréquentation record du site de la part des parents et élèves, les sorties de nouvelles fonctionnalités ont été perturbées par les restrictions imposées par l'API d'EcoleDirecte. Toutefois, la solution pour laquelle nous avons opté, l'adoption de l'extension EDP Unblock, nous a permis d'entrevoir un avenir plus stable et durable pour EDP, permettant notamment l'arrivée du très attendu Cahier de texte. Nous espérons que l'année scolaire qui s'ouvre à nous sera plus propice au développement des dernières fonctionnalités très attendues comme l'emploi du temps et la messagerie... Pour le moment, voici une petite mise à jour pour ne pas vous laisser sans rien à vous mettre sous la dent :</p>
                    <h3 className="sub-header">Nouveautés</h3>
                    <ul>
                        <li>EDP s'est refait une beauté avec une <Link to="/">page d'accueil</Link> qui expose en quelques points les fonctionnalités et avantages d'EDP, ainsi que son aspect communautaire. Faîtes découvrir EDP à votre entourage via cette page, la connexion avec un compte EcoleDirecte n'est pas requise</li>
                        <li>Débloquer le niveau hardcore de l'organisation avec une vue d'ensemble de vos prochains devoirs et contrôles grâce à la nouvelle section "Calendrier" du Cahier de texte</li>
                        <li>Vous voulez prendre un screen sur EDP en vous assurant de ne divulguer aucune d'information personnelle ? Activez le mode streamer dans les paramètres</li>
                    </ul>
                    <h3 className="sub-header">Correction de bugs</h3>
                    <ul>
                        <li>Correction d'un bug sur la page de connexion affectant les utilisateurs ayant un mot de passe contenant certains caractères spéciaux</li>
                        <li>Correction d'un bug causant le crash d'EDP lorsque l'URL était modifiée manuellement sur certaines pages</li>
                        <li>Corrections de bugs liés à la navigation dans le cahier de texte</li>
                        <li>Correction d'un bug qui rend impossible la récupération des fichiers d'un devoir si le contenu de séance est vide</li>
                        <li>Correction d'un bug lorsqu'un devoir n'est composé que du contenu de séance</li>
                        <li>Amélioration de la gestion des matières composées de sous-matières</li>
                    </ul>
                    {contributors && <>
                        <h3 className="sub-header">Contributeurs</h3>
                        {contributors.length > 1
                            ? contributors.reduce((acc, element, index) => {
                                if (index == 1) {
                                    return [
                                        <a className="contributor" href={`https://github.com/${acc}`}>{acc}</a>,
                                        ", ",
                                        <a className="contributor" href={`https://github.com/${element}`}>{element}</a>
                                    ]
                                } else {
                                    acc.push(", ");
                                    acc.push(<a className="contributor" href={`https://github.com/${element}`}>{element}</a>);
                                    return acc;
                                }
                            })
                            : <a href={`https://github.com/${contributors[0]}`}>{contributors[0]}</a>
                        }
                    </>}
                    <h3 className="sub-header">{"Petit mot des développeurs <3"}</h3>
                    <p>Nous, Truite Séchée et Saumon Brûlé, les créateurs d'Ecole Directe Plus, avons décroché notre baccalauréat et en avons fini avec le lycée. Nous voilà alors lancés dans le monde des études supérieures. Par conséquent, le temps que nous pourrons dédier à EDP sera plus restreint, malgré notre bonne volonté. Heureusement, EDP est un projet communautaire, et peut compter sur sa communauté de développeurs passionnés pour faire avancer le projet pas à pas. Si vous souhaitez faire partie de l'aventure, rejoignez directement l'équipe de développement via le serveur Discord et le dépôt Github, pour continuer à faire vivre EDP, un service pensé <b>par et pour les élèves.</b></p>
                    <h3 className="sub-header">Divers</h3>
                    <ul>
                        <li>Veuillez noter qu'Ecole Directe Plus est un service non-affilié à Aplim ou EcoleDirecte et est encore en cours de développement. Bénévolement, nous travaillons d'arrache-pied pour vous fournir la meilleure version possible du service.</li>
                        <li>Vous avez un problème ou avez rencontré un bug ? Vous pouvez nous partager votre expérience dans la nouvelle page de feedback</li>
                        <li>Ecole Directe Plus a son propre <a href="https://discord.gg/AKAqXfTgvE" target="_blank">serveur Discord</a> ! Rejoignez le maintenant pour discuter avec les développeurs et tout le Canardman-Gang !</li>
                        <li>Découvrez le trailer d'annonce d'Ecole Directe Plus qui expose en quelques images les ambitions que nous avons pour ce projet en constante évolution :</li>
                        <iframe style={ { display: "block", margin: "0 auto", width: "100%", aspectRatio: "16/9" } } src="https://www.youtube.com/embed/E3mhS5UPNYk" title="Ecole Directe Plus • Trailer d&#39;annonce" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowFullscreen></iframe>
                    </ul> */}

                    {/* <hr />
                    <p className="first-paragraph">
                        Canardman va enfin pouvoir se mettre au travail ! Après une longue attente, nous sommes impatients de vous faire découvrir des fonctionnalités attendues :
                        </p>
                        <h3 className="sub-header">Nouveautés</h3>
                    <li>Le cahier de texte est enfin là ! Canardman n'aura plus d'excuse pour ne pas faire ses devoirs</li>
                    <li>Page de retour : votre navigateur et système d'exploitation seront automatiquement détectés, vous n'aurez plus à vous en soucier</li>
                    <li>L'accueil, vous vous en souvenez ? Ça sera désormais la page principale. Retrouvez-y un résumé clair et concis de ce qui compte vraiment</li>
                    <li>Faire ses devoirs ne sera plus jamais ennuyeux grâce à l'incroyable explosion de confetti qui accompagne la complétion de chaque tâche (pas sûr de celle ça)</li>
                    <li>Vous vous faîtes surprendre par chacun de vos devoirs surveillés ? Cette situation gênante n'arrivera PLUS JAMAIS car vous bénéficierez d'un aperçu rapide des prochains contrôles</li>
                    <h3 className="sub-header">Correction de bugs</h3>
                    <ul>
                    <li>Correction d'un bug bloquant dû à l'absence de coefficient</li>
                        <li>Gestion des barêmes à virgule</li>
                        <li>Intégration de l'authentification à deux facteurs mise en place par ED pour assurer la sécurité des comptes</li>
                        <li>Mise à jour des mentions légales pour plus de transparence</li>
                        <li>Amélioration de la gestion des Checkbox</li>
                        <li>Correction d'un bug d'affichage sur les volets "Évaluations" et "Graphique" sur Firefox</li>
                        <li>Amélioration de la navigation au clavier</li>
                        <li>Ajout d'une animation de chargement du contenu sur les "Dernières Notes"</li>
                        </ul>
                        <h3 className="sub-header">Divers</h3>
                        <li>Veuillez noter qu'Ecole Directe Plus est un service non-affilié à Aplim ou EcoleDirecte et est encore en cours de développement. Bénévolement, nous travaillons d'arrache-pied pour vous fournir la meilleure version possible du service.</li>
                        <li>Vous avez un problème ou avez rencontré un bug ? Vous pouvez nous partager votre expérience dans la nouvelle page de feedback</li>
                        <li>Ecole Directe Plus a son propre <a href="https://discord.gg/AKAqXfTgvE" target="_blank">serveur Discord</a> ! Rejoignez le maintenant pour discuter avec les développeurs et tout le Canardman-Gang !</li>
                        <li>Découvrez le trailer d'annonce d'Ecole Directe Plus qui expose en quelques images les ambitions que nous avons pour ce projet en constante évolution :</li>
                        <iframe style={ { display: "block", margin: "0 auto", width: "100%", aspectRatio: "16/9" } } src="https://www.youtube.com/embed/E3mhS5UPNYk" title="Ecole Directe Plus • Trailer d&#39;annonce" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowFullscreen></iframe> */}

                    {/* <ul>

            v0.2.5
            <p className="first-paragraph">
                La version 0.2.5 est arrivée ! Cette mise à jour n'apporte certainement pas toutes les nouvelles fonctionnalités que vous auriez pu espérer. Toutefois, nous avons quelques nouveautés pour vous...
            </p>
            <h3 className="sub-header">Nouveautés</h3>
            <p>
                <p>Rencontrez la communauté et les développeurs d'Ecole Directe Plus en rejoignant le <a target="_blank" href="https://discord.gg/AKAqXfTgvE">serveur Discord</a> !</p>
                    <img src="/images/discord-v0.2.5-banner.png" id="discord-picture-new-version"/>
                    <details>
                        <summary>Plus d'informations</summary>
                        <p>
                        Nous avons récemment créé un serveur Discord communautaire pour Ecole Directe Plus. Vous pourrez y retrouver les autres adeptes d'EDP, discuter avec les développeurs, nous aider à corriger les bugs que vous rencontrez, etc.
                        Vous serez également aux premières loges en cas d'annonce importante. De plus, vous pourrez consulter les retours des utilisateurs et découvrir ce qu'ils pensent d'EDP.
                        Rejoignez le <span style={{ fontStyle: "italic"}}>Canardman-Gang</span> en <a href="https://discord.gg/AKAqXfTgvE" target="_blank">cliquant ici</a></p>
                    </details>
            </p>
            <br />
            <li>Ajout de boutons dans la catégorie "Informations" pour télécharger le sujet et la correction d'une évaluation s'ils sont disponibles.</li>
            <h3 className="sub-header">Améliorations</h3>
            <ul>
                <li>Un bouton a été ajouté pour vous permettre de montrer/cacher votre mot de passe dans le menu de connexion.</li>
                <li>Le scrolling a été amélioré sur mobile de sorte qu'il ne se bloque plus lors d'un clic sur l'en-tête d'une fenêtre.</li>
            </ul>
            <h3 className="sub-header">Correction de bugs</h3>
            <ul>
                <li>Vous avez été nombreux à nous signaler ce problème assez embarrassant : désormais, les comptes dont les matières avaient toutes un coefficient de 0 verront leur moyenne générale et de groupe de matière calculées correctement.</li>
                <li>Les notes notées "absent", "non-évalué", "dispensé", … n'affichent plus N/A.</li>
                <li>Les notes simulées ne sont plus considérées comme de nouvelles notes.</li>
                <li>Les graphiques s'adaptent mieux à la taille de l'écran de votre appareil.</li>
                <li>La période sélectionnée ne se réinitialise plus quand l'utilisateur change de page.</li>
                <li>Correction d'un bug causant une animation de chargement infinie.</li>
                <li>Correction d'un bug provoquant une infinité de ré-rendus de la page.</li>
                <li>Bug de la bottom sheet causant quelques glitch.</li>
                <li>Amélioration générale des performances et de la stabilité.</li>
            </ul>
            
            v0.2.3
            <hr />
            <p id="first-paragraph">
                Ecole Directe Plus est de retour ! Des changements relatifs à l'API d'Ecoledirecte ont causé de nombreux dysfonctionnements depuis le 14/11/2023. Nous nous excusons pour ce désagrément et avons fait preuve d'un maximum de réactivité pour rétablir le service au plus vite.
            </p>
            <h3 className="sub-header">Correction de bugs</h3>
            <ul>
                <li>Correction d'un bug majeur qui empêchait la connexion au compte ainsi que toute interaction avec l'API d'Ecoledirecte</li>
                <li>Correction d'un bug d'affichage sur les points forts</li>
            </ul>
            <h3 className="sub-header">Divers</h3>
            <li>Veuillez noter qu'Ecole Directe Plus est encore en cours de développement. Nous travaillons d'arrache-pied pour vous fournir la meilleure version possible du service.</li>
            <li>Vous avez un problème ou avez rencontré un bug ? Vous pouvez nous partager votre expérience dans la nouvelle page de feedback (tout type de retour est le bienvenu, nous sommes très curieux de connaître votre avis)</li>
            
            v0.2.1
            <p id="first-paragraph">
                Vous vous trouvez sur la toute première version officielle d'Ecole Directe Plus. En compagnie de Canardman, nous avons ajouté autant de fonctionnalités que possibles pour que votre confort soit maximal. Découvrez-les ici à chaque mise à jour du site.
            </p>
            <h3 className="sub-header">Nouveautés</h3>
            <ul>
                <li>Calcul automatique et instantané de la moyenne générale</li>
                <li>Un système de streak permettant de mesurer votre progression au fil des trimestres</li>
                <li>La possibilité de voir toutes ses notes sur le même barème</li>
                <li>Un système de badge pour flex sur votre nombre d'étoiles obtenues en cours d'Anglais</li>
                <li>Un thème clair et sombre dessiné par et pour de véritables artistes</li>
                <li>Un calcul de vos points forts afin d'identifier les matières où vous excellez</li>
                <li>La possibilité de rester connecté de manière stable et durable</li>
                <li>Et tant d'autres petits ajustements que nous vous laissons découvrir par vous-même...</li>
            </ul>

            v0.1.5
            <li>Nouveau menu de connexion avec l'option "rester connecté"</li>
            <li>Choix du thème d'affichage : sombre / clair</li>
            <li>Page de paramètres : modifiez vos paramètres pour ajuster votre expérience comme bon vous semble</li>
            <h3 className="sub-header">Page des notes :</h3>
            <li>Système de Score de Streak pour vous pousser à toujours vous améliorer</li>
            <li>Affichage de vos points forts</li>
            <li>Affichage clair et moderne des notes, avec informations complémentaires</li>
            <li>Nouveau système de badge sur chaque note</li>
            </ul>
            <h3 className="sub-header">Correction de bugs</h3>
            <ul>
            <li>Changement des placeholders des éléments en cours de développement car créaient des confusions</li>
            <li>Amélioration de l'accessibilité au clavier</li>
            <li>Correction d'un bug affectant le système de reconnexion automatique</li>
        </ul> */}
                </div>
            </InfoPopUp>
        </div>
    )
}
