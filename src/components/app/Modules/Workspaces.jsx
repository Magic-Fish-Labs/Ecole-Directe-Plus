import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../../App";
import Button from "../../generic/UserInputs/Button";
import { ModulesSkeleton, EmptyState, MaybeEncodedHTML } from "./Shared";
import { CloudBrowser } from "./Cloud";

export default function Workspaces({ isLoading, workspaces, onListChange }) {
    const { fetchWorkspace, joinWorkspace, leaveWorkspace, createNotification } = useContext(AppContext);
    const [selectedId, setSelectedId] = useState(null);
    const [detail, setDetail] = useState(null);

    useEffect(() => {
        if (selectedId === null) {
            setDetail(null);
            return;
        }
        let cancelled = false;
        fetchWorkspace(selectedId).then((workspace) => {
            if (!cancelled && workspace) {
                setDetail(workspace);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [selectedId]);

    if (isLoading) {
        return <ModulesSkeleton />;
    }

    const list = Array.isArray(workspaces) ? workspaces : [];
    if (list.length === 0) {
        return <EmptyState message="Aucun espace de travail disponible" />;
    }

    async function handleJoin(workspace) {
        const result = await joinWorkspace(workspace);
        if (result?.ok) {
            createNotification(<p>Espace de travail rejoint</p>);
            onListChange();
        } else {
            createNotification(<p>{result?.error ?? "Impossible de rejoindre l'espace de travail"}</p>);
        }
    }

    async function handleLeave(workspace) {
        const result = await leaveWorkspace(workspace);
        if (result?.ok) {
            createNotification(<p>Vous avez quitté l'espace de travail</p>);
            onListChange();
        } else {
            createNotification(<p>{result?.error ?? "Impossible de quitter l'espace de travail"}</p>);
        }
    }

    if (selectedId !== null) {
        const current = detail ?? list.find((workspace) => String(workspace.id) === String(selectedId));
        if (current) {
            const droitUtilisateur = current.droitUtilisateur ?? current.parametrage?.droitUtilisateur;
            const cloudReadOnly = current.estMembre === false
                || (typeof droitUtilisateur === "number" && droitUtilisateur > 0 && droitUtilisateur < 2);
            return (
                <div className="workspace-detail">
                    <div className="detail-header">
                        <Button className="back-button" onClick={() => setSelectedId(null)}>← Retour</Button>
                        <h3 className="card-title">{current.titre ?? "Espace de travail"}</h3>
                    </div>
                    <div className="workspace-meta">
                        {current.type && <span className="module-badge">{current.type}</span>}
                        {current.estMembre && <span className="module-badge badge-member">Membre</span>}
                        {current.estAdmin && <span className="module-badge">Administrateur</span>}
                        {typeof current.nbMembres === "number" && (
                            <span className="card-meta">{current.nbMembres} membre{current.nbMembres > 1 ? "s" : ""}</span>
                        )}
                        {current.creePar && <span className="card-meta">Créé par {current.creePar}</span>}
                        {current.creeLe && <span className="card-meta">Créé le {current.creeLe}</span>}
                    </div>
                    <div className="workspace-features">
                        {current.cloud && <span className="module-badge">Cloud</span>}
                        {current.discussion && <span className="module-badge">Discussions</span>}
                        {current.agenda && <span className="module-badge">Agenda</span>}
                    </div>
                    <MaybeEncodedHTML value={current.resume} className="workspace-resume" />
                    {current.cloud && (
                        <div className="workspace-cloud">
                            <h4 className="subsection-heading">Fichiers de l'espace</h4>
                            <CloudBrowser key={selectedId} entity={`W/${selectedId}`} readOnly={cloudReadOnly} />
                        </div>
                    )}
                </div>
            );
        }
        return <ModulesSkeleton />;
    }

    return (
        <div className="workspaces-list">
            {list.map((workspace) => (
                <article className="module-card workspace-card" key={workspace.id}>
                    <div
                        className="workspace-info"
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedId(workspace.id)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                setSelectedId(workspace.id);
                            }
                        }}
                    >
                        <div className="workspace-title-row">
                            <h3 className="card-title">{workspace.titre ?? "Espace de travail"}</h3>
                            {workspace.estMembre && <span className="module-badge badge-member">Membre</span>}
                            {workspace.type && <span className="module-badge">{workspace.type}</span>}
                        </div>
                        {workspace.creePar && <span className="card-meta">Créé par {workspace.creePar}</span>}
                        {workspace.creeLe && <span className="card-meta">Créé le {workspace.creeLe}</span>}
                        <span className="card-meta">{workspace.nbMembres ?? 0} membre{workspace.nbMembres > 1 ? "s" : ""}</span>
                    </div>
                    <div className="card-actions">
                        <Button onClick={() => setSelectedId(workspace.id)}>Ouvrir</Button>
                        {workspace.estMembre
                            ? <Button onClick={() => handleLeave(workspace)}>Quitter</Button>
                            : (
                                <Button
                                    onClick={() => handleJoin(workspace)}
                                    disabled={!workspace.ouvert && !workspace.public}
                                    title={!workspace.ouvert && !workspace.public ? "Cet espace est fermé" : undefined}
                                >
                                    Rejoindre
                                </Button>
                            )}
                    </div>
                </article>
            ))}
        </div>
    );
}
