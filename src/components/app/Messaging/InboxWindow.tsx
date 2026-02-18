import { ChangeEvent, useContext, useEffect, useState } from "react";
import { AccountContext, AppContext, UserDataContext } from "../../../App";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../generic/PopUps/Tooltip";
import { Window, WindowContent, WindowHeader } from "../../generic/Window";
import useLoadMessages from "../../../hooks/loaders/useLoadMessages";
import { capitalizeFirstLetter } from "../../../utils/utils";
import Inbox from "./Inbox";
import { useCreateMessageFolder } from "../../../hooks/change/useCreateMessageFolder";
import { useRenameMessageFolder } from "../../../hooks/change/useRenameMessageFolder";
import { AccountDataEntry } from "../../../EcoleDirecteHandlerCore/hooks/utils/useAccountDataType";
import TextInput from "../../generic/UserInputs/TextInput";
import EditIcon from "../../graphics/EditIcon";
import FolderTooltip from "./FolderTooltip";
import { Message, MessageFolders } from "../../../mappers/v3/eleves/messages/mapper";
import { stateObject } from "../../../utils/hooks/stateObject";
import { useMoveMessage } from "../../../hooks/change/useMoveMessage";
import DeleteIcon from "../../graphics/DeleteIcon";
import RenameIcon from "../../graphics/RenameIcon";
import { useDeleteFolder } from "../../../hooks/change/useDeleteFolder";

interface ThisUserData {
	messages: AccountDataEntry<Array<Message>>,
	messageFolders: AccountDataEntry<MessageFolders>
}

export default function InboxWindow() {
	const userData = useContext(UserDataContext) as unknown as ThisUserData;
	const {
		messages: { value: messages },
		messageFolders: { value: messageFolders }
	} = userData;

	const [selectedFolderId, setSelectedFolderId] = useState(0);
	const [isEditingFolder, setIsEditingFolder] = useState(false);
	const [newFolderName, setNewFolderName] = useState('');

	const moveMessage = useMoveMessage();
	const createFolder = useCreateMessageFolder();
	const renameFolder = useRenameMessageFolder();
	const deleteFolder = useDeleteFolder();

	async function handleRenameSave() {
		if (newFolderName.trim() !== '') {
			if (selectedFolderId === -3) {
				const newFolder = await createFolder(newFolderName);
				setSelectedFolderId(newFolder.id);
			} else {
				await renameFolder(selectedFolderId, newFolderName); // Call the rename function with folder ID and new name
			}
			setTimeout(() => setIsEditingFolder(false), 0); // Exit editing mode
		}
	};

	const handleRenameCancel = () => {
		setIsEditingFolder(false);
		setNewFolderName(messageFolders.find((item) => item.id === selectedFolderId)?.name || '');
		if (selectedFolderId === -3) {
			setSelectedFolderId(0);
		}
	};

	useEffect(() => {
		if (!isEditingFolder) {
			const currentFolder = messageFolders?.find((item) => item.id === selectedFolderId);
			if (currentFolder) {
				setNewFolderName(currentFolder.name);
			}
		}
	}, [selectedFolderId, messageFolders, isEditingFolder]);

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
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Enter') {
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
	}, [selectedFolderId]);

	const loading = useLoadMessages(selectedFolderId);

	return <Window allowFullscreen={true} className="inbox-window">
		<WindowHeader className="inbox-window-header">
			{console.log(loading, messageFolders)}
			{!loading && messageFolders.length > 1
				? <FolderTooltip messageFolders={messageFolders} isEditingFolderState={stateObject(isEditingFolder, setIsEditingFolder)} selectedFolderIdState={stateObject(selectedFolderId, setSelectedFolderId)} setNewFolderName={setNewFolderName} />
				: null
			}

			{selectedFolderId !== 0 && selectedFolderId !== -1 && selectedFolderId !== -2 && selectedFolderId !== -4 && selectedFolderId !== -3
				? <Tooltip className="edit-folder-tooltip" options={{ placement: "bottom" }} >
					<TooltipTrigger>
						<EditIcon className="edit-folder-icon" />
					</TooltipTrigger>
					<TooltipContent>
						<h3>Modifier le dossier</h3>
						<ul className="edit-folder-container">
							<li className="edit-folder-button-container">
								<button className="edit-folder-button" onClick={() => setIsEditingFolder(true)}>
									<RenameIcon className="edit-folder-icon-tooltip" />
									Renommer
								</button>
							</li>
							<li className="edit-folder-button-container">
								<button className="edit-folder-button delete" onClick={async () => {
									// if the folder dosn't contain any message, we can delete it directly but if it contains messages, we need to move them to the inbox
									if (messages.filter((message) => message.folderId === selectedFolderId).length > 0) {
										await moveMessage(messages.filter((message) => message.folderId === selectedFolderId).map((message) => message.id), 0);
									}
									deleteFolder(selectedFolderId);
									setSelectedFolderId(0);
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
					<h2 id="MessagesTitle" onClick={() => { if (selectedFolderId !== 0 && selectedFolderId !== -1 && selectedFolderId !== -2 && selectedFolderId !== -4) { setIsEditingFolder(true) } }} className={selectedFolderId === 0 || selectedFolderId === -1 || selectedFolderId === -2 || selectedFolderId === -4 ? "prevent-highlight" : ""}>
						{selectedFolderId !== -3
							? capitalizeFirstLetter(messageFolders?.find((item) => item.id === selectedFolderId)?.name ?? "Boîte de réception")
							: "Créer un dossier"
						}
					</h2>
				</div>
			)}
		</WindowHeader>
		<WindowContent>
			<Inbox selectedFolder={selectedFolderId} />
		</WindowContent>
	</Window>
}