import { useContext } from "react";
import { AppContext } from "../../../App";
import { decodeBase64 } from "../../../utils/utils";
import EncodedHTMLDiv from "../../generic/CustomDivs/EncodedHTMLDiv";
import ContentLoader from "react-content-loader";
import CanardmanSleeping from "../../graphics/CanardmanSleeping";
import ConfusedCanardman from "../../graphics/ConfusedCanardman";

export function normalizeBase64(value) {
    const compact = String(value).replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
    return compact + "=".repeat((4 - (compact.length % 4)) % 4);
}

export function safeDecode(value) {
    if (value === null || value === undefined) {
        return "";
    }
    if (typeof value !== "string") {
        return String(value);
    }
    if (value === "") {
        return "";
    }
    try {
        const decoded = decodeBase64(normalizeBase64(value));
        if (decoded.includes("\uFFFD")) {
            return value;
        }
        return decoded;
    } catch (error) {
        return value;
    }
}

export function encodeBase64(value) {
    const bytes = new TextEncoder().encode(String(value));
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export function MaybeEncodedHTML({ value, className = "" }) {
    if (!value || typeof value !== "string") {
        return null;
    }
    const decoded = safeDecode(value);
    if (decoded !== value) {
        return <EncodedHTMLDiv className={className}>{normalizeBase64(value)}</EncodedHTMLDiv>;
    }
    if (/<\s*[a-z][^>]*>/i.test(value)) {
        return <EncodedHTMLDiv className={className}>{encodeBase64(value)}</EncodedHTMLDiv>;
    }
    return <div className={className}>{value}</div>;
}

export function formatDate(value) {
    if (value === null || value === undefined || value === "") {
        return "";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }
    return date.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
}

export function formatBytes(value) {
    const bytes = Number(value);
    if (!Number.isFinite(bytes) || bytes < 0) {
        return "";
    }
    if (bytes < 1024) {
        return bytes + " o";
    }
    const units = ["Ko", "Mo", "Go", "To"];
    let scaled = bytes;
    let unitIndex = -1;
    do {
        scaled /= 1024;
        unitIndex += 1;
    } while (scaled >= 1024 && unitIndex < units.length - 1);
    return scaled.toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " " + units[unitIndex];
}

export function formatMontant(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) {
        return "";
    }
    return amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export function ModulesSkeleton({ cards = 3 }) {
    const { actualDisplayTheme, useUserSettings } = useContext(AppContext);
    const settings = useUserSettings();
    const animate = settings.get("displayMode") === "quality";
    const backgroundColor = actualDisplayTheme === "dark" ? "#5b5abd" : "#9595cc";
    const foregroundColor = actualDisplayTheme === "dark" ? "#494897" : "#b0b0f2";
    return (
        <div className="modules-skeleton">
            {Array.from({ length: cards }).map((_, index) => (
                <div className="skeleton-card" key={index}>
                    <ContentLoader
                        animate={animate}
                        speed={1}
                        backgroundColor={backgroundColor}
                        foregroundColor={foregroundColor}
                        height="90"
                        style={{ width: "100%" }}
                    >
                        <rect x="0" y="0" rx="10" ry="10" width="45%" height="22" />
                        <rect x="0" y="34" rx="6" ry="6" width="80%" height="14" />
                        <rect x="0" y="58" rx="6" ry="6" width="55%" height="14" />
                    </ContentLoader>
                </div>
            ))}
        </div>
    );
}

export function EmptyState({ message, graphic = "sleeping" }) {
    return (
        <div className="modules-empty-state">
            {graphic === "confused"
                ? <ConfusedCanardman className="empty-state-graphic" />
                : <CanardmanSleeping className="empty-state-graphic" />}
            <span>{message}</span>
        </div>
    );
}

const TITLE_KEYS = ["titre", "libelle", "nom", "sujet", "subject", "title", "question", "intitule", "intitulé", "objet", "message", "name"];
const DATE_KEYS = ["date", "dateCreation", "created", "creation", "dateDebut", "dateFin", "jour", "semaine", "datetime", "horodatage"];

function isScalar(value) {
    return ["string", "number", "boolean"].includes(typeof value);
}

function isBlank(value) {
    return value === null || value === undefined || value === "";
}

function pickEntry(object, keys) {
    for (const key of keys) {
        if (!isBlank(object[key])) {
            return [key, object[key]];
        }
    }
    return [null, undefined];
}

function humanizeKey(key) {
    return String(key)
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]+/g, " ")
        .toLowerCase();
}

function displayValue(value) {
    if (isBlank(value)) {
        return "";
    }
    if (typeof value === "boolean") {
        return value ? "Oui" : "Non";
    }
    const text = String(value);
    return text.length > 400 ? text.slice(0, 400) + "…" : text;
}

