import { ModulesSkeleton, EmptyState, formatDate, formatMontant } from "./Shared";

function formatSolde(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) {
        return "—";
    }
    return amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function formatSignedMontant(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) {
        return "";
    }
    const formatted = amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
    return amount > 0 ? "+" + formatted : formatted;
}

function toDisplayText(value) {
    if (value === null || value === undefined) {
        return "";
    }
    if (typeof value === "object") {
        return JSON.stringify(value);
    }
    return String(value);
}

function compteTypeLabel(typeCompte) {
    if (typeCompte === "portemonnaie") {
        return "Porte-monnaie";
    }
    if (typeCompte === "pmactivite") {
        return "Porte-monnaie activités";
    }
    return "Compte";
}

function amountClassName(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount === 0) {
        return "";
    }
    return amount > 0 ? " positive" : " negative";
}

function EcritureRow({ ecriture, nested = false }) {
    if (!ecriture || typeof ecriture !== "object") {
        return null;
    }
    const amount = Number(ecriture.montant);
    const hasAmount = Number.isFinite(amount);
    const subEcritures = Array.isArray(ecriture.ecritures) ? ecriture.ecritures : [];
    return (
        <li className={`wallet-entry${nested ? " wallet-entry-nested" : ""}`}>
            <div className="wallet-entry-line">
                {ecriture.couleurPastille && (
                    <span className="wallet-pastille" style={{ backgroundColor: String(ecriture.couleurPastille) }} />
                )}
                <span className="wallet-entry-date">{formatDate(ecriture.date)}</span>
                <span className="wallet-entry-libelle">{toDisplayText(ecriture.libelle)}</span>
                {ecriture.lettrage !== undefined && ecriture.lettrage !== null && ecriture.lettrage !== "" && (
                    <span className="module-badge">{toDisplayText(ecriture.lettrage)}</span>
                )}
                {hasAmount && <span className={`wallet-amount${amountClassName(amount)}`}>{formatSignedMontant(amount)}</span>}
            </div>
            {ecriture.infoComp !== undefined && ecriture.infoComp !== null && ecriture.infoComp !== "" && (
                <span className="wallet-entry-info">{toDisplayText(ecriture.infoComp)}</span>
            )}
            {subEcritures.length > 0 && (
                <ul className="wallet-sub-entries">
                    {subEcritures.map((subEcriture, index) => (
                        <EcritureRow ecriture={subEcriture} nested key={index} />
                    ))}
                </ul>
            )}
        </li>
    );
}

function EcheanceRow({ echeance }) {
    if (!echeance || typeof echeance !== "object") {
        return null;
    }
    const amount = Number(echeance.montant);
    return (
        <li className="wallet-entry">
            <div className="wallet-entry-line">
                <span className="wallet-entry-date">{formatDate(echeance.date)}</span>
                <span className="wallet-entry-libelle">{toDisplayText(echeance.libelle)}</span>
                {Number.isFinite(amount) && <span className="wallet-amount">{formatMontant(amount)}</span>}
            </div>
        </li>
    );
}

function AcompteRow({ item }) {
    if (!item || typeof item !== "object") {
        return null;
    }
    const label = typeof item.libelle === "string" ? item.libelle : typeof item.libelleCompte === "string" ? item.libelleCompte : "";
    const rawAmount = item.montant ?? item.montantVersement ?? item.solde;
    const amount = Number(rawAmount);
    const hasLabel = label !== "";
    const hasAmount = Number.isFinite(amount);
    if (!hasLabel && !hasAmount) {
        return null;
    }
    return (
        <li className="wallet-entry">
            <div className="wallet-entry-line">
                <span className="wallet-entry-date">{formatDate(item.date)}</span>
                <span className="wallet-entry-libelle">{hasLabel ? label : "—"}</span>
                {hasAmount && <span className={`wallet-amount${amountClassName(amount)}`}>{formatSignedMontant(amount)}</span>}
            </div>
            {item?.info !== undefined && item?.info !== null && item?.info !== "" && (
                <span className="wallet-entry-info">{toDisplayText(item.info)}</span>
            )}
        </li>
    );
}

function renderCompte(compte, key) {
    if (!compte || typeof compte !== "object") {
        return null;
    }
    const avenir = Array.isArray(compte.avenir) ? compte.avenir : [];
    const ecritures = Array.isArray(compte.ecritures) ? compte.ecritures : [];
    const echeances = Array.isArray(compte.echeances) ? compte.echeances : [];
    const accomptes = Array.isArray(compte.accomptesEtCautions)
        ? compte.accomptesEtCautions.filter((item) => {
            if (!item || typeof item !== "object") {
                return false;
            }
            const label = item.libelle ?? item.libelleCompte;
            const rawAmount = item.montant ?? item.montantVersement ?? item.solde;
            return (typeof label === "string" && label !== "") || Number.isFinite(Number(rawAmount));
        })
        : [];
    return (
        <article className="module-card wallet-card" key={key}>
            <div className="wallet-head">
                <div className="wallet-head-main">
                    <h3 className="card-title">{toDisplayText(compte.libelleCompte) || toDisplayText(compte.libelle) || "Compte"}</h3>
                    <span className="module-badge">{compteTypeLabel(compte.typeCompte)}</span>
                    {compte.disponible === false && <span className="module-badge badge-warning">Indisponible</span>}
                </div>
                <div className="wallet-balance-block">
                    <span className="wallet-balance">{formatSolde(compte.solde)}</span>
                    {compte.isPMPayable === true && <span className="card-meta">Paiement en ligne disponible</span>}
                </div>
            </div>
            {avenir.length > 0 && (
                <section className="wallet-section">
                    <h4 className="subsection-heading">À venir</h4>
                    <ul className="wallet-entries">
                        {avenir.map((ecriture, index) => <EcritureRow ecriture={ecriture} key={index} />)}
                    </ul>
                </section>
            )}
            {ecritures.length > 0 && (
                <section className="wallet-section">
                    <h4 className="subsection-heading">Historique</h4>
                    <ul className="wallet-entries">
                        {ecritures.map((ecriture, index) => <EcritureRow ecriture={ecriture} key={index} />)}
                    </ul>
                </section>
            )}
            {echeances.length > 0 && (
                <section className="wallet-section">
                    <h4 className="subsection-heading">Échéances</h4>
                    <ul className="wallet-entries">
                        {echeances.map((echeance, index) => <EcheanceRow echeance={echeance} key={index} />)}
                    </ul>
                </section>
            )}
            {accomptes.length > 0 && (
                <section className="wallet-section">
                    <h4 className="subsection-heading">Accomptes et cautions</h4>
                    <ul className="wallet-entries">
                        {accomptes.map((item, index) => <AcompteRow item={item} key={index} />)}
                    </ul>
                </section>
            )}
        </article>
    );
}

export default function Wallet({ isLoading, wallet }) {
    if (isLoading) {
        return <ModulesSkeleton />;
    }
    const comptes = Array.isArray(wallet?.comptes) ? wallet.comptes : [];
    if (comptes.length === 0) {
        return <EmptyState message="Aucun porte-monnaie disponible" />;
    }
    return (
        <div className="wallet-list">
            {comptes.map((compte, index) => renderCompte(compte, compte?.id ?? index))}
        </div>
    );
}
