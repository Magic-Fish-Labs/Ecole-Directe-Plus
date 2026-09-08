
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import BottomSheet from "./PopUps/BottomSheet";
import Copyleft from "../graphics/Copyleft"

import "./Policy.css";


export default function Policy({ onCloseNavigateURL }) {
    const navigate = useNavigate();

    // randomize the appariton order of the lead developpers (credits)
    const leadDeveloppers = [<a href="https://github.com/saumon-brule">Saumon Brulé</a>, <a href="https://github.com/truiteseche">Truite Séchée</a>];
    const [firstLeadDeveloppersDisplayedIdx, setFirstLeadDevelopperDisplayedIdx] = useState(Math.floor(Math.random() * 2));

    const legalNotice = <ul id="legal-notice">
        <h3 className="part-header">Politique de confidentialité</h3>
        <h4 className="sub-header">Résumé</h4>
        <ul>
            <p className="legal-content"><span id="info-emoji">ℹ️</span> Ecole Directe Plus n'est en aucun cas affilié à EcoleDirecte ou Aplim, il s'agit d'un service indépendant libre et open source.</p>
            <p className="legal-content">✅ Ecole Directe Plus ne collecte aucune information sur les utilisateurs du service.</p>
            <p className="legal-content">✅ Ecole Directe Plus ne crée pas de compte lors de la connexion, la connexion a lieu sur les serveurs d'Aplim. Autrement dit, nous ne STOCKONS PAS les identifiants des utilisateurs se connectant.</p>
            <p className="legal-content">✅ Ecole Directe Plus ne permet, ni ne prétend donner accès à des données auxquelles l'élève n'a pas accès, incluant, mais ne se limitant pas aux : points aux examens* et au rang de l'élève*.</p>
            <p className="legal-content"><span id="info-emoji">ℹ️</span> Les seules données collectées le sont par Aplim (<a className="external-link" href="https://www.ecoledirecte.com" target="_blank">EcoleDirecte</a>) conformément à leur politique de confidentialité décrite dans leurs <a className="external-link" href="https://www.ecoledirecte.com/login" target="_blank">Mentions Légales.</a></p>
            <p className="legal-content">*Si l'accès à ces données est possible par l'utilisateur sur la plateforme officielle d'EcoleDirecte, ces données peuvent être affichées sur Ecole Directe Plus. Par ailleurs, si les moyennes de l'utilisateur ne sont pas disponibles, elles seront calculées, mais ce de façon locale sur l'appareil du client, les informations ne sont PAS transmises à nos serveurs.</p>
        </ul>
        <hr className="light-hr" />
        <h4 className="sub-header">Ecole Directe Plus est un service non-affilié utilisant des données fournies par <a href="https://www.ecoledirecte.com" target="_blank">EcoleDirecte</a>, héritant ainsi de leurs mentions légales qui sont présentées ci-dessous :</h4>
        <li className="legal-content">Les données personnelles sécurisées figurant sur ce site Internet concernent des élèves et les familles, et sont fournies par le logiciel Charlemagne des établissements scolaires au sein desquels ceux-ci sont scolarisés.</li>
        <li className="legal-content">EcoleDirecte ne collecte aucune donnée personnelle directement sur le site Internet, ni cookie, à l’exception des email et téléphone mobile, utilisés EXCLUSIVEMENT pour la récupération des identifiants.</li>
        <li className="legal-content">Ces établissements scolaires se sont engagés à apporter tous leurs soins dans la qualité des informations diffusées. Il s’agit toutefois d’indications qui, en aucun cas, ne pourraient faire foi en lieu et place des documents usuels (bulletins de notes, relevés de notes, relevés d’absences et de sanctions).</li>
        <li className="legal-content">Ces informations ne sont disponibles qu’après saisie d’un mot de passe fourni exclusivement par l’établissement soit au responsable juridique de l’élève s’il est mineur, soit à l’élève lui même s’il est majeur. Le détenteur d’un mot de passe ne peut accéder qu’aux seules informations le concernant lui ou les personnes dont il est responsable juridiquement.</li>
        <li className="legal-content">Pour optimiser la confidentialité de vos consultations, nous vous conseillons de choisir un mot de passe sécurisé. Le site internet et ses données associées sont hébergés sur des serveurs situés sur le territoire français.</li>
        <li className="legal-content">La société APLIM, hébergeur du site, s’engage dans tous les cas à ne pas utiliser, louer, vendre, céder ou mettre à disposition d’un tiers à fin d’autres usages le contenu du présent site Internet.</li>
        <li className="legal-content">Les données présentes sur ce site pourront être divulguées en application d'une loi, d'un règlement ou en vertu d'une décision d'une autorité réglementaire ou judiciaire compétente ou encore, si cela s'avère nécessaire, aux fins de maintenance, par l'éditeur ou l’établissement scolaire.</li>
        <li className="legal-content">Le responsable du traitement de ces données est l’établissement scolaire qui a procédé à leur saisie. Le responsable de leur sécurisation sur notre plateforme EcoleDirecte en qualité de sous-traitant est : Société Aplim ZA Les Côtes 73190 Saint Jeoire Prieuré, rgpd@aplim.fr.</li>
        <li className="legal-content">En application des articles 15, 16, 17 et 18 du Règlement du Parlement européen et du Conseil du 27 avril 2016, et de la Loi n° 78-17 du 6 janvier 1978 relative à l'informatique, aux fichiers et aux libertés, vous disposez d'un droit d'accès, de rectification, d'effacement des données collectées, et d'un droit de limitation du traitement des données personnelles que vous pouvez exercer auprès du responsable du traitement (à savoir l’établissement scolaire responsable du traitement) qui nous répercutera votre demande à fins d’exécution sur le site EcoleDirecte.</li>
        <li className="legal-content">En toute hypothèse, il vous est possible d'introduire une réclamation auprès de la Commission Nationale de l'Informatique et des Libertés si vous vous estimez lésé par le traitement de vos données personnelles par l’établissement scolaire.</li>
        <li className="legal-content">L'activation de l'amélioration de l'accessibilité des personnes déficientes visuelles utilise la police de caractères <a className="external-link" href="https://luciole-vision.com/" target="_blank">Luciole</a>. Cette police de caractères est distribuée gratuitement sous Licence publique <a className="external-link" href="https://creativecommons.org/licenses/by/4.0/legalcode.fr" target="_blank">Creative Commons Attribution 4.0 International</a> : Luciole © Laurent Bourcellier & Jonathan Perez</li>
        <hr />
        <h3 className="part-header" >Conditions d'utilisations</h3>
        <h4 className="sub-header">1. Général</h4>
        <li className="legal-content">Les noms et pronoms "Ecole Directe Plus", "EDP", "service", "Nous", "Notre/Nos" renvoient au service Ecole Directe Plus (non-affilié) proposé par le groupuscule Magic-Fish. L'accès et l'utilisation du service Ecole Directe Plus est l'objet de ces présentes conditions d'utilisations. En accédant ou utilisant n'importe quelle partie de l'application, vous déclarez avoir lu, compris, et accepté ces présentes mentions légales.</li>
        <h4 className="sub-header">2. Description du site et du service</h4>
        <li className="legal-content">Ecole Directe Plus a pour objectif d'offrir à ses utilisateurs un cadre agréable à la consultation des données scolaires. Ecole Directe Plus se réserve le droit, à sa seule discrétion et à n'importe quel moment, de mettre à jour, modifier, suspendre, apporter des améliorations ou interrompre tout aspect du service, temporairement ou définitivement.</li>
        <h4 className="sub-header">3. Usages acceptables du service</h4>
        <li className="legal-content">Vous êtes responsable de votre usage du service, et des manipulations faite avec votre compte. Notre objectif est de fournir un service agréable, utile, et sécurisé pour tous les utilisateurs. Pour parvenir à cet objectif, nous condamnons tout comportement malveillant pouvant être offensant envers d'autres utilisateurs ou envers l'équipe d'EDP. Par ailleurs, bien que nous ayons pour objectif d'offrir à nos utilisateurs un service toujours plus complet et fiable, l'usage d'Ecole Directe Plus ne se substitue en aucun cas entièrement à celui d'EcoleDirecte, notamment en ce qui concerne des fonctionnalités avancées telles que les QCM, les visio-conférences, la vie de la classe, et toute autre fonctionnalité encore indisponible sur EDP. Il est ainsi déconseillé de faire usage exclusivement d'Ecole Directe Plus.</li>
        <h4 className="sub-header">4. Connexion</h4>
        <li className="legal-content">En vous connectant à Ecole Directe Plus avec votre compte EcoleDirecte, vous donnez au site EDP (localement, seulement chez le client) l'accès aux données concernant votre compte via l'API d'EcoleDirecte. Pour garantir la confidentialité de vos informations, nous NE partagons PAS à des fins commerciales, NI ne stockons dans des serveurs, vos données personnelles. Les seules données stockées le sont par Aplim (EcoleDirecte). En outre, vous êtes le seul responsable de l'usage qu'il est fait de vos données.</li>
        <h4 className="sub-header">5. Retour utilisateur</h4>
        <li className="legal-content">La page de retour permet aux utilisateurs de signaler des dysfonctionnements, faire des suggestions, partager un retour d'expérience ou un avis général. Cette page nous permet d'améliorer notre service, le bénéficiaire étant l'utilisateur final. En soumettant le formulaire de retour, vous acceptez de partager une partie de vos informations avec Ecole Directe Plus.</li>
        <h4 className="sub-header">6. Liens, sites et services tiers</h4>
        <li className="legal-content">Le service peut contenir des liens vers des sites Web tiers, des services, ou d'autres événements ou activités qui ne sont ni détenus ni contrôlés par Ecole Directe Plus. Nous n'approuvons ni n'assumons aucune responsabilité pour ces sites, informations, matériaux, ou services tiers. Si vous accédez à un site Web, un service ou un contenu tiers d'Ecole Directe Plus, vous comprenez que ces conditions générales et notre politique de confidentialité ne s'appliquent pas à votre utilisation de ces sites. Vous reconnaissez et acceptez expressément qu'Ecole Directe Plus ne sera pas responsable, directement ou indirectement, de tout dommage ou perte résultant de votre utilisation de tout site Web, service ou contenu tiers.</li>
        <h4 className="sub-header">7. Résiliation</h4>
        <li className="legal-content">Ecole Directe Plus peut résilier votre accès et votre utilisation du service à tout moment, pour quelque raison que ce soit, et à ce moment-là, vous n'aurez plus le droit d'utiliser le service. Attention, même si vous n'avez plus accès à EDP, cela ne signifie pas que votre accès à EcoleDirecte ait été résilié, les deux sites étant des entitées indépendantes.</li>
        <hr />
        <h3 className="part-header">Crédits</h3>
        <li className="legal-content">Ecole Directe Plus est l'initiative du groupuscule Magic-Fish :<br /><br />
            Développeurs principaux :<br />
            - {leadDeveloppers[firstLeadDeveloppersDisplayedIdx]}<br />
            - {leadDeveloppers[leadDeveloppers.length - firstLeadDeveloppersDisplayedIdx - 1]}<br /><br />

            Autres contributeurs :<br />
            - <a href="https://github.com/akash02ab">akash02ab</a><br />
            - <a href="https://github.com/OeildeLynx31">OeildeLynx31</a><br />
            - <a href="https://github.com/Fefedu973">Fefedu973</a><br />
            - <a href="https://github.com/Beta-Way">Beta-Way</a><br />
            - <a href="https://github.com/xav35000">xav35000</a><br />
            - <a href="https://github.com/Vooxify">Vooxify</a><br />
            - <a href="https://github.com/Ewalwi">Ewalwi</a><br />
            - <a href="https://github.com/vexcited">Vexcited</a><br />
            - <a href="https://github.com/misieur">misieur</a><br />
            - <a href="https://github.com/FU0X0">FU0X0</a><br />
            - <a href="https://github.com/AldessScratch">Aldess</a><br />
            - <a href="https://github.com/M6a5x98">M6a5x98 </a><br />
            <br />
            APIs et services tiers :<br />
            - EcoleDirecte<br />
            - ImgBB<br />
            - Discord Webhooks<br /><br />

            Dépendances :<br />
            - React<br />
            - React Router<br />
            - Floating UI<br />
            - CryptoJS<br />
            - UUID<br />
            - Body Scroll Lock<br />
            - React Content Loader<br /><br />

            Testeurs de pré-lancement :<br />
            - Thon Humide<br />
            - Jackp0t<br /><br />

            Remerciements spéciaux :<br />
            - Thon Humide<br />
            - Jackp0t<br />
            - Nickro_01290<br />
            - Cthyllax<br />
            - EcoleDirecte Neptunium<br />
            - <b>Internet</b><br />
        </li>
        <li className="legal-content">Curieux et motivé ? Rejoignez nous et participez au développement d'Ecole Directe Plus à travers le <a className="external-link" href="https://github.com/Magic-Fishes/Ecole-Directe-Plus" target="blank">dépôt Github</a>.</li>
        <li className="legal-content">Rencontrez la communauté d'Ecole Directe Plus en rejoignant le <a className="external-link" href="https://discord.gg/AKAqXfTgvE" target="blank">serveur Discord</a>.</li>
        <hr />
        <h3 className="part-header">License (MIT)</h3>
        <li className="legal-content">Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

            The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

            The Software is provided “as is”, without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders X be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the Software.</li>
        <li className="legal-content" style={{ listStyle: "none", marginBlock: "20px 2px" }}>Dernière révision le 12 octobre 2024</li>
        <li className="legal-content" style={{ listStyle: "none", marginBlock: "2px 20px" }}>Nous contacter : <a href="mailto:contact@ecole-directe.plus" style={{ color: "rgb(var(--text-color-alt))" }} >contact@ecole-directe.plus</a></li>
        <li id="copyleft-container">Copyleft <Copyleft id="copyleft" alt="Copyleft" width="13" height="13" /> {new Date().getFullYear()} Ecole Directe Plus</li>
    </ul>


    const handleClose = (navigateURL) => {
        navigate(navigateURL, { replace: true });
    }

    return (
        <BottomSheet heading="Mentions légales" onClose={() => handleClose(onCloseNavigateURL)} >{legalNotice}</BottomSheet>
    )
}
