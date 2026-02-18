import ScrollShadedDiv from "../../../generic/CustomDivs/ScrollShadedDiv";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../generic/PopUps/Tooltip";
import InboxIcon from "../../../graphics/InboxIcon";
import PrintIcon from "../../../graphics/PrintIcon";

import mapStudentMessages, { Message } from "../../../../mappers/v3/eleves/messages/mapper";
import { AccountDataDispatch } from "../../../../EcoleDirecteHandlerCore/hooks/utils/useAccountDataType";
import { useMarkMessageAsUnread } from "../../../../hooks/change/useMarkMessageAsUnread";
import FolderIcon from "../../../graphics/FolderIcon";
import { MouseEventHandler, useContext } from "react";
import { UserDataContext } from "../../../../App";
import { capitalizeFirstLetter } from "../../../../utils/utils";
import { getMarkedFolderIcon } from "./MarkedFolderIcons";
import { useMoveMessage } from "../../../../hooks/change/useMoveMessage";
import ArchiveIcon from "../../../graphics/ArchiveIcon";
import DeleteIcon from "../../../graphics/DeleteIcon";
import MarkAsUnread from "../../../graphics/MarkAsUnread";
import { useArchiveMessage } from "../../../../hooks/change/useArchiveMessage";
import { useUnarchiveMessage } from "../../../../hooks/change/useUnarchiveMessage";
import { useDeleteMessage } from "../../../../hooks/change/useDeleteMessage";
import DownloadIcon from "../../../graphics/DownloadIcon";

type Messages = ReturnType<typeof mapStudentMessages>["messages"];
type MessageFolders = ReturnType<typeof mapStudentMessages>["messageFolders"];

interface ThisUserData {
	messages: {
		value: Messages,
		set: AccountDataDispatch<Messages>
	},
	messageFolders: {
		value: MessageFolders,
		set: AccountDataDispatch<MessageFolders>
	}
}

export default function MessageReaderFooter({ message }: { message: Message }) {

	const userData = useContext(UserDataContext) as unknown as ThisUserData;
	const {
		messageFolders: {
			value: messageFolders
		},
		messages: { set: setMessages }
	} = userData;

	const markMessageAsUnread = useMarkMessageAsUnread();
	const archiveMessage = useArchiveMessage();
	const unarchiveMessage = useUnarchiveMessage();
	const moveMessage = useMoveMessage();
	const deleteMessage = useDeleteMessage();

	/**
	 * @description Handle the onclick event when the "mark as unread" button is clicked
	 */
	const handleMarkAsUnread: MouseEventHandler<HTMLButtonElement> = (event) => {
		event.preventDefault();
		event.stopPropagation();
		markMessageAsUnread([message.id]);

		// Set the local message's read state
		message.read = false;
		// rerender x(
		setMessages((prev) => prev); // I hate the current data structure that allows to do this

	}

	return <div className="email-footer">
		<ScrollShadedDiv enableSideShadows={true} className="scroll-footer-div">
			<ul className="attachments-container">
				{message && message.files && message.files.length > 0
					? message.files.map((file) => <li key={file.id}><button className="attachment" onClick={() => file.download()}><DownloadIcon className="download-icon" />{file.name + "." + file.extension}</button></li>)
					: <li className="no-attatchemnts-messages"><p>Aucun fichier joint</p></li>}
			</ul>
		</ScrollShadedDiv>

		<div className="actions-container">
			<Tooltip className="action-button-main" >
				<TooltipTrigger><button className="action-button" onClick={() => {
					// !:! ouvre un nouvel onglet mtnt ? (comportement sus à vérifier)
					// only print the content of the rendered message
					const printWindow = window.open("", "_blank");
					printWindow.document.write("<html><head><title>Impression</title></head><body>");
					printWindow.document.write(document.querySelector("#message-reader .message-content").innerHTML);
					printWindow.document.write("</body></html>");
					printWindow.document.close();
					printWindow.print();
				}}>
					<PrintIcon alt="Icône d'impression" /></button>
				</TooltipTrigger>
				<TooltipContent>Imprimer</TooltipContent>
			</Tooltip>
			{message.folderId != -2 && message.folderId != -1 && message.folderId != -4 ? (
				<Tooltip className="action-button-main" options={{ closeOnClickInside: true }} ><TooltipTrigger><button className="action-button"><FolderIcon alt={"Icône de fichier"} /></button></TooltipTrigger><TooltipContent>
					<TooltipContent className="no-questionmark">
						<h3>Changer De Dossier</h3>
						<ul className="folders-container">
							{messageFolders
								.filter((folder) => folder.id !== -3 && folder.id !== -2 && folder.id !== -1 && folder.id !== -4)
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
									<li key={folder.id} className={`folder-button-container ${folder.id === message.folderId ? 'not-allowed' : ''}`}>
										<button
											onClick={() => {
												moveMessage([message.id], folder.id);
											}}
											disabled={folder.id === message.folderId}
											className={`folder-button ${folder.id === message.folderId ? 'selected-folder cannot-click' : ''}`}
										>
											{getMarkedFolderIcon(folder.id) ?? <FolderIcon className="folder-icon-tooltip" />}
											{capitalizeFirstLetter(folder.name)}
										</button>
									</li>
								))}
						</ul>
					</TooltipContent>
				</TooltipContent></Tooltip>
			) : null}
			{message.folderId === -2 ? (
				<Tooltip className="action-button-main">
					<TooltipTrigger>
						<button className="action-button" onClick={() => unarchiveMessage([message.id])}>
							<InboxIcon />
						</button>
					</TooltipTrigger>
					<TooltipContent>Désarchiver</TooltipContent>
				</Tooltip>
			) : message.folderId !== -1 && message.folderId !== -4 ? (
				<Tooltip className="action-button-main">
					<TooltipTrigger>
						<button className="action-button" onClick={() => archiveMessage([message.id])}>
							<ArchiveIcon />
						</button>
					</TooltipTrigger>
					<TooltipContent>Archiver</TooltipContent>
				</Tooltip>
			) : null}
			{message.folderId === -4 ? (
				<Tooltip className="action-button-main">
					<TooltipTrigger>
						<button className="action-button" onClick={() => deleteMessage([message.id])}>
							<DeleteIcon />
						</button>
					</TooltipTrigger>
					<TooltipContent>Supprimer</TooltipContent>
				</Tooltip>
			) : null}
			<Tooltip className="action-button-main">
				<TooltipTrigger>
					<button className="action-button" onClick={handleMarkAsUnread}>
						<MarkAsUnread />
					</button>
				</TooltipTrigger>
				<TooltipContent>Marquer comme non lu</TooltipContent>
			</Tooltip>
		</div>
	</div>
}