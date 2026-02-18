import { Dispatch, SetStateAction, useContext } from "react";
import { AccountContext, AppContext } from "../../../App";
import { capitalizeFirstLetter } from "../../../utils/utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "../../generic/PopUps/Tooltip";
import FolderIcon from "../../graphics/FolderIcon";
import "./FolderTooltip.css"
import { MessageFolders } from "../../../mappers/v3/eleves/messages/mapper";
import { User } from "../../../EcoleDirecteHandlerCore/mappers/login";
import { StateObject } from "../../../utils/hooks/stateObject";
import NewFolderIcon from "../../graphics/NewFolderIcon";
import { getMarkedFolderIcon } from "./MessageReader/MarkedFolderIcons";

function getSendMessageAbility(selectedUser: User) {
	if (selectedUser.accountType !== "E") return true;

	const edModule = selectedUser.modules?.find(edModule => edModule.code === "MESSAGERIE");
	return (edModule?.params?.destAdmin ?? "1") === "1" ||
		(edModule?.params?.destEleve ?? "1") === "1" ||
		(edModule?.params?.destFamille ?? "1") === "1" ||
		(edModule?.params?.destProf ?? "1") === "1" ||
		(edModule?.params?.destEspTravail ?? "1") === "1";
}

function sortMessageFolders(messageFolders: MessageFolders, canSendMessages: boolean) {
	return messageFolders
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
}

export default function FolderTooltip({
	messageFolders,
	selectedFolderIdState,
	isEditingFolderState,
	setNewFolderName
}: {
	messageFolders: MessageFolders,
	selectedFolderIdState: StateObject<number>,
	isEditingFolderState: StateObject<boolean>,
	setNewFolderName: Dispatch<SetStateAction<string>>
}) {
	const { isTabletLayout } = useContext(AppContext);
	const { selectedUser } = useContext(AccountContext);

	const { value: selectedFolderId, set: setSelectedFolderId } = selectedFolderIdState;
	const { value: isEditingFolder, set: setIsEditingFolder } = isEditingFolderState;

	const canSendMessages = getSendMessageAbility(selectedUser);


	return <Tooltip className="folder-tooltip" options={{ placement: "bottom", closeOnClickInside: isTabletLayout }}>
		<TooltipTrigger>
			<FolderIcon className="folder-icon" />
		</TooltipTrigger>
		<TooltipContent className="no-questionmark">
			<h3>Dossiers</h3>
			<ul className="folders-container">
				{
					sortMessageFolders(messageFolders, canSendMessages)
						.map((folder) => (
							<li key={folder.id} className="folder-button-container">
								<button
									onClick={() => {
										setSelectedFolderId(folder.id)
									}}
									className={`folder-button ${folder.id === selectedFolderId ? 'selected-folder' : ''}`}
								>
									{getMarkedFolderIcon(folder.id) }
									{capitalizeFirstLetter(folder.name)}
								</button>
							</li>
						))}
				<li className="folder-button-container">
					<button onClick={
						() => {
							if (!isEditingFolder) {
								setSelectedFolderId(-3);
								setNewFolderName('Nouveau dossier');
								setTimeout(() => setIsEditingFolder(true), 0);
							}
						}
					} className="folder-button create-folder">
						<NewFolderIcon className="folder-icon-tooltip" />
						Créer un dossier
					</button>
				</li>
			</ul>
		</TooltipContent>
	</Tooltip>
}
