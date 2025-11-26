import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";

import {
    WindowsContainer,
    WindowsLayout,
    Window,
    WindowHeader,
    WindowContent
} from "../../generic/Window";

import { AccountContext, AppContext, UserDataContext } from "../../../App";

import "./Messaging.css";
import Inbox from "./Inbox";
import MessageReader from "./MessageReader";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../generic/PopUps/Tooltip";
import FolderIcon from "../../graphics/FolderIcon";
import InboxIcon from "../../graphics/InboxIcon";
import SendIcon from "../../graphics/SendIcon";
import ArchiveIcon from "../../graphics/ArchiveIcon";
import EditIcon from "../../graphics/EditIcon";
import DeleteIcon from "../../graphics/DeleteIcon";
import RenameIcon from "../../graphics/RenameIcon";
import NewFolderIcon from "../../graphics/NewFolderIcon";
import DraftIcon from "../../graphics/DraftIcon";
import { capitalizeFirstLetter } from "../../../utils/utils";
import TextInput from "../../generic/UserInputs/TextInput";


export default function Messaging({ isLoggedIn, activeAccount, fetchMessages, fetchMessageContent, fetchMessageMarkAsUnread, renameFolder, deleteFolder, createFolder, archiveMessage, unarchiveMessage, moveMessage, deleteMessage }) {
    // States
    const navigate = useNavigate();
    const location = useLocation();

    const { selectedUser } = useContext(AccountContext);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [selectedFolder, setSelectedFolder] = useState(0);
    const oldSelectedMessage = useRef(selectedMessage);

    const userData = useContext(UserDataContext);
    const {
        messageFolders: { value: folders },
        messages: { value: messages }
    } = userData;

    const edModule = selectedUser.modules?.find(edModule => edModule.code === "MESSAGERIE");
    let canSendMessages = (edModule?.params?.destAdmin ?? "1") === "1" ||
        (edModule?.params?.destEleve ?? "1") === "1" ||
        (edModule?.params?.destFamille ?? "1") === "1" ||
        (edModule?.params?.destProf ?? "1") === "1" ||
        (edModule?.params?.destEspTravail ?? "1") === "1";
    if (selectedUser.accountType !== "E") {
        canSendMessages = true;
    }

    const [isEditingFolder, setIsEditingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    // behavior
    useEffect(() => {
        document.title = "Messagerie • Ecole Directe Plus";
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        if (isLoggedIn) {
            if (folders === undefined || !folders.find((folder) => folder.id === selectedFolder)?.fetchInitiated) {
                fetchMessages(selectedFolder, controller);
            }
        }

        return () => {
            controller.abort();
        }
    }, [isLoggedIn, activeAccount, selectedFolder, messages, folders]);

    useEffect(() => {
        if (messages === undefined) {
            return;
        }
        if (["#patch-notes", "#policy", "#feedback"].includes(location.hash)) {
            return;
        }
        const controller = new AbortController();
        if (selectedMessage !== null) {
            fetchMessageContent(selectedMessage, controller);
            const parsedHashMessage = parseInt(location.hash.slice(location.hash.lastIndexOf('-') + 1));
            const parsedHashFolder = parseInt(location.hash.slice(1, location.hash.lastIndexOf('-')));
            if (parsedHashMessage !== selectedMessage || parsedHashFolder !== selectedFolder) {
                const newHash = "#" + selectedFolder + '-' + selectedMessage;
                navigate(newHash);
            }
        } else {
            if (location.hash) {
                navigate("#");
            }
        }

        return () => {
            controller.abort();
        }
    }, [location, selectedMessage, messages]);

    useEffect(() => {
        if (oldSelectedMessage.current !== selectedMessage) {
            return;
        }
        if (["#patch-notes", "#policy", "#feedback"].includes(location.hash)) {
            return;
        }
        const parsedHashMessage = parseInt(location.hash.slice(location.hash.lastIndexOf('-') + 1));
        const parsedHashFolder = parseInt(location.hash.slice(1, location.hash.lastIndexOf('-')));

        if (!isNaN(parsedHashMessage) && !isNaN(parsedHashFolder) && parsedHashMessage !== selectedMessage) {
            if (messages) {
                const doesMessageExist = messages?.findIndex((item) => item.id === parsedHashMessage) !== -1;
                if (doesMessageExist) {
                    setSelectedFolder(parsedHashFolder);
                    setSelectedMessage(parsedHashMessage);
                } else {
                    setSelectedFolder(parsedHashFolder);
                    // now we need to fetch the message for the selected folder
                    const controller = new AbortController();
                    fetchMessages(parsedHashFolder, controller);

                    // now we need to select the message after fetching the messages
                    setTimeout(() => {
                        setSelectedMessage(parsedHashMessage);
                    }, 0);
                }
            }
        }
    }, [location, messages, oldSelectedMessage.current, selectedMessage]);

    useEffect(() => {
        oldSelectedMessage.current = selectedMessage;
    }, [selectedMessage]);

    useEffect(() => {
        if (!isEditingFolder) {
            const currentFolder = folders?.find((item) => item.id === selectedFolder);
            if (currentFolder) {
                setNewFolderName(currentFolder.name);
            }
        }
    }, [selectedFolder, folders, isEditingFolder]);



    const handleRenameSave = async () => {
        if (newFolderName.trim() !== '') {
            if (selectedFolder === -3) {
                const controller = new AbortController();
                let newFolder = await createFolder(newFolderName, controller);
                setTimeout(() => setSelectedFolder(newFolder), 0);
                // refresh the folder list and title
            } else {
                await renameFolder(selectedFolder, newFolderName); // Call the rename function with folder ID and new name
            }
            setTimeout(() => setIsEditingFolder(false), 0); // Exit editing mode
        }
    };

    const handleRenameCancel = () => {
        setIsEditingFolder(false);
        setNewFolderName(folders?.find((item) => item.id === selectedFolder)?.name || '');
        if (selectedFolder === -3) {
            setSelectedFolder(0);
        }
    };

    // cancel editiing on click outside of the input
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isEditingFolder && !event.target.closest('.edit-folder-name-container')) {
                handleRenameCancel();
            }
        };

        if (isEditingFolder) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isEditingFolder]);


    // cancel editing on escape key
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                handleRenameCancel();
            }
        };

        if (isEditingFolder) {
            document.addEventListener('keydown', handleKeyDown);
        } else {
            document.removeEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isEditingFolder]);

    useEffect(() => {
        // use code 13 for enter key hint
        const handleKeyDown = (event) => {
            if (event.keyCode === 13 || event.key === 'Enter') {
                handleRenameSave();
            }
        };

        if (isEditingFolder) {
            document.addEventListener('keypress', handleKeyDown);
        } else {
            document.removeEventListener('keypress', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keypress', handleKeyDown);
        };
    }, [isEditingFolder, newFolderName]);

    // changing folder should exit editing mode
    useEffect(() => {
        setIsEditingFolder(false);
    }, [selectedFolder]);

    // JSX
    return (
        <div id="messaging">
            <WindowsContainer name="timetable" allowWindowsManagement={!isEditingFolder}>
                <WindowsLayout direction="row" ultimateContainer={true}>
                    <Window allowFullscreen={true} className="inbox-window">
                        <WindowHeader className="inbox-window-header">
                            {folders !== undefined && folders.length > 1
                                ? <Tooltip className="folder-tooltip" placement="bottom" closeOnClickInside={isTabletLayout} onClick={(event) => event.stopPropagation()}>
                                    <TooltipTrigger> <FolderIcon className="folder-icon" /> </TooltipTrigger>
                                    <TooltipContent className="no-questionmark">
                                        <h3>Dossiers</h3>
                                        <ul className="folders-container">
                                            {folders
                                                .filter((folder) => folder.id !== -3)
                                                // if canSendMessages is false, we don't show the drafts folder and the sent folder
                                                .filter((folder) => canSendMessages || folder.id !== -4)
                                                .sort((a, b) => {
                                                    const order = [0, -1, -2, -4];
                                                    const indexA = order.indexOf(a.id);
                                                    const indexB = order.indexOf(b.id);
                                                    if (indexA === -1 && indexB === -1) return 0;
                                                    if (indexA === -1) return 1;
                                                    if (indexB === -1) return -1;
                                                    return indexA - indexB;
                                                })
                                                .map((folder) => (
                                                    <li key={folder.id} className="folder-button-container">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedFolder(folder.id)
                                                                setSelectedMessage(null);
                                                            }}
                                                            className={`folder-button ${folder.id === selectedFolder ? 'selected-folder' : ''}`}
                                                        >
                                                            {folder.id === 0 ? <InboxIcon className="folder-icon-tooltip" /> : folder.id === -1 ? <SendIcon className="folder-icon-tooltip" /> : folder.id === -2 ? <ArchiveIcon className="folder-icon-tooltip" /> : folder.id === -4 ? <DraftIcon className="folder-icon-tooltip" /> : <FolderIcon className="folder-icon-tooltip" />}
                                                            {capitalizeFirstLetter(folder.name)}
                                                        </button>
                                                    </li>
                                                ))}
                                            <li className="folder-button-container">
                                                <button onClick={
                                                    () => {
                                                        if (!isEditingFolder) {
                                                            setSelectedFolder(-3);
                                                            setNewFolderName('Nouveau dossier');
                                                            setTimeout(() => setIsEditingFolder(true), 0);
                                                            setSelectedMessage(null);
                                                        }
                                                    }
                                                } className="folder-button create-folder"><NewFolderIcon className="folder-icon-tooltip" />Créer un dossier</button>
                                            </li>
                                        </ul>
                                    </TooltipContent>
                                </Tooltip>
                                : null
                            }

                            {selectedFolder !== 0 && selectedFolder !== -1 && selectedFolder !== -2 && selectedFolder !== -4 && selectedFolder !== -3
                                ? <Tooltip className="edit-folder-tooltip" placement="bottom" onClick={(event) => event.stopPropagation()}>
                                    <TooltipTrigger> <EditIcon className="edit-folder-icon" /> </TooltipTrigger>
                                    <TooltipContent>
                                        <h3>Modifier le dossier</h3>
                                        <ul className="edit-folder-container">
                                            <li className="edit-folder-button-container">
                                                <button className="edit-folder-button" onClick={() => setIsEditingFolder(true)}><RenameIcon className="edit-folder-icon-tooltip" />Renommer</button>
                                            </li>
                                            <li className="edit-folder-button-container">
                                                <button className="edit-folder-button delete" onClick={async () => {
                                                    // if the folder dosn't contain any message, we can delete it directly but if it contains messages, we need to move them to the inbox
                                                    if (messages.filter((message) => message.folderId === selectedFolder).length > 0) {
                                                        await moveMessage(messages.filter((message) => message.folderId === selectedFolder).map((message) => message.id), 0);
                                                    }
                                                    deleteFolder(selectedFolder);
                                                    setSelectedFolder(0);
                                                }}><DeleteIcon className="edit-folder-icon-tooltip delete testeee" />Supprimer</button>
                                            </li>
                                        </ul>
                                    </TooltipContent>
                                </Tooltip>
                                : null
                            }

                            {isEditingFolder ? (
                                <div className="edit-folder-name-container">
                                    <TextInput
                                        value={capitalizeFirstLetter(newFolderName)}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        className="edit-folder-name-input"
                                        autoFocus
                                        onFocus={(e) => e.target.select()}
                                        enterKeyHint="done"
                                    />
                                </div>
                            ) : (
                                <div className="MessagesTitle-container">
                                    <h2 id="MessagesTitle" onClick={() => { if (selectedFolder !== 0 && selectedFolder !== -1 && selectedFolder !== -2 && selectedFolder !== -4) { setIsEditingFolder(true) } }} className={selectedFolder === 0 || selectedFolder === -1 || selectedFolder === -2 || selectedFolder === -4 ? "prevent-highlight" : ""}>
                                        {selectedFolder !== -3
                                            ? capitalizeFirstLetter(folders?.find((item) => item.id === selectedFolder)?.name ?? "Boîte de réception")
                                            : "Créer un dossier"
                                        }
                                    </h2>
                                </div>
                            )}
                        </WindowHeader>
                        <WindowContent>
                            <Inbox selectedMessage={selectedMessage} setSelectedMessage={setSelectedMessage} selectedFolder={selectedFolder} fetchMessageMarkAsUnread={fetchMessageMarkAsUnread} />
                        </WindowContent>
                    </Window>
                    <Window growthFactor={3} className="message-content" allowFullscreen={true}>
                        <WindowHeader className="message-reader-window-header">
                            <h2>Message</h2>
                        </WindowHeader>
                        <WindowContent>
                            <MessageReader selectedMessage={selectedMessage} fetchMessageMarkAsUnread={fetchMessageMarkAsUnread} setSelectedMessage={setSelectedMessage} archiveMessage={archiveMessage} unarchiveMessage={unarchiveMessage} moveMessage={moveMessage} deleteMessage={deleteMessage} />
                        </WindowContent>
                    </Window>
                </WindowsLayout>
            </WindowsContainer>
        </div>
    );
}