function isEmptyData(data) {
    if (data === null || data === undefined) {
        return true;
    }
    if (Array.isArray(data)) {
        return data.length === 0;
    }
    if (typeof data === "object") {
        const values = Object.values(data);
        return values.every((value) => {
            if (isBlank(value)) {
                return true;
            }
            if (Array.isArray(value)) {
                return value.length === 0;
            }
            if (typeof value === "object") {
                return Object.keys(value).length === 0;
            }
            return false;
        });
    }
    return false;
}

function GenericItem({ item }) {
    if (item === null || item === undefined) {
        return null;
    }
    if (isScalar(item)) {
        return (
            <li className="generic-item">
                <span className="generic-scalar">{displayValue(item)}</span>
            </li>
        );
    }
    if (typeof item !== "object") {
        return (
            <li className="generic-item">
                <span className="generic-scalar">{String(item)}</span>
            </li>
        );
    }
    if (Array.isArray(item)) {
        if (item.length === 0) {
            return null;
        }
        return (
            <li className="generic-item">
                <ul className="generic-sub-list">
                    {item.map((child, index) => <GenericItem item={child} key={index} />)}
                </ul>
            </li>
        );
    }

    const [titleKey, title] = pickEntry(item, TITLE_KEYS);
    const [dateKey, date] = pickEntry(item, DATE_KEYS);
    const entries = Object.entries(item);
    const scalarEntries = entries.filter(([key, value]) => key !== titleKey && key !== dateKey && isScalar(value) && !isBlank(value));
    const arrayEntries = entries.filter(([key, value]) => Array.isArray(value) && value.length > 0);
    const objectEntries = entries.filter(([key, value]) => value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0);
    const hasContent = !isBlank(title) || !isBlank(date) || scalarEntries.length > 0 || arrayEntries.length > 0 || objectEntries.length > 0;

    if (!hasContent) {
        return (
            <li className="generic-item">
                <pre className="generic-json">{JSON.stringify(item, null, 2)}</pre>
            </li>
        );
    }

    return (
        <li className="generic-item">
            {(!isBlank(title) || !isBlank(date)) && (
                <div className="generic-item-header">
                    {!isBlank(title) && <h4 className="generic-item-title">{displayValue(title)}</h4>}
                    {!isBlank(date) && <span className="generic-item-date">{displayValue(date)}</span>}
                </div>
            )}
            {scalarEntries.length > 0 && (
                <dl className="generic-fields">
                    {scalarEntries.map(([key, value]) => (
                        <div className="generic-field" key={key}>
                            <dt>{humanizeKey(key)}</dt>
                            <dd>{displayValue(value)}</dd>
                        </div>
                    ))}
                </dl>
            )}
            {arrayEntries.map(([key, value]) => (
                <div className="generic-sub-section" key={key}>
                    <h5>{humanizeKey(key)}</h5>
                    <ul className="generic-sub-list">
                        {value.map((child, index) => <GenericItem item={child} key={index} />)}
                    </ul>
                </div>
            ))}
            {objectEntries.map(([key, value]) => (
                <div className="generic-sub-section" key={key}>
                    <h5>{humanizeKey(key)}</h5>
                    <pre className="generic-json">{JSON.stringify(value, null, 2)}</pre>
                </div>
            ))}
        </li>
    );
}

export function GenericDataList({ data, emptyMessage = "Aucune information disponible" }) {
    if (isEmptyData(data)) {
        return <EmptyState message={emptyMessage} />;
    }
    if (Array.isArray(data)) {
        return (
            <ul className="generic-list">
                {data.map((item, index) => <GenericItem item={item} key={index} />)}
            </ul>
        );
    }
    if (typeof data === "object") {
        const arrayFields = Object.entries(data).filter(([, value]) => Array.isArray(value) && value.length > 0);
        const scalarFields = Object.entries(data).filter(([key, value]) => !isBlank(value) && isScalar(value) && !TITLE_KEYS.includes(key));
        if (arrayFields.length > 0) {
            return (
                <div className="generic-object">
                    {scalarFields.length > 0 && (
                        <dl className="generic-fields generic-object-fields">
                            {scalarFields.map(([key, value]) => (
                                <div className="generic-field" key={key}>
                                    <dt>{humanizeKey(key)}</dt>
                                    <dd>{displayValue(value)}</dd>
                                </div>
                            ))}
                        </dl>
                    )}
                    {arrayFields.map(([key, value]) => (
                        <section className="generic-section" key={key}>
                            <h3>{humanizeKey(key)}</h3>
                            <ul className="generic-list">
                                {value.map((item, index) => <GenericItem item={item} key={index} />)}
                            </ul>
                        </section>
                    ))}
                </div>
            );
        }
        return (
            <ul className="generic-list">
                <GenericItem item={data} />
            </ul>
        );
    }
    return (
        <div className="generic-raw">
            <pre className="generic-json">{String(data)}</pre>
        </div>
    );
}
