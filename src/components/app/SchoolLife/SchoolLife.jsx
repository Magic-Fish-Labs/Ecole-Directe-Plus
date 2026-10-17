import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../../../App";

import HolographicDiv from "../../generic/CustomDivs/HolographicDiv";
import SegmentedControl from "../../generic/UserInputs/SegmentedControl";
import ContentLoader from "react-content-loader";
import CanardmanSleeping from "../../graphics/CanardmanSleeping";
import Star from "../../graphics/Star";

import "./SchoolLife.css";

const TABS = [
    { key: "delays", label: "Retards", emptyMessage: "Aucun retard" },
    { key: "absences", label: "Absences", emptyMessage: "Aucune absence" },
    { key: "dispenses", label: "Dispenses", emptyMessage: "Aucune dispense" },
    { key: "sanctions", label: "Sanctions", emptyMessage: "Aucune sanction" },
    { key: "incidents", label: "Incidents", emptyMessage: "Aucun incident" },
    { key: "encouragements", label: "Encouragements", emptyMessage: "Aucun encouragement" },
];

function formatRawDate(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return "";
    }
    return date.toLocaleDateString("fr-FR");
}

function SchoolLifeItem({ item }) {
    const isEncouragement = item.type === "Encouragement";
    const todoLabel = typeof item.todo === "string" ? item.todo : (item.todo?.libelle ?? "");
    const rawDate = formatRawDate(item.date);
    const isoDate = rawDate ? item.date.toISOString().slice(0, 10) : undefined;

    return (
        <li className={`school-life-item${isEncouragement ? " encouragement" : ""}`}>
            <div className="item-header">
                <time className="item-date" dateTime={isoDate} title={rawDate || undefined}>
                    {item.displayDate || rawDate}
                    {rawDate && item.displayDate && rawDate !== item.displayDate && <span className="item-raw-date"> ({rawDate})</span>}
                </time>
                <div className="item-badges">
                    {isEncouragement
                        ? <Star className="item-star" alt="Encouragement" />
                        : <span className={"badge justification " + (item.isJustified ? "justified" : "unjustified")}>{item.isJustified ? "Justifié" : "Non justifié"}</span>
                    }
                    {todoLabel && (
                        <span className={"badge todo" + (item.todoDone ? " done" : "")}>
                            {item.todoDone ? "Fait" : "À faire"} · {todoLabel}
                        </span>
                    )}
                </div>
            </div>
            {item.duration && <span className="item-duration">{item.duration}</span>}
            <div className="item-details">
                {item.reason && <p className="item-reason"><span className="detail-label">Motif :</span> {item.reason}</p>}
                {item.comment && <p className="item-comment">{item.comment}</p>}
                {(item.by || item.occurrenceDate || item.justificationType) && (
                    <div className="item-meta">
                        {item.by && <span className="item-by">par {item.by}</span>}
                        {item.occurrenceDate && <span className="item-occurrence">Déroulé le {item.occurrenceDate}</span>}
                        {item.justificationType && <span className="item-justification-type">Justification : {item.justificationType}</span>}
                    </div>
                )}
            </div>
        </li>
    );
}

export default function SchoolLife({ isLoggedIn, activeAccount, schoolLife, fetchSchoolLife, sortSchoolLife }) {
    const { useUserData, useUserSettings, actualDisplayTheme } = useContext(AppContext);

    const settings = useUserSettings();
    const sortedSchoolLife = useUserData("sortedSchoolLife").get();

    const [selectedTab, setSelectedTab] = useState("delays");

    useEffect(() => {
        document.title = "Vie scolaire • Ecole Directe Plus";
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        if (isLoggedIn) {
            if (schoolLife.length < 1 || schoolLife[activeAccount] === undefined) {
                fetchSchoolLife(controller);
            } else {
                sortSchoolLife(schoolLife, activeAccount);
            }
        }

        return () => {
            controller.abort();
        };
    }, [schoolLife, isLoggedIn, activeAccount]);

    const counters = useMemo(() => (
        TABS.map((tab) => ({
            ...tab,
            count: sortedSchoolLife === undefined ? null : (sortedSchoolLife[tab.key]?.length ?? 0),
        }))
    ), [sortedSchoolLife]);

    const selectedTabData = counters.find((tab) => tab.key === selectedTab) ?? counters[0];

    const items = useMemo(() => {
        const list = sortedSchoolLife?.[selectedTab] ?? [];
        return [...list].sort((a, b) => (
            (b.date instanceof Date ? b.date.getTime() : 0) - (a.date instanceof Date ? a.date.getTime() : 0)
        ));
    }, [sortedSchoolLife, selectedTab]);

    const onlineJustificationDisabled = sortedSchoolLife?.parametrage?.justificationEnLigne === false;

    return (
        <div id="school-life">
            <HolographicDiv borderRadius={10} intensity={.2} className="frame" id="school-life-summary">
                <h1 className="frame-heading">Vie scolaire</h1>
                <div className="summary-types">
                    {counters.map((tab) => (
                        <div className="summary-type" key={tab.key}>
                            <span>{tab.label}</span>
                            <span className={"count" + (tab.count === null ? " loading" : "")}>
                                {tab.count ?? <><span style={{ "--index": 0 }}>.</span><span style={{ "--index": 1 }}>.</span><span style={{ "--index": 2 }}>.</span></>}
                            </span>
                        </div>
                    ))}
                </div>
                {onlineJustificationDisabled && (
                    <p className="online-justification-note">La justification en ligne n'est pas disponible pour cet établissement. Contactez l'établissement pour justifier une absence ou un retard.</p>
                )}
            </HolographicDiv>
            <section className="frame" id="school-life-list-frame">
                <div className="tabs-container">
                    <SegmentedControl
                        segments={TABS.map((tab) => tab.key)}
                        displayedSegments={counters.map((tab) => `${tab.label} (${tab.count ?? "…"})`)}
                        selected={selectedTab}
                        onChange={setSelectedTab}
                        fieldsetName="school-life-tabs"
                        id="school-life-tabs"
                    />
                </div>
                <div className="school-life-list" style={{ overflow: sortedSchoolLife === undefined ? "hidden" : "auto" }}>
                    {sortedSchoolLife === undefined ? (
                        <div className="school-life-loading">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <ContentLoader
                                    key={index}
                                    animate={settings.get("displayMode") === "quality"}
                                    speed={1}
                                    backgroundColor={actualDisplayTheme === "dark" ? "#5b5abd" : "#9595cc"}
                                    foregroundColor={actualDisplayTheme === "dark" ? "#494897" : "#b0b0f2"}
                                    height="86"
                                    style={{ width: "100%", marginBottom: "10px" }}
                                >
                                    <rect x="0" y="14" rx="5" ry="5" width="30%" height="14" />
                                    <rect x="0" y="44" rx="5" ry="5" width="65%" height="12" />
                                    <rect x="0" y="66" rx="5" ry="5" width="45%" height="12" />
                                </ContentLoader>
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="school-life-empty">
                            <CanardmanSleeping className="sleeping-logo" />
                            <span>{selectedTabData.emptyMessage}</span>
                        </div>
                    ) : (
                        <ul className="school-life-items">
                            {items.map((item) => (
                                <SchoolLifeItem key={`${item.type}-${item.id}`} item={item} />
                            ))}
                        </ul>
                    )}
                </div>
            </section>
        </div>
    );
}
