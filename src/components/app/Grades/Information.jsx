
import { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ContentLoader from "react-content-loader";
import { capitalizeFirstLetter, decodeBase64 } from "../../../utils/utils";

import { AppContext, SettingsContext, UserDataContext } from "../../../App";

import {
    Window,
    WindowHeader,
    WindowContent
} from "../../generic/Window";
import {
    BadgePlusInfo,
    BadgeStarInfo,
    BadgeCheckInfo,
    BadgeStonkInfo,
    BadgeStreakInfo,
    BadgeMehInfo,
} from "../../generic/badges/BadgeInfo"

// graphics
import CanardmanSearching from "../../graphics/CanardmanSearching";
import DownloadIcon from "../../graphics/DownloadIcon";
import LoadingAnimation from "../../graphics/LoadingAnimation";
import ExpandIcon from "../../graphics/ExpandIcon";
import ReduceIcon from "../../graphics/ReduceIcon";

import "./Information.css";

function findGradesObjectById(list, value) {
    if (value === "") {
        return "none"
    }
    let targetedObject = Object.values(list).find((el) => el.id === value)
    if (targetedObject) {
        return targetedObject;
    } else {
        return list.map((subject) => {
            if (!subject.isCategory) {
                return subject.grades
            } else {
                return []
            }
        }).flat().find((el) => {
            return el.id === value;
        }) // Pour chaque matière, on regarde si c'est pas une catégorie puis on return la liste des notes si c'est pas le cas, ensuite on utilise .flat() pour faire de la liste de liste une seule liste
    }
}

export default function Information({ ...props }) {
    const { isTabletLayout, usedDisplayTheme } = useContext(AppContext);

    const {
        grades: { value: grades },
        activePeriod: { value: activePeriod },
        gradesEnabledFeatures: { value: gradesEnabledFeatures }
    } = useContext(UserDataContext);

    const settings = useContext(SettingsContext);
    const { displayMode, isStreamerModeEnabled } = settings.user;

    const location = useLocation();
    const navigate = useNavigate();

    const [isCorrectionLoading, setIsCorrectionLoading] = useState(false);
    const [isSubjectLoading, setIsSubjectLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const isDisplayModeQuality = displayMode === "quality";

    let selectedElement = isNaN(parseInt(location.hash.slice(1))) ? undefined : "loading";
    if (grades && grades[activePeriod]) {
        selectedElement = findGradesObjectById(Object.values(grades && grades[activePeriod].subjects), location.hash.slice(1));
    }

    return (
        <Window className="information" growthFactor={(isExpanded && !["none", undefined].includes(selectedElement)) ? 2 : 1} {...props} >
            <WindowHeader>
                <h2>Informations</h2>
                {!isTabletLayout && <button className="expand-reduce-button" onClick={() => setIsExpanded((old) => !old)} style={{ display: (["none", undefined].includes(selectedElement) ? "none" : "") }}>{isExpanded ? <ReduceIcon /> : <ExpandIcon />}</button>}
                <button className="clear-button" onClick={() => { navigate("#"); setIsExpanded(false) }} style={{ display: (["none", undefined].includes(selectedElement) ? "none" : "") }}>✕</button>
            </WindowHeader>
            <WindowContent>
                {selectedElement === "loading" ? <div className="element-information">
                    <div className="grade-zone">
                        {
                            Array.from({ length: 4 }, (_, index) => <div key={crypto.randomUUID()}>
                                <ContentLoader
                                    animate={isDisplayModeQuality}
                                    speed={1}
                                    backgroundColor={usedDisplayTheme === "dark" ? "#63638c" : "#9d9dbd"}
                                    foregroundColor={usedDisplayTheme === "dark" ? "#7e7eb2" : "#bcbce3"}
                                    height="20"
                                    style={{ width: "70%" }}
                                >
                                    <rect x="0" y="0" rx="5" ry="5" style={{ width: "100%", height: "100%" }} />
                                </ContentLoader>
                                <ContentLoader
                                    animate={isDisplayModeQuality}
                                    speed={1}
                                    backgroundColor={'#4b48d9'}
                                    foregroundColor={'#6354ff'}
                                    height="35"
                                    style={{ width: "100%" }}
                                >
                                    <rect x="0" y="0" rx="10" ry="10" style={{ width: "100%", height: "100%" }} />
                                </ContentLoader>
                            </div>)
                        }
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <ContentLoader
                            animate={isDisplayModeQuality}
                            speed={1}
                            backgroundColor={'#7e7eab7F'}
                            foregroundColor={'#9a9ad17F'}
                            height="10"
                            style={{ width: "100px" }}
                        >
                            <rect x="0" y="0" rx="3" ry="3" style={{ width: "100%", height: "100%" }} />
                        </ContentLoader>
                    </div>
                    <hr />
                    <div className="info-zone" style={{ paddingBottom: "0" }}>
                        <div className="text">
                            <ContentLoader
                                animate={isDisplayModeQuality}
                                speed={1}
                                backgroundColor={usedDisplayTheme === "dark" ? "#63638c" : "#9d9dbd"}
                                foregroundColor={usedDisplayTheme === "dark" ? "#7e7eb2" : "#bcbce3"}
                                height="20"
                                style={{ maxWidth: "300px" }}
                            >
                                <rect x="0" y="0" rx="5" ry="5" style={{ width: "100%", height: "100%" }} />
                            </ContentLoader>

                            <ContentLoader
                                animate={isDisplayModeQuality}
                                speed={1}
                                backgroundColor={usedDisplayTheme === "dark" ? "#63638c" : "#9d9dbd"}
                                foregroundColor={usedDisplayTheme === "dark" ? "#7e7eb2" : "#bcbce3"}
                                height="20"
                                style={{ maxWidth: "200px" }}
                            >
                                <rect x="0" y="0" rx="5" ry="5" style={{ width: "100%", height: "100%" }} />
                            </ContentLoader>

                            <ContentLoader
                                animate={isDisplayModeQuality}
                                speed={1}
                                backgroundColor={usedDisplayTheme === "dark" ? "#63638c" : "#9d9dbd"}
                                foregroundColor={usedDisplayTheme === "dark" ? "#7e7eb2" : "#bcbce3"}
                                height="20"
                                style={{ maxWidth: "260px" }}
                            >
                                <rect x="0" y="0" rx="5" ry="5" style={{ width: "100%", height: "100%" }} />
                            </ContentLoader>
                        </div>
                    </div>
                </div> : ["none", undefined].includes(selectedElement) ? <div className="no-selected-grades">
                    <CanardmanSearching />
                    <p>Sélectionnez une note pour en voir les détails ici</p>
                </div> : selectedElement.elementType === "grade" ? <div className="element-information">
                    <div className="grade-zone">
                        <div>
                            <div className="number-name">Note</div>
                            <div className="number-value">{selectedElement.value.toString().replace(".", ",")}{isNaN(selectedElement.value) ? null : <sub>/{selectedElement.scale}</sub>}</div>
                        </div>
                        <div>
                            <div className="number-name">Moyenne</div>
                            <div className="number-value">{selectedElement.classAverage.toString().replace(".", ",")}{isNaN(selectedElement.classAverage) ? null : <sub>/{selectedElement.scale}</sub>}</div>
                        </div>
                        {gradesEnabledFeatures?.moyenneMin && <div> {/* Pour le bug de Label avec certaines notes ne contenant pas la moyenne min et max */}
                            <div className="number-name">Min</div>
                            <div className="number-value">{selectedElement.classMin.toString().replace(".", ",")}{isNaN(selectedElement.classMin) ? null : <sub>/{selectedElement.scale}</sub>}</div>
                        </div>}
                        {gradesEnabledFeatures?.moyenneMin && <div>
                            <div className="number-name">Max</div>
                            <div className="number-value">{selectedElement.classMax.toString().replace(".", ",")}{isNaN(selectedElement.classMax) ? null : <sub>/{selectedElement.scale}</sub>}</div>
                        </div>}
                    </div>
                    <p className="selected-coefficient">coefficient : {selectedElement.coef}{selectedElement.isSignificant ? "" : (selectedElement.isSimulated ? " (note simulée)" : " (non significatif)")}</p>
                    <hr className="information-hr" />
                    <div className="info-zone">
                        <div className="text">
                            <h4>{capitalizeFirstLetter(selectedElement.name)}</h4>
                            <p>{selectedElement.subjectName}</p>
                            {(selectedElement.type && <p>Type d'évaluation : {selectedElement.type}</p>)}
                            <p>Date : {(() => {
                                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                                return <time dateTime={selectedElement.date.toISOString()}>{selectedElement.date.toLocaleDateString("fr-FR", options)}</time>;
                            })()}</p>
                            {selectedElement.badges.length > 0 ? <div className="badges-zone">
                                <span>Badges :</span>
                                {selectedElement.badges.includes("star") && <BadgeStarInfo />}
                                {selectedElement.badges.includes("bestStudent") && <BadgePlusInfo />}
                                {selectedElement.badges.includes("greatStudent") && <BadgeCheckInfo />}
                                {selectedElement.badges.includes("stonks") && <BadgeStonkInfo />}
                                {selectedElement.badges.includes("meh") && <BadgeMehInfo />}
                                {selectedElement.badges.includes("keepOnFire") && <BadgeStreakInfo />}
                            </div> : null}
                        </div>
                        {/* Dcp on activera ca quand on gèrera les fichiers mais ca a l'air de bien marcher nv css (il manque peut-etre une border) */}
                        {(selectedElement.examCorrection || selectedElement.examSubject) && <div className="files">
                            {selectedElement.examSubject && <div className="file open-correction" role="button" onClick={async () => {
                                setIsSubjectLoading(true);
                                await selectedElement.examSubject.download();
                                setIsSubjectLoading(false)
                            }}>
                                {isSubjectLoading ? <LoadingAnimation className="download-loading-animation" /> : <DownloadIcon className="download-icon" />}
                                <span className="sub-text">Sujet</span>
                            </div>}
                            {selectedElement.examCorrection && <div className="file download-correction" role="button" onClick={async () => {
                                setIsCorrectionLoading(true);
                                await selectedElement.examCorrection.download();
                                setIsCorrectionLoading(false)
                            }}                                    >
                                {isCorrectionLoading ? <LoadingAnimation className="download-loading-animation" /> : <DownloadIcon className="download-icon" />}
                                <span className="sub-text">Correction</span>
                            </div>}
                        </div>}
                    </div>
                    {selectedElement.skill.map(el => [<hr key={crypto.randomUUID()} />, <div key={el.id} className="skill-container">
                        <span className="skill-text">
                            <p className="skill-name">{el.name}</p>
                            <p>{el.description}</p>
                        </span>
                        <span className="skill-value" style={{ "color": (usedDisplayTheme === "dark" ? (el.value === "Non atteint" ? "#FF0000" : el.value === "Partiellement atteint" ? "#FFC000" : el.value === "Atteint" ? "#0070C0" : el.value === "Dépassé" ? "#00B050" : "#FFF8") : (el.value === "Non atteint" ? "#F00" : el.value === "Partiellement atteint" ? "#DA8700" : el.value === "Atteint" ? "#0070C0" : el.value === "Dépassé" ? "#03a880" : "#0008")) }}>
                            {el.value}
                        </span>
                    </div>].flat())}
                </div> : <div className="element-information">
                    <div className="grade-zone">
                        <div>
                            <div className="number-name">Moyenne</div>
                            <div className="number-value">{selectedElement.average.toString().replace(".", ",")}{isNaN(selectedElement.average) ? null : <sub>/20</sub>}</div>
                        </div>
                        <div>
                            <div className="number-name">Classe</div>
                            <div className="number-value">{selectedElement.classAverage.toString().replace(".", ",")}{isNaN(selectedElement.classAverage) ? null : <sub>/20</sub>}</div>
                        </div>
                        {gradesEnabledFeatures?.moyenneMin && <div>
                            <div className="number-name">Min</div>
                            <div className="number-value">{selectedElement.minAverage.toString().replace(".", ",")}{isNaN(selectedElement.minAverage) ? null : <sub>/20</sub>}</div>
                        </div>}
                        {gradesEnabledFeatures?.moyenneMax && <div>
                            <div className="number-name">Max</div>
                            <div className="number-value">{selectedElement.maxAverage.toString().replace(".", ",")}{isNaN(selectedElement.maxAverage) ? null : <sub>/20</sub>}</div>
                        </div>}
                        {gradesEnabledFeatures?.rank && <div>
                            <div className="number-name">Rang</div>
                            <div className="number-value">{selectedElement.rank}</div>
                        </div>}
                    </div>
                    <p className="selected-coefficient">coefficient : {selectedElement.coef}</p>
                    <hr />
                    <div className="info-zone">
                        <div className="text">
                            <h4>{capitalizeFirstLetter(selectedElement.name)}</h4>
                            {selectedElement.teachers.map((teacher) => <address key={crypto.randomUUID()}>{isStreamerModeEnabled.value ? "M. -------" : teacher.nom}</address>)}
                            {selectedElement.appreciations
                                ? selectedElement.appreciations.map((appreciation) => {
                                    if (appreciation.length > 0) {
                                        return <p className="appreciation" key={crypto.randomUUID()}>{isStreamerModeEnabled.value ? "*Appréciation masquée*" : decodeBase64(appreciation)}</p>;
                                    }
                                })
                                : null
                            }

                            <div className="badges-zone">
                                {selectedElement.badges.star || selectedElement.badges.bestStudent || selectedElement.badges.greatStudent || selectedElement.badges.stonks || selectedElement.badges.meh || selectedElement.badges.keepOnFire ?
                                    <span>Badges :</span> : null}
                                {selectedElement.badges.star ? <span className="badge-value"><BadgeStarInfo /><span className="badge-number">{selectedElement.badges.star}</span></span> : null}
                                {selectedElement.badges.bestStudent ? <span className="badge-value"><BadgePlusInfo /><span className="badge-number">{selectedElement.badges.bestStudent}</span></span> : null}
                                {selectedElement.badges.greatStudent ? <span className="badge-value"><BadgeCheckInfo /><span className="badge-number">{selectedElement.badges.greatStudent}</span></span> : null}
                                {selectedElement.badges.stonks ? <span className="badge-value"><BadgeStonkInfo /><span className="badge-number">{selectedElement.badges.stonks}</span></span> : null}
                                {selectedElement.badges.meh ? <span className="badge-value"><BadgeMehInfo /><span className="badge-number">{selectedElement.badges.meh}</span></span> : null}
                                {selectedElement.badges.keepOnFire ? <span className="badge-value"><BadgeStreakInfo /><span className="badge-number">{selectedElement.badges.keepOnFire}</span></span> : null}
                            </div>
                            {/* {selectedElement.badges.length > 0 ? <div className="badges-zone">
                                <span>Badges :</span>
                                {selectedElement.badges.includes("star") && <BadgeStarInfo/>}
                                {selectedElement.badges.includes("bestStudent") && <BadgePlusInfo/>}
                                {selectedElement.badges.includes("greatStudent") && <BadgeCheckInfo/>}
                                {selectedElement.badges.includes("stonks") && <BadgeStonkInfo/>}
                                {selectedElement.badges.includes("meh") && <BadgeMehInfo/>}
                                {selectedElement.badges.includes("keepOnFire") && <BadgeStreakInfo/>}
                            </div> : null} */}
                        </div>
                    </div>
                </div>
                }
            </WindowContent>
        </Window>
    )
}