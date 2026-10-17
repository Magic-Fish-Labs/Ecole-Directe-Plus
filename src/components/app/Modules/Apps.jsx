import { useContext, useState } from "react";
import { AppContext } from "../../../App";
import Button from "../../generic/UserInputs/Button";
import TextInput from "../../generic/UserInputs/TextInput";
import Star from "../../graphics/Star";
import { ModulesSkeleton, EmptyState } from "./Shared";

function normalizeText(value) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function normalizeFavoris(list) {
    if (!Array.isArray(list)) {
        return [];
    }
    return list
        .map((item) => (typeof item === "string" ? item : item?.code))
        .filter((item) => typeof item === "string" && item !== "");
}

export default function Apps({ isLoading, data, onFavorisChange }) {
    const { toggleConnectorFavorite, getConnectorRedirectUrl, createNotification } = useContext(AppContext);
    const [search, setSearch] = useState("");
    const [openingCode, setOpeningCode] = useState(null);

    if (isLoading) {
        return <ModulesSkeleton />;
    }

    const connecteurs = Array.isArray(data?.connecteurs) ? data.connecteurs : [];
    const favoris = normalizeFavoris(data?.favoris);
    const favoriteCodes = new Set(favoris);

    if (connecteurs.length === 0) {
        return <EmptyState message="Aucune application disponible" />;
    }

    const query = normalizeText(search.trim());
    const filtered = connecteurs.filter((connecteur) => {
        if (!connecteur || typeof connecteur !== "object") {
            return false;
        }
        if (query === "") {
            return true;
        }
        return normalizeText(connecteur.libelle).includes(query) || normalizeText(connecteur.description).includes(query);
    });
    const sorted = [...filtered].sort((a, b) => Number(favoriteCodes.has(b?.code)) - Number(favoriteCodes.has(a?.code)));
    const favorites = sorted.filter((connecteur) => favoriteCodes.has(connecteur.code));
    const others = sorted.filter((connecteur) => !favoriteCodes.has(connecteur.code));

    async function handleToggleFavorite(connecteur) {
        const code = connecteur?.code;
        if (!code) {
            return;
        }
        const add = !favoriteCodes.has(code);
        const result = await toggleConnectorFavorite(code, add);
        if (result?.ok) {
            const returned = normalizeFavoris(result.favoris);
            const updated = returned.length > 0
                ? returned
                : add
                    ? [...favoris, code]
                    : favoris.filter((item) => item !== code);
            onFavorisChange(updated);
        } else {
            createNotification(<span>{result?.error || "Impossible de modifier les favoris"}</span>);
        }
    }

    async function handleOpen(connecteur, portail) {
        if (openingCode) {
            return;
        }
        setOpeningCode(connecteur.code);
        try {
            const res = await getConnectorRedirectUrl(portail, connecteur.code);
            if (res?.ok && res.url) {
                window.open(res.url, "_blank", "noopener");
                return;
            }
            const fallback = portail?.url || connecteur.urlSiteConnecteur || "";
            if (typeof fallback === "string" && fallback.startsWith("http")) {
                let target = fallback;
                try {
                    target = decodeURIComponent(fallback);
                } catch (error) {
                    target = fallback;
                }
                window.open(target, "_blank", "noopener");
                return;
            }
            createNotification(<span>{res?.error || "Impossible d'ouvrir l'application"}</span>);
        } finally {
            setOpeningCode(null);
        }
    }

    function renderAppCard(connecteur, key) {
        const code = connecteur?.code;
        const isFavorite = favoriteCodes.has(code);
        const portails = Array.isArray(connecteur.portails) ? connecteur.portails : [];
        const preferredPortail = portails[0] ?? null;
        const title = typeof connecteur.libelle === "string" && connecteur.libelle !== "" ? connecteur.libelle : "Application";
        const description = typeof connecteur.description === "string" ? connecteur.description : "";
        return (
            <article className="module-card app-card" key={key}>
                <div className="app-card-main">
                    <div className="app-logo-slot">
                        {typeof connecteur.urlIcone === "string" && connecteur.urlIcone !== "" && (
                            <img
                                className="app-logo"
                                src={connecteur.urlIcone}
                                alt=""
                                loading="lazy"
                                onError={(event) => { event.currentTarget.style.display = "none"; }}
                            />
                        )}
                    </div>
                    <div className="app-info">
                        <div className="app-title-row">
                            <h3 className="card-title">{title}</h3>
                            {connecteur.isPremium && <span className="module-badge badge-premium">Premium</span>}
                        </div>
                        {description !== "" && <p className="app-description">{description}</p>}
                    </div>
                    <button
                        type="button"
                        className={`app-favorite${isFavorite ? " active" : ""}`}
                        aria-pressed={isFavorite}
                        aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                        title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                        onClick={() => handleToggleFavorite(connecteur)}
                    >
                        <Star className="app-favorite-star" />
                    </button>
                </div>
                <div className="card-actions">
                    <Button
                        onClick={() => handleOpen(connecteur, preferredPortail)}
                        disabled={openingCode !== null}
                    >
                        {openingCode === code ? "Ouverture…" : "Ouvrir"}
                    </Button>
                </div>
            </article>
        );
    }

    if (filtered.length === 0) {
        return (
            <div className="apps-section">
                <div className="apps-toolbar">
                    <TextInput
                        textType="search"
                        placeholder="Rechercher une application…"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="apps-search"
                    />
                </div>
                <EmptyState message="Aucune application ne correspond à votre recherche" graphic="confused" />
            </div>
        );
    }

    return (
        <div className="apps-section">
            <div className="apps-toolbar">
                <TextInput
                    textType="search"
                    placeholder="Rechercher une application…"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="apps-search"
                />
            </div>
            {favorites.length > 0 && (
                <section className="apps-group">
                    <h4 className="subsection-heading">Mes favoris</h4>
                    <div className="apps-grid">
                        {favorites.map((connecteur, index) => renderAppCard(connecteur, connecteur.code ?? index))}
                    </div>
                </section>
            )}
            {others.length > 0 && (
                <section className="apps-group">
                    {favorites.length > 0 && <h4 className="subsection-heading">Toutes les applications</h4>}
                    <div className="apps-grid">
                        {others.map((connecteur, index) => renderAppCard(connecteur, connecteur.code ?? index))}
                    </div>
                </section>
            )}
        </div>
    );
}
