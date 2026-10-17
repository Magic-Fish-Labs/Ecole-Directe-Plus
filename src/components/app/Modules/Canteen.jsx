import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../../App";
import Tabs from "../../generic/UserInputs/Tabs";
import Button from "../../generic/UserInputs/Button";
import DropDownMenu from "../../generic/UserInputs/DropDownMenu";
import NumberInput from "../../generic/UserInputs/NumberInput";
import RadioButton from "../../generic/UserInputs/RadioButton";
import DownloadIcon from "../../graphics/DownloadIcon";
import { ModulesSkeleton, EmptyState, formatMontant } from "./Shared";

const CANTEEN_TABS = ["commander", "history", "menus"];
const CANTEEN_TAB_LABELS = ["Commander", "Historique", "Menus"];

function todayISO() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
}

function extractCreneauStart(libelle) {
    const match = String(libelle ?? "").match(/\d{1,2}:\d{2}/);
    return match ? match[0] : String(libelle ?? "");
}

function sanitizeId(value) {
    return String(value ?? "").replace(/[^a-zA-Z0-9_-]/g, "");
}

function sumArticles(articles) {
    return (Array.isArray(articles) ? articles : []).reduce(
        (sum, article) => sum + (Number(article.montant) || 0) * (Number(article.quantite) || 0),
        0
    );
}

