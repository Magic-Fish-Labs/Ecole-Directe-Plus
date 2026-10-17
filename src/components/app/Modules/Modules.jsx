import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../../App";

import Tabs from "../../generic/UserInputs/Tabs";

import Workspaces from "./Workspaces";
import Forms from "./Forms";
import Manuals from "./Manuals";
import Visios from "./Visios";
import ClassLife from "./ClassLife";
import Canteen from "./Canteen";
import Correspondence from "./Correspondence";
import Cloud from "./Cloud";
import Wallet from "./Wallet";
import Polls from "./Polls";
import Qcm from "./Qcm";
import Apps from "./Apps";
import { EmptyState } from "./Shared";

import "./Modules.css";

export default function Modules({ isLoggedIn, activeAccount }) {
    const {
        accountsListState,
        createNotification,
        fetchWorkspaces,
        fetchForms,
        fetchManuals,
        fetchVisios,
        fetchVieDeLaClasse,
        fetchCanteenOrders,
        fetchCanteenMenus,
        fetchCarnetCorrespondance,
        fetchCloudNode,
        fetchWallet,
        fetchConnectors,
        toggleConnectorFavorite,
        getConnectorRedirectUrl,
        fetchPolls,
        fetchQcms,
    } = useContext(AppContext);

    useEffect(() => {
        document.title = "Modules • Ecole Directe Plus";
    }, []);

    const account = accountsListState?.[activeAccount];
    const isGuest = account?.firstName === "Guest";
    const accountModules = Array.isArray(account?.modules) ? account.modules : [];

    function isModuleEnabled(code) {
        return accountModules.find((module) => module.code === code)?.enable ?? true;
    }

    const cloudModule = accountModules.find((module) => module.code === "CLOUD");
    const isVisiosEnabled = cloudModule ? cloudModule?.params?.visiosActif !== "0" : true;

    const sections = [
        { key: "workspaces", label: "Espaces de travail", enabled: true },
        { key: "forms", label: "Formulaires", enabled: isModuleEnabled("EDFORMS") },
        { key: "manuals", label: "Manuels numériques", enabled: isModuleEnabled("MANUELS_SCOLAIRES") },
        { key: "visios", label: "Visios", enabled: isVisiosEnabled },
        { key: "classLife", label: "Vie de la classe", enabled: isModuleEnabled("VIE_DE_LA_CLASSE") },
        { key: "canteen", label: "Cantine", enabled: isModuleEnabled("COMMANDE_PASSAGE") },
        { key: "carnet", label: "Carnet", enabled: isModuleEnabled("CARNET_CORRESPONDANCE") },
        { key: "cloud", label: "Cloud", enabled: isModuleEnabled("CLOUD") },
        { key: "wallet", label: "Porte-monnaie", enabled: isModuleEnabled("SITUATION_FINANCIERE") },
        { key: "polls", label: "Sondages", enabled: true },
        { key: "qcm", label: "QCM", enabled: isModuleEnabled("QCM") },
        { key: "apps", label: "Mes Applis", enabled: isModuleEnabled("HUB") },
    ].filter((section) => section.enabled);

    const [activeSection, setActiveSection] = useState(sections[0]?.key ?? "");
    const [loadingSections, setLoadingSections] = useState({});
    const [sectionResults, setSectionResults] = useState({});
    const fetchedSectionsRef = useRef({});

    useEffect(() => {
        if (sections.length === 0) {
            if (activeSection !== "") {
                setActiveSection("");
            }
            return;
        }
        if (!sections.some((section) => section.key === activeSection)) {
            setActiveSection(sections[0].key);
        }
    }, [sections, activeSection]);

    async function loadSection(sectionKey) {
        if (!isLoggedIn || isGuest) {
            return;
        }
        if (fetchedSectionsRef.current[sectionKey]) {
            return;
        }
        fetchedSectionsRef.current[sectionKey] = true;
        setLoadingSections((old) => ({ ...old, [sectionKey]: true }));
        try {
            let result = null;
            switch (sectionKey) {
                case "workspaces":
                    result = await fetchWorkspaces();
                    break;
                case "forms":
                    result = await fetchForms();
                    break;
                case "manuals":
                    result = await fetchManuals();
                    break;
                case "visios":
                    result = await fetchVisios();
                    break;
                case "classLife":
                    result = await fetchVieDeLaClasse();
                    break;
                case "canteen": {
                    const orders = await fetchCanteenOrders();
                    const menus = await fetchCanteenMenus();
                    result = { orders, menus };
                    break;
                }
                case "carnet":
                    result = await fetchCarnetCorrespondance();
                    break;
                case "cloud":
                    result = await fetchCloudNode("");
                    break;
                case "wallet":
                    result = await fetchWallet();
                    break;
                case "polls":
                    result = await fetchPolls();
                    break;
                case "qcm":
                    result = await fetchQcms();
                    break;
                case "apps":
                    result = await fetchConnectors();
                    break;
                default:
                    result = null;
            }
            setSectionResults((old) => ({ ...old, [sectionKey]: result }));
        } catch (error) {
            console.error(error);
            fetchedSectionsRef.current[sectionKey] = false;
            setSectionResults((old) => ({ ...old, [sectionKey]: old[sectionKey] ?? null }));
            createNotification(<span>Impossible de charger cette section</span>);
        } finally {
            setLoadingSections((old) => ({ ...old, [sectionKey]: false }));
        }
    }

    useEffect(() => {
        if (activeSection) {
            loadSection(activeSection);
        }
    }, [activeSection]);

    async function refreshSection(sectionKey, fetcher) {
        const value = await fetcher();
        setSectionResults((old) => ({ ...old, [sectionKey]: value }));
    }

    function handleCloudRootChange(nodesList) {
        setSectionResults((old) => ({ ...old, cloud: nodesList }));
    }

    function handleFavorisChange(newFavorisList) {
        setSectionResults((old) => ({
            ...old,
            apps: { ...(old.apps ?? {}), favoris: newFavorisList },
        }));
    }

    async function handleCanteenOrdersChange() {
        const orders = await fetchCanteenOrders();
        setSectionResults((old) => ({
            ...old,
            canteen: { ...(old.canteen ?? {}), orders },
        }));
    }

    function renderSectionContent() {
        if (!activeSection) {
            return <EmptyState message="Aucun module disponible" graphic="confused" />;
        }
        if (!isLoggedIn) {
            return <EmptyState message="Connectez-vous pour accéder aux modules" graphic="confused" />;
        }
        if (isGuest) {
            return <EmptyState message="Non disponible en mode invité" graphic="confused" />;
        }
        const isLoading = !!loadingSections[activeSection] || !(activeSection in sectionResults);
        const result = sectionResults[activeSection];
        switch (activeSection) {
            case "workspaces":
                return <Workspaces isLoading={isLoading} workspaces={result} onListChange={() => refreshSection("workspaces", fetchWorkspaces)} />;
            case "forms":
                return <Forms isLoading={isLoading} forms={result} onListChange={() => refreshSection("forms", fetchForms)} />;
            case "manuals":
                return <Manuals isLoading={isLoading} manuals={result} />;
            case "visios":
                return <Visios isLoading={isLoading} visios={result} />;
            case "classLife":
                return <ClassLife isLoading={isLoading} data={result} />;
            case "canteen":
                return (
                    <Canteen
                        isLoading={isLoading}
                        data={result}
                        onOrdersChange={handleCanteenOrdersChange}
                    />
                );
            case "carnet":
                return <Correspondence isLoading={isLoading} carnet={result} />;
            case "cloud":
                return <Cloud isLoading={isLoading} initialNodes={result} onRootNodesChange={handleCloudRootChange} />;
            case "wallet":
                return <Wallet isLoading={isLoading} wallet={result} />;
            case "polls":
                return <Polls isLoading={isLoading} polls={result} />;
            case "qcm":
                return <Qcm isLoading={isLoading} qcms={result} />;
            case "apps":
                return <Apps isLoading={isLoading} data={result} onFavorisChange={handleFavorisChange} />;
            default:
                return null;
        }
    }

    const activeLabel = sections.find((section) => section.key === activeSection)?.label ?? "";

    return (
        <div id="modules">
            <h1>Modules</h1>
            {sections.length > 0 && (
                <Tabs
                    tabs={sections.map((section) => section.key)}
                    displayedTabs={sections.map((section) => section.label)}
                    selected={activeSection}
                    onChange={setActiveSection}
                    fieldsetName="modules-sections"
                    className="modules-tabs"
                />
            )}
            <div className="modules-section">
                {activeLabel && <h2 className="section-heading">{activeLabel}</h2>}
                {renderSectionContent()}
            </div>
        </div>
    );
}
