import { useRef, useEffect, useContext, useState } from "react";
import { AccountContext, AppContext, SettingsContext, UserDataContext } from "../../../App";

import HolographicDiv from "../../generic/CustomDivs/HolographicDiv";
import Button from "../../generic/UserInputs/Button";
import DropDownMenu from "../../generic/UserInputs/DropDownMenu";
import FileComponent from "../../generic/FileComponent";
import ContentLoader from "react-content-loader";
import CanardmanSleeping from "../../graphics/CanardmanSleeping";
import ConfusedCanardman from "../../graphics/ConfusedCanardman";

import "./Account.css";

export default function Account({ }) {
    const { usedDisplayTheme } = useContext(AppContext)

    const account = useContext(AccountContext);

    const userData = useContext(UserDataContext);
    const { administrativeDocuments } = userData;

    const settings = useContext(SettingsContext);
    const {
        isSchoolYearEnabled: { value: isSchoolYearEnabled },
        schoolYear: { value: schoolYear },
        isStreamerModeEnabled: { value: isStreamerModeEnabled },
        displayMode: { value: displayMode }
    } = settings.user;

    const moduletype = account.selectedUser.accountType === "E" ? "DOCUMENTS_ELEVE" : "DOCUMENTS";
    const module = (account.selectedUser.modules || []).find(module => module.code === moduletype);
    const availableYearsArray = module?.params?.AnneeArchive ? module.params.AnneeArchive.split(",") : [];
    const lastYear = availableYearsArray.length > 0 ? availableYearsArray[availableYearsArray.length - 1] : `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`;
    const [startYear, endYear] = lastYear.split('-').map(Number);
    const nextYear = `${endYear}-${endYear + 1}`;
    availableYearsArray.push(nextYear);

    const profilePictureRefs = useRef([]);
    const contentLoaderRandomValues = useRef({ documentsNumber: Array.from({ length: 3 }, (_) => Math.floor(Math.random() * 10) + 1), fileNameWidth: Array.from({ length: 10 }, (_) => Math.floor(Math.random() * 31) + 60) });

    const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);

    useEffect(() => {
        document.title = "Compte • Ecole Directe Plus";
    }, []);

    useEffect(() => {
        profilePictureRefs.current = [...profilePictureRefs.current]; // Met à jour les références

        for (let profilePictureRef of profilePictureRefs.current) {
            const imageLoaded = () => {
                profilePictureRef?.classList.add("loaded");
                profilePictureRef?.removeEventListener("load", imageLoaded);
            }
            profilePictureRef?.addEventListener("load", imageLoaded);
        }
    }, [profilePictureRefs.current]);

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
        }
    }, [schoolLife, isLoggedIn, activeAccount]);

    const [oldCurrentYear, setOldCurrentYear] = useState('');

    const [selectedYear, setSelectedYear] = useState(isSchoolYearEnabled ? schoolYear.join("-") : availableYearsArray[availableYearsArray.length - 1]);
    const [documents, setDocuments] = useState({ factures: [], notes: [], viescolaire: [], administratifs: [], entreprises: [] });

    // handle year change of dropdown
    function handleYearChange(year) {
        setOldCurrentYear(selectedYear);
        setSelectedYear(year);
        console.log("Selected year:", year);
    }

    // fetch documents on page load and year change
    useEffect(() => {
        if (isLoggedIn && selectedYear) {
            let data = administrativeDocuments;
            if (data === undefined || oldCurrentYear !== selectedYear) {
                setOldCurrentYear(selectedYear);
                const fetchDocuments = async () => {
                    try {
                        setIsLoadingDocuments(true);
                        let selectedYearFetch = selectedYear === availableYearsArray[availableYearsArray.length - 1] ? '' : selectedYear;
                        await fetchAdministrativeDocuments(selectedYearFetch);
                    } catch (error) {
                        console.error("Error fetching documents:", error);
                    } finally {
                        setTimeout(() => {
                            setIsLoadingDocuments(false);
                        }, 0);
                    }
                };
                fetchDocuments();
            } else {
                setDocuments(data);
            }
        }
    }, [oldCurrentYear, selectedYear, isLoggedIn, userData.get("administrativeDocuments")]);

    return (
        <div id="account">
            <HolographicDiv borderRadius={10} intensity={.2} className="frame" id="profile">
                <h2 className="frame-heading">Profil</h2>
                <div id="student-informations">
                    <div id="profile-picture-container">
                        <img
                            ref={(el) => (profilePictureRefs.current[0] = el)}
                            className="profile-picture"
                            src={isStreamerModeEnabled ? "/images/scholar-canardman.png" : account.selectedUser.picture}
                            alt={"Photo de profil de " + account.selectedUser.firstName}
                        />
                    </div>
                    <address id="informations-container">
                        <span>Dernière connexion : <time dateTime={(new Date(account.selectedUser.lastConnection ?? Date.now())).toISOString()}>
                            {new Date(account.selectedUser.lastConnection ?? Date.now()).toLocaleDateString("fr-FR", {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: "numeric",
                                minute: "numeric"
                            }).replace(",", " à")}
                        </time></span>
                        <span>Email : {isStreamerModeEnabled ? "contact@ecole-directe.plus" : account.selectedUser.email}</span>
                        {account.selectedUser.phoneNumber &&
                            <span>Num. téléphone : {isStreamerModeEnabled ? "00 00 00 00 00" : account.selectedUser.phoneNumber}</span>}
                    </address>
                    <Button disabled={true} id="statistics">Statistiques</Button>
                </div>
                <div className="coming-soon">
                    En cours de développement (bientôt disponible)
                </div>
            </HolographicDiv>
            <section className="frame" id="documents">
                {module?.enable ? (
                    <>
                        <div className="frame-heading-container">
                            <h2 className={`frame-heading frame-heading-documents ${availableYearsArray.length < 2 ? 'single-year' : ''}`}>Documents</h2>
                            {availableYearsArray.length > 1 ? (
                                <DropDownMenu
                                    name="year-selector"
                                    options={availableYearsArray}
                                    displayedOptions={availableYearsArray.map(year => year)}
                                    selected={selectedYear}
                                    onChange={handleYearChange}
                                    className="year-selector"
                                />
                            ) : null
                            }
                        </div>
                        <div className="documents-container" style={
                            {
                                //if isLoadingDocuments is true, set overflow to hidden to prevent scrolling
                                overflow: isLoadingDocuments ? "hidden" : "auto"
                            }
                        }>
                            {isLoadingDocuments ? (
                                <div>
                                    <div className="document-category">
                                        {Array.from({ length: 3 }).map((_, index) => (
                                            <div style={{ padding: "15px" }}>
                                                <h3 style={{ paddingBottom: "10px" }}>
                                                    <ContentLoader
                                                        animate={displayMode === "quality"}
                                                        speed={1}
                                                        backgroundColor={usedDisplayTheme === "dark" ? "#5b5abd" : "#9595cc"}
                                                        foregroundColor={usedDisplayTheme === "dark" ? "#494897" : "#b0b0f2"}
                                                        height="30"
                                                        style={{ width: "30%" }}
                                                    >
                                                        <rect x="0" y="0" rx="5" ry="5" width="100%" height="100%" />
                                                    </ContentLoader>
                                                </h3>
                                                {Array.from({ length: contentLoaderRandomValues.current.documentsNumber[index] }, (_, index) => (
                                                    <div className="file-box-loader " style={{ marginBottom: "10px" }}>
                                                        <ContentLoader
                                                            animate={displayMode === "quality"}
                                                            speed={1}
                                                            backgroundColor={usedDisplayTheme === "dark" ? "#5b5abd" : "#9595cc"}
                                                            foregroundColor={usedDisplayTheme === "dark" ? "#494897" : "#b0b0f2"}
                                                            height="25"
                                                            style={{ width: `${contentLoaderRandomValues.current.fileNameWidth[index]}%` }}
                                                        >
                                                            <rect x="0" y="0" rx="5" ry="5" width="100%" height="100%" />
                                                        </ContentLoader>
                                                        <h2 className="file-date" style={{ display: "flex", alignItems: "center" }}>
                                                            <ContentLoader
                                                                animate={displayMode === "quality"}
                                                                speed={1}
                                                                backgroundColor={usedDisplayTheme === "dark" ? "#5b5abd" : "#9595cc"}
                                                                foregroundColor={usedDisplayTheme === "dark" ? "#494897" : "#b0b0f2"}
                                                                height="20"
                                                                style={{ width: "100%" }}
                                                            >
                                                                <rect x="0" y="0" rx="5" ry="5" width="100%" height="100%" />
                                                            </ContentLoader></h2>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) :
                                documents?.administratifs?.length === 0 &&
                                    documents?.notes?.length === 0 &&
                                    documents?.viescolaire?.length === 0 &&
                                    documents?.entreprises?.length === 0 &&
                                    documents?.factures?.length === 0
                                    // && documents?.inscriptionsReinscriptions?.length === 0
                                    ? (
                                        <div className="no-available-documents">
                                            <CanardmanSleeping className="sleeping-logo" />
                                            <span>Aucun document disponible</span>
                                        </div>
                                    ) : (
                                        <>
                                            {/* {module.params.DocumentsInscriptionsReinscriptionsActif === "1" && documents?.inscriptionsReinscriptions?.length > 0 && (
                                            <div className="document-category">
                                                <h3>Inscriptions & Réinscriptions</h3>
                                                {documents.inscriptionsReinscriptions.map(file => (
                                                    <div className="file-box">
                                                        <FileComponent key={file.id} file={file} />
                                                        <h2 className="file-date">{file.specialParams.date}</h2>
                                                    </div>
                                                ))}
                                            </div>
                                        )} */}

                                            {module?.params?.DocumentsFactureActif === "1" && documents?.factures?.length > 0 && (
                                                <div className="document-category">
                                                    <h3>Factures</h3>
                                                    {documents.factures.map(file => (
                                                        <div className="file-box">
                                                            <FileComponent key={file.id} file={file} />
                                                            <h2 className="file-date">{file.specialParams.date}</h2>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {module?.params?.DocumentsAdministratifActif === "1" && documents?.administratifs?.length > 0 && (
                                                <div className="document-category">
                                                    <h3>Documents administratifs</h3>
                                                    {documents.administratifs.map(file => (
                                                        <div className="file-box">
                                                            <FileComponent key={file.id} file={file} />
                                                            <h2 className="file-date">{file.specialParams.date}</h2>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {module?.params?.DocumentsNotesActif === "1" && documents?.notes?.length > 0 && (
                                                <div className="document-category">
                                                    <h3>Notes</h3>
                                                    {documents.notes.map(file => (
                                                        <div className="file-box">
                                                            <FileComponent key={file.id} file={file} />
                                                            <h2 className="file-date">{file.specialParams.date}</h2>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {module?.params?.DocumentsVSActif === "1" && documents?.viescolaire?.length > 0 && (
                                                <div className="document-category">
                                                    <h3>Vie scolaire</h3>
                                                    {documents.viescolaire.map(file => (
                                                        <div className="file-box">
                                                            <FileComponent key={file.id} file={file} />
                                                            <h2 className="file-date">{file.specialParams.date}</h2>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {module?.params?.DocumentsEntrepriseActif === "1" && documents?.entreprises?.length > 0 && (
                                                <div className="document-category">
                                                    <h3>Documents entreprise</h3>
                                                    {documents.entreprises.map(file => (
                                                        <div className="file-box">
                                                            <FileComponent key={file.id} file={file} />
                                                            <h2 className="file-date">{file.specialParams.date}</h2>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                        </div>
                    </>
                ) : (

                    <div className="no-available-documents">
                        <span>Le module de documents n'est pas accessible</span>
                        <ConfusedCanardman className="sleeping-logo" />
                    </div>
                )}
            </section>
            <section className="frame" id="behavior">
                <h2 className="frame-heading">Comportement</h2>
                <div className="behavior-types">
                    <div className="behavior-type">
                        <span>Retards</span>
                        <span className={"count" + (!userData.get("sortedSchoolLife")?.delays.length ? " loading" : "")}>{userData.get("sortedSchoolLife")?.delays.length ?? <><span style={{ "--index": 0 }}>.</span><span style={{ "--index": 1 }}>.</span><span style={{ "--index": 2 }}>.</span></>}</span>
                    </div>
                    <div className="behavior-type">
                        <span>Absences</span>
                        <span className={"count" + (!userData.get("sortedSchoolLife")?.absences.length ? " loading" : "")}>{userData.get("sortedSchoolLife")?.absences.length ?? <><span style={{ "--index": 3 }}>.</span><span style={{ "--index": 4 }}>.</span><span style={{ "--index": 5 }}>.</span></>}</span>
                    </div>
                    <div className="behavior-type">
                        <span>Sanctions</span>
                        <span className={"count" + (!userData.get("sortedSchoolLife")?.sanctions.length ? " loading" : "")}>{userData.get("sortedSchoolLife")?.sanctions.length ?? <><span style={{ "--index": 6 }}>.</span><span style={{ "--index": 7 }}>.</span><span style={{ "--index": 8 }}>.</span></>}</span>
                    </div>
                    <div className="behavior-type">
                        <span>Incidents</span>
                        <span className={"count" + (!userData.get("sortedSchoolLife")?.incidents.length ? " loading" : "")}>{userData.get("sortedSchoolLife")?.incidents.length ?? <><span style={{ "--index": 9 }}>.</span><span style={{ "--index": 10 }}>.</span><span style={{ "--index": 11 }}>.</span></>}</span>
                    </div>
                </div>
            </section>
        </div>
    )
}
