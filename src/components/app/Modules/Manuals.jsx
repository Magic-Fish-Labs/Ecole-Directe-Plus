import { useContext, useState } from "react";
import { AppContext } from "../../../App";
import Button from "../../generic/UserInputs/Button";
import DefaultFileIcon from "../../graphics/file/DefaultFileIcon";
import { ModulesSkeleton, EmptyState } from "./Shared";

function joinNames(value) {
    if (Array.isArray(value)) {
        return value
            .map((item) => (typeof item === "string" ? item : item?.libelle ?? item?.nom ?? item?.name ?? item?.titre ?? ""))
            .filter(Boolean)
            .join(", ");
    }
    if (typeof value === "string") {
        return value;
    }
    return "";
}

export default function Manuals({ isLoading, manuals }) {
    const { fetchFile, createNotification } = useContext(AppContext);
    const [downloadingId, setDownloadingId] = useState(null);

    if (isLoading) {
        return <ModulesSkeleton />;
    }

    const list = Array.isArray(manuals) ? manuals : [];
    if (list.length === 0) {
        return <EmptyState message="Aucun manuel numérique disponible" />;
    }

    function openManual(manual) {
        const target = manual.url ?? manual.urlTelechargement;
        if (!target) {
            createNotification(<p>Lien indisponible pour ce manuel</p>);
            return;
        }
        window.open(target, "_blank", "noopener,noreferrer");
    }

    async function downloadManual(manual, keyId) {
        const filenameBase = manual.libelle ?? "manuel";
        if (manual.urlTelechargement) {
            const link = document.createElement("a");
            link.href = manual.urlTelechargement;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            document.body.appendChild(link);
            link.click();
            link.remove();
            return;
        }
        if (!manual.idRessource) {
            createNotification(<p>Téléchargement indisponible pour ce manuel</p>);
            return;
        }
        setDownloadingId(keyId);
        try {
            const blob = await fetchFile(manual.idRessource, "MANUELS_SCOLAIRES", {});
            if (!blob || !blob.size || blob.type === "application/json") {
                createNotification(<p>Le manuel n'a pas pu être téléchargé</p>);
                return;
            }
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const guessedExtension = blob.type.includes("pdf") ? ".pdf" : blob.type.includes("epub") ? ".epub" : "";
            link.download = filenameBase + guessedExtension;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } finally {
            setDownloadingId(null);
        }
    }

    return (
        <div className="manuals-list">
            {list.map((manual, index) => {
                const disciplines = joinNames(manual.disciplines);
                const eleves = joinNames(manual.eleves);
                const cover = typeof manual.urlCouverture === "string" && manual.urlCouverture.startsWith("http") ? manual.urlCouverture : "";
                const key = manual.idRessource ?? manual.id ?? index;
                return (
                    <article className="module-card manual-card" key={key}>
                        <div className="manual-cover">
                            {cover
                                ? <img src={cover} alt="" loading="lazy" />
                                : <DefaultFileIcon extension="pdf" />}
                        </div>
                        <div className="manual-info">
                            <h3 className="card-title">{manual.libelle ?? "Manuel"}</h3>
                            {manual.editeur && <span className="card-subtitle">{manual.editeur}</span>}
                            {disciplines && <span className="card-meta">Discipline : {disciplines}</span>}
                            {eleves && <span className="card-meta">Pour : {eleves}</span>}
                            {manual.affecte && <span className="module-badge">Affecté</span>}
                        </div>
                        <div className="card-actions">
                            <Button onClick={() => openManual(manual)} disabled={!manual.url && !manual.urlTelechargement}>
                                Ouvrir
                            </Button>
                            <Button
                                onClick={() => downloadManual(manual, key)}
                                disabled={downloadingId !== null}
                                className={downloadingId === key ? "submitting" : ""}
                            >
                                {downloadingId === key ? "Téléchargement…" : "Télécharger"}
                            </Button>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
