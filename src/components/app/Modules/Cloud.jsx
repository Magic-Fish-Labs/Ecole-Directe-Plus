import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../../App";
import Button from "../../generic/UserInputs/Button";
import TextInput from "../../generic/UserInputs/TextInput";
import PopUp from "../../generic/PopUps/PopUp";
import FolderIcon from "../../graphics/FolderIcon";
import NewFolderIcon from "../../graphics/NewFolderIcon";
import RenameIcon from "../../graphics/RenameIcon";
import TrashIcon from "../../graphics/TrashIcon";
import DownloadIcon from "../../graphics/DownloadIcon";
import RefreshIcon from "../../graphics/RefreshIcon";
import DefaultFileIcon from "../../graphics/file/DefaultFileIcon";
import { ModulesSkeleton, EmptyState, formatBytes, formatDate } from "./Shared";

function parentPath(path) {
    const parts = String(path).split("\\");
    parts.pop();
    return parts.join("\\");
}

function fileExtension(libelle) {
    const name = String(libelle ?? "");
    const dotIndex = name.lastIndexOf(".");
    if (dotIndex <= 0 || dotIndex === name.length - 1) {
        return "";
    }
    return name.slice(dotIndex + 1).toLowerCase();
}

function cloudMetaFromNode(node) {
    if (!node || typeof node !== "object") {
        return null;
    }
    const quota = Number(node.quota) || 0;
    const taille = Number(node.taille) || 0;
    if (!quota && !node.readonly) {
        return null;
    }
    return { quota, taille, readonly: Boolean(node.readonly) };
}

function extractListing(nodes, requestedPath) {
    if (!Array.isArray(nodes) || nodes.length === 0) {
        return { items: [], folderId: requestedPath || null, meta: null };
    }
    if (nodes.length === 1) {
        const only = nodes[0];
        const matchesRequested = requestedPath
            ? only.id === requestedPath
            : only.type === "folder" && only.libelle === "/";
        if (only.type === "folder" && matchesRequested) {
            return {
                items: Array.isArray(only.children) ? only.children : [],
                folderId: only.id ?? requestedPath,
                meta: cloudMetaFromNode(only),
            };
        }
    }
    if (!requestedPath) {
        const firstId = typeof nodes[0]?.id === "string" ? nodes[0].id : null;
        return {
            items: nodes,
            folderId: firstId ? parentPath(firstId) : null,
            meta: cloudMetaFromNode(nodes.find((node) => Number(node?.quota) > 0) ?? null),
        };
    }
    return { items: nodes, folderId: requestedPath, meta: null };
}