export default function Canteen({ isLoading, data, onOrdersChange }) {
    const {
        fetchCanteenOrderAvailability,
        placeCanteenOrder,
        cancelCanteenOrder,
        fetchFile,
        createNotification,
    } = useContext(AppContext);

    const [subTab, setSubTab] = useState("commander");
    const [selectedPdpId, setSelectedPdpId] = useState("");
    const [date, setDate] = useState(() => todayISO());
    const [quantites, setQuantites] = useState({});
    const [choices, setChoices] = useState({});
    const [creneau, setCreneau] = useState("");
    const [availability, setAvailability] = useState(null);
    const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cancellingId, setCancellingId] = useState(null);
    const [downloadingDocId, setDownloadingDocId] = useState(null);
    const [refreshToken, setRefreshToken] = useState(0);

    useEffect(() => {
        setQuantites({});
        setChoices({});
        setCreneau("");
    }, [selectedPdpId, date]);

    useEffect(() => {
        let cancelled = false;
        if (!selectedPdpId || !date) {
            setAvailability(null);
            return;
        }
        setAvailability(null);
        setIsAvailabilityLoading(true);
        fetchCanteenOrderAvailability(Number(selectedPdpId), date.replace(/-/g, "")).then((result) => {
            if (!cancelled) {
                setAvailability(result);
                setIsAvailabilityLoading(false);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [selectedPdpId, date, refreshToken]);

    if (isLoading) {
        return <ModulesSkeleton />;
    }

    if (!data) {
        return <EmptyState message="La cantine n'est pas disponible" graphic="confused" />;
    }

    const orders = data.orders ?? null;
    const menus = Array.isArray(data.menus) ? data.menus : [];
    const pdps = Array.isArray(orders?.tabPointsDePassage) ? orders.tabPointsDePassage : [];
    const historique = Array.isArray(orders?.historiqueCommandes) ? orders.historiqueCommandes : [];
    const joursFeries = Array.isArray(orders?.joursFeries) ? orders.joursFeries : [];
    const selectedPdp = pdps.find((pdp) => String(pdp.id) === String(selectedPdpId));
    const creneaux = Array.isArray(selectedPdp?.creneaux) ? selectedPdp.creneaux : [];
    const sansStock = new Set(Array.isArray(availability?.articlesSansStock) ? availability.articlesSansStock : []);
    const blocked = !!availability && (availability.montantJournalierAtteint || availability.montantSemaineAtteint || availability.nbPassageSemaineAtteint);

    function handleDateChange(event) {
        const value = event.target.value;
        if (!value) {
            return;
        }
        if (value < todayISO()) {
            createNotification(<p>Impossible de commander pour une date passée</p>);
            return;
        }
        if (joursFeries.includes(value)) {
            createNotification(<p>Jour férié, commandes indisponibles</p>);
            return;
        }
        setDate(value);
    }

    function handleQuantityChange(article, value) {
        const rounded = Math.max(0, Math.round(Number(value) || 0));
        setQuantites((old) => ({ ...old, [article.code]: rounded }));
    }

    function buildOrderArticles() {
        const built = [];
        let error = null;
        (Array.isArray(selectedPdp?.categoriesArticles) ? selectedPdp.categoriesArticles : []).forEach((category) => {
            (Array.isArray(category.articles) ? category.articles : []).forEach((article) => {
                const quantity = quantites[article.code] ?? 0;
                if (quantity <= 0) {
                    return;
                }
                const possibilites = (Array.isArray(article.possibilites) ? article.possibilites : []).map((possibilite, possibiliteIndex) => {
                    const options = Array.isArray(possibilite.choix) ? possibilite.choix : [];
                    if (options.length === 0) {
                        return possibilite;
                    }
                    const selectedChoice = choices[`${article.code}/${possibiliteIndex}`];
                    if (selectedChoice === undefined) {
                        if (!error) {
                            error = `Sélectionnez une option pour « ${article.libelle} »`;
                        }
                        return possibilite;
                    }
                    return {
                        ...possibilite,
                        choix: options.map((option) => (option.id === selectedChoice ? { ...option, choisie: true } : option)),
                    };
                });
                built.push({ ...article, quantite: quantity, possibilites });
            });
        });
        return { built, error };
    }

    const cartTotal = (() => {
        const { built } = buildOrderArticles();
        return built.reduce((sum, article) => sum + (Number(article.montant) || 0) * (Number(article.quantite) || 0), 0);
    })();

    async function handleOrder() {
        if (blocked) {
            createNotification(<p>Une limite de commande est atteinte pour cette date</p>);
            return;
        }
        if (creneaux.length > 0 && !creneau) {
            createNotification(<p>Sélectionnez un créneau de retrait</p>);
            return;
        }
        const { built, error } = buildOrderArticles();
        if (error) {
            createNotification(<p>{error}</p>);
            return;
        }
        if (built.length === 0) {
            createNotification(<p>Sélectionnez au moins un article</p>);
            return;
        }
        setIsSubmitting(true);
        try {
            const result = await placeCanteenOrder({
                articles: built,
                creneau,
                date,
                pointDePassage: Number(selectedPdpId),
            });
            if (result?.ok) {
                createNotification(<p>Commande passée</p>);
                setQuantites({});
                setChoices({});
                setCreneau("");
                onOrdersChange();
                setRefreshToken((old) => old + 1);
            } else {
                createNotification(<p>{result?.error ?? "La commande n'a pas pu être passée"}</p>);
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleCancel(order) {
        setCancellingId(order.idCommande);
        try {
            const result = await cancelCanteenOrder(order.idCommande);
            if (result?.ok) {
                createNotification(<p>Commande annulée</p>);
                onOrdersChange();
                setRefreshToken((old) => old + 1);
            } else {
                createNotification(<p>{result?.error ?? "La commande n'a pas pu être annulée"}</p>);
            }
        } finally {
            setCancellingId(null);
        }
    }

    async function downloadMenu(doc) {
        setDownloadingDocId(doc.id);
        try {
            const blob = await fetchFile(doc.id, "FICHIER_MENU_RESTAURATION", {});
            if (!blob || !blob.size) {
                createNotification(<p>Le menu n'a pas pu être téléchargé</p>);
                return;
            }
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const hasExtension = String(doc.libelle ?? "").includes(".");
            link.download = (doc.libelle ?? "menu") + (hasExtension ? "" : ".pdf");
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } finally {
            setDownloadingDocId(null);
        }
    }

    function renderArticle(article) {
        const outOfStock = sansStock.has(article.code) || sansStock.has(article.libelle);
        const quantity = quantites[article.code] ?? 0;
        const maxQuantity = article.quantiteMax > 0 ? article.quantiteMax : 99;
        const possibilites = Array.isArray(article.possibilites) ? article.possibilites : [];
        return (
            <article className={`canteen-article${outOfStock ? " out-of-stock" : ""}`} key={article.code}>
                <div className="article-head">
                    {article.img && <img className="article-img" src={article.img} alt="" loading="lazy" />}
                    <div className="article-info">
                        <h5 className="article-title">{article.libelle}</h5>
                        {article.description && <p className="article-description">{article.description}</p>}
                        <div className="article-badges">
                            <span className="article-price">{formatMontant(article.montant)}</span>
                            {article.estObligatoire && <span className="module-badge">Obligatoire</span>}
                            {outOfStock && <span className="module-badge badge-warning">Indisponible</span>}
                        </div>
                    </div>
                    <div className="article-quantity">
                        <NumberInput
                            min={0}
                            max={maxQuantity}
                            value={quantity}
                            disabled={outOfStock}
                            onChange={(value) => handleQuantityChange(article, value)}
                        />
                    </div>
                </div>
                {possibilites.map((possibilite, possibiliteIndex) => {
                    const options = Array.isArray(possibilite.choix) ? possibilite.choix : [];
                    if (options.length === 0) {
                        return null;
                    }
                    const choiceKey = `${article.code}/${possibiliteIndex}`;
                    const fieldsetId = `c-${sanitizeId(article.code)}-${possibiliteIndex}`;
                    return (
                        <fieldset className="possibilite-group" key={possibilite.code ?? possibiliteIndex}>
                            <legend className="possibilite-legend">
                                {possibilite.libelleCateg || possibilite.libelle || "Choix"}
                            </legend>
                            <div className="propositions">
                                {options.map((option, optionIndex) => (
                                    <RadioButton
                                        key={option.id ?? optionIndex}
                                        id={`${fieldsetId}-${optionIndex}`}
                                        fieldsetName={fieldsetId}
                                        checked={choices[choiceKey] === option.id}
                                        disabled={outOfStock}
                                        onChange={() => setChoices((old) => ({ ...old, [choiceKey]: option.id }))}
                                    >
                                        {option.libelle}
                                    </RadioButton>
                                ))}
                            </div>
                        </fieldset>
                    );
                })}
            </article>
        );
    }

    function renderCommander() {
        if (pdps.length === 0) {
            return <EmptyState message="Aucun point de passage disponible" />;
        }
        return (
            <div className="canteen-form">
                <div className="canteen-controls">
                    <div className="canteen-field">
                        <span className="field-label">Point de passage</span>
                        <DropDownMenu
                            name="point-de-passage"
                            options={pdps.map((pdp) => String(pdp.id))}
                            displayedOptions={pdps.map((pdp) => pdp.libelle ?? String(pdp.id))}
                            selected={selectedPdpId}
                            onChange={setSelectedPdpId}
                            className="pdp-dropdown"
                        />
                    </div>
                    <div className="canteen-field">
                        <label className="field-label" htmlFor="canteen-date-input">Date</label>
                        <input
                            id="canteen-date-input"
                            type="date"
                            className="canteen-date-input"
                            value={date}
                            min={todayISO()}
                            onChange={handleDateChange}
                        />
                    </div>
                </div>
                <div className="availability-summary">
                    {isAvailabilityLoading && <span>Vérification de la disponibilité…</span>}
                    {!isAvailabilityLoading && typeof availability?.soldePM === "number" && (
                        <span>{availability.libellePM ?? "Portefeuille"} : {formatMontant(availability.soldePM)}</span>
                    )}
                    {!isAvailabilityLoading && availability?.creneauMinRetrait && (
                        <span>Retrait à partir de {availability.creneauMinRetrait}</span>
                    )}
                    {availability?.montantJournalierAtteint && (
                        <span className="availability-warning">Limite journalière atteinte</span>
                    )}
                    {availability?.montantSemaineAtteint && (
                        <span className="availability-warning">Limite hebdomadaire atteinte</span>
                    )}
                    {availability?.nbPassageSemaineAtteint && (
                        <span className="availability-warning">Nombre de passages hebdomadaires atteint</span>
                    )}
                </div>
                {creneaux.length > 0 && (
                    <div className="creneau-picker">
                        <span className="field-label">Créneau de retrait</span>
                        <div className="creneau-pills">
                            {creneaux.map((creneauItem, index) => {
                                const start = extractCreneauStart(creneauItem.libelle);
                                const isFull = !!creneauItem.estComplet;
                                return (
                                    <button
                                        type="button"
                                        key={`${creneauItem.libelle}-${index}`}
                                        className={`creneau-pill${creneau === start ? " selected" : ""}${isFull ? " full" : ""}`}
                                        disabled={isFull}
                                        title={isFull ? "Créneau complet" : undefined}
                                        onClick={() => setCreneau(start)}
                                    >
                                        {creneauItem.libelle}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
                {(Array.isArray(selectedPdp?.categoriesArticles) ? selectedPdp.categoriesArticles : []).map((category, index) => (
                    <section className="canteen-category" key={category.id ?? index}>
                        <h4 className="category-title">{category.libelle}</h4>
                        {(Array.isArray(category.articles) ? category.articles : []).map((article) => renderArticle(article))}
                    </section>
                ))}
                <div className="cart-summary">
                    <span className="cart-total">Total : {formatMontant(cartTotal)}</span>
                    <Button onClick={handleOrder} disabled={isSubmitting || blocked} className={isSubmitting ? "submitting" : ""}>
                        {isSubmitting ? "Commande…" : "Commander"}
                    </Button>
                </div>
            </div>
        );
    }

    function renderHistory() {
        if (historique.length === 0) {
            return <EmptyState message="Aucune commande récente" />;
        }
        return (
            <div className="canteen-history">
                {historique.map((order, index) => (
                    <article className="module-card order-card" key={order.idCommande ?? index}>
                        <div className="order-header">
                            <h4 className="card-title">{order.numeroCommande ?? "Commande"}</h4>
                            {order.etat && <span className="module-badge">{order.etat}</span>}
                        </div>
                        <span className="card-meta">
                            {order.date}{order.creneau ? ` · ${order.creneau}` : ""}
                        </span>
                        <ul className="order-articles">
                            {(Array.isArray(order.articles) ? order.articles : []).map((article, articleIndex) => (
                                <li key={article.code ?? articleIndex}>
                                    {article.libelle} × {article.quantite}
                                </li>
                            ))}
                        </ul>
                        <div className="order-footer">
                            <span className="order-total">{formatMontant(sumArticles(order.articles))}</span>
                            <Button
                                onClick={() => handleCancel(order)}
                                disabled={cancellingId !== null}
                                className={cancellingId === order.idCommande ? "submitting" : ""}
                            >
                                {cancellingId === order.idCommande ? "Annulation…" : "Annuler"}
                            </Button>
                        </div>
                    </article>
                ))}
            </div>
        );
    }

    function renderMenus() {
        if (menus.length === 0) {
            return <EmptyState message="Aucun menu disponible" />;
        }
        return (
            <div className="canteen-menus">
                {menus.map((week, index) => (
                    <section className="menu-week" key={week.semaine ?? index}>
                        <h4 className="category-title">Semaine {week.semaine ?? index + 1}</h4>
                        {(Array.isArray(week.doc) ? week.doc : []).map((doc, docIndex) => (
                            <div className="menu-doc" key={doc.id ?? docIndex}>
                                <span className="menu-doc-name">{doc.libelle ?? "Menu"}</span>
                                <Button
                                    onClick={() => downloadMenu(doc)}
                                    disabled={downloadingDocId !== null}
                                    className={downloadingDocId === doc.id ? "submitting" : ""}
                                >
                                    <DownloadIcon className="menu-download-icon" />
                                    {downloadingDocId === doc.id ? "Téléchargement…" : "Télécharger"}
                                </Button>
                            </div>
                        ))}
                    </section>
                ))}
            </div>
        );
    }

    return (
        <div className="canteen">
            <Tabs
                tabs={CANTEEN_TABS}
                displayedTabs={CANTEEN_TAB_LABELS}
                selected={subTab}
                onChange={setSubTab}
                fieldsetName="canteen-sections"
                className="canteen-tabs"
            />
            <div className="canteen-content">
                {subTab === "commander" && renderCommander()}
                {subTab === "history" && renderHistory()}
                {subTab === "menus" && renderMenus()}
            </div>
        </div>
    );
}