export function CloudBrowser({ entity = null, initialNodes, onRootNodesChange, readOnly = false }) {
    const {
        fetchCloudNode,
        createCloudNode,
        renameCloudNode,
        deleteCloudNodes,
        uploadCloudFile,
        downloadCloudFile,
        createNotification,
    } = useContext(AppContext);

    const [stack, setStack] = useState([{ path: "", label: "Racine", readonly: false }]);
    const [nodes, setNodes] = useState(() => (Array.isArray(initialNodes) ? extractListing(initialNodes, "").items : []));
    const [rootFolderId, setRootFolderId] = useState(() => (Array.isArray(initialNodes) ? extractListing(initialNodes, "").folderId : null));
    const [cloudMeta, setCloudMeta] = useState(() => (Array.isArray(initialNodes) ? extractListing(initialNodes, "").meta : null));
    const [isLoading, setIsLoading] = useState(initialNodes === undefined);
    const [isBusy, setIsBusy] = useState(false);
    const [dialog, setDialog] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);
    const listingsRef = useRef({});
    const loadedRootRef = useRef(false);
    const fileInputRef = useRef(null);

    const currentPath = stack[stack.length - 1].path;
    const currentFolderId = stack.length === 1 ? rootFolderId : currentPath;
    const currentReadOnly = stack.length === 1 ? Boolean(cloudMeta?.readonly) : Boolean(stack[stack.length - 1].readonly);
    const writeAllowed = !readOnly && !currentReadOnly;
    const storageRatio = cloudMeta?.quota > 0 ? Math.max(0, Number(cloudMeta.taille) || 0) / cloudMeta.quota : 0;

    useEffect(() => {
        if (initialNodes !== undefined && initialNodes !== null) {
            const { items, folderId, meta } = extractListing(initialNodes, "");
            listingsRef.current[""] = items;
            setRootFolderId((old) => folderId ?? old);
            if (meta) {
                setCloudMeta(meta);
            }
            if (stack.length === 1) {
                setNodes(items);
            }
            loadedRootRef.current = true;
            return;
        }
        if (initialNodes === undefined && !loadedRootRef.current) {
            loadedRootRef.current = true;
            loadRoot();
        }

        async function loadRoot() {
            setIsLoading(true);
            try {
                const result = await fetchCloudNode("", entity);
                const { items, folderId, meta } = extractListing(result, "");
                listingsRef.current[""] = items;
                setRootFolderId((old) => folderId ?? old);
                if (meta) {
                    setCloudMeta(meta);
                }
                setNodes(items);
            } finally {
                setIsLoading(false);
            }
        }
    }, [initialNodes, stack.length]);

    async function refreshCurrent() {
        setIsLoading(true);
        try {
            const result = await fetchCloudNode(currentPath, entity);
            const { items, folderId, meta } = extractListing(result, currentPath);
            if (meta) {
                setCloudMeta(meta);
            }
            if (currentPath === "") {
                setRootFolderId((old) => folderId ?? old);
            }
            listingsRef.current[currentPath] = items;
            setNodes(items);
            if (currentPath === "" && typeof onRootNodesChange === "function") {
                onRootNodesChange(items);
            }
        } finally {
            setIsLoading(false);
        }
    }

    async function loadFolder(path, label, nodeReadOnly = false) {
        setIsLoading(true);
        try {
            const result = await fetchCloudNode(path, entity);
            const { items } = extractListing(result, path);
            listingsRef.current[path] = items;
            setNodes(items);
            setStack((old) => [...old, { path, label, readonly: nodeReadOnly }]);
        } finally {
            setIsLoading(false);
        }
    }

    function navigateInto(node) {
        if (node.type !== "folder") {
            return;
        }
        const hasLoadedChildren = Array.isArray(node.children) && node.isLoaded !== false;
        if (hasLoadedChildren) {
            listingsRef.current[node.id] = node.children;
            setNodes(node.children);
            setStack((old) => [...old, { path: node.id, label: node.libelle, readonly: Boolean(node.readonly) }]);
        } else {
            loadFolder(node.id, node.libelle, node.readonly);
        }
    }

    function handleActivate(node) {
        if (node.type === "folder") {
            navigateInto(node);
            return;
        }
        if (node.url) {
            window.open(node.url, "_blank", "noopener,noreferrer");
            return;
        }
        handleDownload(node);
    }

    function goToCrumb(index) {
        if (index >= stack.length - 1) {
            return;
        }
        const nextStack = stack.slice(0, index + 1);
        const path = nextStack[nextStack.length - 1].path;
        setStack(nextStack);
        setNodes(listingsRef.current[path] ?? []);
    }

    async function handleDownload(node) {
        setDownloadingId(node.id);
        try {
            const blob = await downloadCloudFile(node.id, entity);
            if (!blob || !blob.size) {
                createNotification(<p>Le fichier n'a pas pu être téléchargé</p>);
                return;
            }
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = node.libelle ?? "fichier";
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } finally {
            setDownloadingId(null);
        }
    }

    async function handleCreateFolder() {
        const name = (dialog?.value ?? "").trim();
        if (!name) {
            return;
        }
        if (!writeAllowed) {
            createNotification(<p>La création de dossiers n’est pas autorisée ici (lecture seule)</p>);
            return;
        }
        if (!currentFolderId) {
            createNotification(<p>Impossible de déterminer le dossier courant</p>);
            return;
        }
        setIsBusy(true);
        try {
            const result = await createCloudNode(currentFolderId, name, "folder", entity);
            if (result?.ok) {
                setDialog(null);
                await refreshCurrent();
            } else {
                createNotification(<p>{result?.error ?? "Le dossier n'a pas pu être créé"}</p>);
            }
        } finally {
            setIsBusy(false);
        }
    }

    async function handleRename() {
        const name = (dialog?.value ?? "").trim();
        if (!name || !dialog?.node) {
            return;
        }
        setIsBusy(true);
        try {
            const result = await renameCloudNode(dialog.node, name, entity);
            if (result?.ok) {
                setDialog(null);
                await refreshCurrent();
            } else {
                createNotification(<p>{result?.error ?? "Le renommage a échoué"}</p>);
            }
        } finally {
            setIsBusy(false);
        }
    }

    async function handleDelete() {
        if (!dialog?.node) {
            return;
        }
        setIsBusy(true);
        try {
            const result = await deleteCloudNodes([dialog.node], entity);
            if (result?.ok) {
                setDialog(null);
                await refreshCurrent();
            } else {
                createNotification(<p>{result?.error ?? "La suppression a échoué"}</p>);
            }
        } finally {
            setIsBusy(false);
        }
    }

    async function handleUpload(file) {
        if (!file) {
            return;
        }
        if (!writeAllowed) {
            createNotification(<p>Le téléversement n’est pas autorisé ici (lecture seule)</p>);
            return;
        }
        if (!currentFolderId) {
            createNotification(<p>Impossible de déterminer le dossier courant</p>);
            return;
        }
        setIsBusy(true);
        try {
            const result = await uploadCloudFile(file, currentFolderId, entity);
            if (result?.ok) {
                await refreshCurrent();
            } else {
                createNotification(<p>{result?.error ?? "Le fichier n'a pas pu être téléversé"}</p>);
            }
        } finally {
            setIsBusy(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }

    if (isLoading) {
        return <ModulesSkeleton cards={3} />;
    }

    const items = Array.isArray(nodes) ? nodes : [];

    return (
        <div className="cloud-browser">
            <div className="cloud-toolbar">
                <Button
                    className="cloud-tool-button"
                    onClick={() => setDialog({ type: "create", value: "" })}
                    disabled={isBusy || !currentFolderId || !writeAllowed}
                    title={!writeAllowed ? "Lecture seule : la création de dossiers n’est pas autorisée ici" : undefined}
                >
                    <NewFolderIcon className="cloud-tool-icon" />
                    Nouveau dossier
                </Button>
                <Button
                    className="cloud-tool-button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isBusy || !currentFolderId || !writeAllowed}
                    title={!writeAllowed ? "Lecture seule : le téléversement n’est pas autorisé ici" : undefined}
                >
                    Téléverser
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="cloud-file-input"
                    onChange={(event) => handleUpload(event.target.files?.[0])}
                />
                <Button className="cloud-tool-button" onClick={refreshCurrent} disabled={isBusy || isLoading}>
                    <RefreshIcon className="cloud-tool-icon" />
                    Actualiser
                </Button>
                {(!writeAllowed || readOnly || currentReadOnly) && <span className="cloud-readonly-badge">Lecture seule</span>}
                {cloudMeta?.quota > 0 && (
                    <div className="cloud-storage-meter" title="Espace de stockage utilisé">
                        <span className="cloud-storage-label">
                            {formatBytes(cloudMeta.taille ?? 0)} / {formatBytes(cloudMeta.quota)}
                        </span>
                        <div className="cloud-storage-bar">
                            <div
                                className={`cloud-storage-fill${storageRatio >= 0.9 ? " almost-full" : ""}${storageRatio >= 1 ? " full" : ""}`}
                                style={{ width: `${Math.min(100, storageRatio * 100)}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
            <nav className="cloud-breadcrumb" aria-label="Chemin">
                {stack.map((crumb, index) => (
                    <span className="crumb-wrapper" key={crumb.path + "-" + index}>
                        {index > 0 && <span className="crumb-separator">›</span>}
                        <button
                            type="button"
                            className={`crumb${index === stack.length - 1 ? " current" : ""}`}
                            disabled={index === stack.length - 1}
                            onClick={() => goToCrumb(index)}
                        >
                            {crumb.label}
                        </button>
                    </span>
                ))}
            </nav>
            {items.length === 0
                ? <EmptyState message="Ce dossier est vide" />
                : (
                    <ul className="cloud-items">
                        {items.map((node, index) => (
                            <li className={`cloud-item${node.readonly ? " readonly" : ""}`} key={node.id ?? index}>
                                <button type="button" className="cloud-item-main" onClick={() => handleActivate(node)}>
                                    {node.type === "folder"
                                        ? <FolderIcon className="cloud-item-icon" />
                                        : <DefaultFileIcon extension={fileExtension(node.libelle)} className="cloud-item-icon" />}
                                    <span className="cloud-item-name">{node.libelle}</span>
                                    <span className="cloud-item-date">{formatDate(node.date)}</span>
                                    <span className="cloud-item-size">{node.type === "file" ? formatBytes(node.taille) : ""}</span>
                                </button>
                                <div className="cloud-item-actions">
                                    {node.type === "file" && downloadingId === node.id && <span className="cloud-busy">…</span>}
                                    <Button
                                        className="cloud-action"
                                        disabled={isBusy || node.readonly || !writeAllowed}
                                        onClick={() => setDialog({ type: "rename", node, value: node.libelle })}
                                        title={!writeAllowed || node.readonly ? "Lecture seule : le renommage n’est pas autorisé" : "Renommer"}
                                    >
                                        <RenameIcon className="cloud-action-icon" />
                                    </Button>
                                    <Button
                                        className="cloud-action"
                                        disabled={isBusy || node.readonly || !writeAllowed}
                                        onClick={() => setDialog({ type: "delete", node })}
                                        title={!writeAllowed || node.readonly ? "Lecture seule : la suppression n’est pas autorisée" : "Supprimer"}
                                    >
                                        <TrashIcon className="cloud-action-icon" />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            {dialog && (
                <PopUp className="cloud-dialog-pop-up" onClose={() => setDialog(null)}>
                    <div className="cloud-dialog">
                        {dialog.type === "create" && (
                            <>
                                <h3 className="dialog-title">Nouveau dossier</h3>
                                <TextInput
                                    textType="text"
                                    placeholder="Nom du dossier"
                                    value={dialog.value ?? ""}
                                    onChange={(event) => setDialog((old) => ({ ...old, value: event.target.value }))}
                                />
                                <div className="dialog-actions">
                                    <Button onClick={() => setDialog(null)}>Annuler</Button>
                                    <Button disabled={isBusy || !(dialog.value ?? "").trim()} onClick={handleCreateFolder}>
                                        {isBusy ? "Création…" : "Créer"}
                                    </Button>
                                </div>
                            </>
                        )}
                        {dialog.type === "rename" && (
                            <>
                                <h3 className="dialog-title">Renommer</h3>
                                <TextInput
                                    textType="text"
                                    placeholder="Nouveau nom"
                                    value={dialog.value ?? ""}
                                    onChange={(event) => setDialog((old) => ({ ...old, value: event.target.value }))}
                                />
                                <div className="dialog-actions">
                                    <Button onClick={() => setDialog(null)}>Annuler</Button>
                                    <Button disabled={isBusy || !(dialog.value ?? "").trim()} onClick={handleRename}>
                                        {isBusy ? "Renommage…" : "Renommer"}
                                    </Button>
                                </div>
                            </>
                        )}
                        {dialog.type === "delete" && (
                            <>
                                <h3 className="dialog-title">Supprimer « {dialog.node?.libelle} » ?</h3>
                                <div className="dialog-actions">
                                    <Button onClick={() => setDialog(null)}>Annuler</Button>
                                    <Button disabled={isBusy} onClick={handleDelete}>
                                        {isBusy ? "Suppression…" : "Supprimer"}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </PopUp>
            )}
        </div>
    );
}

export default function Cloud({ isLoading, initialNodes, onRootNodesChange, readOnly = false }) {
    if (isLoading || initialNodes === undefined) {
        return <ModulesSkeleton cards={3} />;
    }
    if (initialNodes === null) {
        return <EmptyState message="Le cloud n'a pas pu être chargé" graphic="confused" />;
    }
    return <CloudBrowser initialNodes={initialNodes} onRootNodesChange={onRootNodesChange} readOnly={readOnly} />;
}
