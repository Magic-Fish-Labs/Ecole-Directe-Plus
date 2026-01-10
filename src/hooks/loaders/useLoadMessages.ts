import { useContext, useEffect, useState } from "react";
import { AccountContext, UserDataContext } from "../../App";
import EDApiClient from "../../api/EDApiClient";
import { Account } from "../../EcoleDirecteHandlerCore/hooks/useEcoleDirecteAccount";
import { AccountDataDispatch } from "../../EcoleDirecteHandlerCore/hooks/utils/useAccountDataType";
import * as StudentMessagesGet from "../../api/contracts/v3/eleves/messages/Get";
import * as FamilyMessagesGet from "../../api/contracts/v3/familles/messages/Get";
import mapStudentMessages from "../../mappers/v3/eleves/messages/mapper";
import mapFamilyMessages from "../../mappers/v3/familles/messages/mapper";

type Messages = ReturnType<typeof mapStudentMessages>;
type MessageFolders = ReturnType<typeof mapMessageFolders>;
type RawMessages = StudentMessagesGet.Data["messages"];
type RawMessageFolders = StudentMessagesGet.Data["classeurs"];

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

const api = EDApiClient.getInstance();

function idToFolderInfo(id: number) {
	switch (id) {
		case 0: return { type: "received", id: 0 } as const;
		case -1: return { type: "sent", id: 0 } as const;
		case -2: return { type: "draft", id: 0 } as const;
		case -3: return { type: "archived", id: 0 } as const;
		default: return { type: "classeur", id } as const;
	}
}

function mapMessageFolders(folders: RawMessageFolders) {
	let sortedMessageFolders = folders;
	return sortedMessageFolders.map((folder) => {
		return {
			id: folder.id,
			name: folder.libelle,
			fetchInitiated: false,
			fetched: false,
		}
	});
}

async function handleStudentRequest(selectedFolderId: number, userId: number): Promise<{ messages: Messages, folders: MessageFolders }> {
	const folderInfo = idToFolderInfo(selectedFolderId);
	const query: StudentMessagesGet.Query = {
		typeRecuperation: folderInfo.type,
		idClasseur: folderInfo.id,
		force: false, getAll: 1, onlyRead: "", order: "desc", orderBy: "date"
	}

	const data = await api.get(`/v3/eleves/${userId}/messages`, { anneeMessages: "2025-2026" }, query);

	const responseMessages = mapStudentMessages(data);
	const responseFolders = mapMessageFolders(data.classeurs);

	return { messages: responseMessages, folders: responseFolders };
}

// These functions are 

async function handleFamilyRequest(selectedFolderId: number, userId: number): Promise<{ messages: Messages, folders: MessageFolders }> {
	const folderInfo = idToFolderInfo(selectedFolderId);
	const query: FamilyMessagesGet.Query = {
		typeRecuperation: folderInfo.type,
		idClasseur: folderInfo.id,
		force: false, getAll: 1, onlyRead: "", order: "desc", orderBy: "date"
	}

	const data = await api.get(`/v3/familles/${userId}/messages`, { anneeMessages: "2025-2026" }, query);

	const responseMessages = mapFamilyMessages(data);
	const responseFolders = mapMessageFolders(data.classeurs);

	return { messages: responseMessages, folders: responseFolders };
}

export default function useLoadMessages(selectedFolderId: number) {
	const account = useContext(AccountContext) as unknown as Account;

	const userData = useContext(UserDataContext) as unknown as ThisUserData;

	const {
		messages: { set: setMessages },
		messageFolders: { value: messageFolders, set: setMessageFolders }
	} = userData;

	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!account.selectedUser) return setLoading(false);
		const selectedFolder = messageFolders.find((folder) => folder.id === selectedFolderId);
		if (selectedFolder && selectedFolder.fetchInitiated || selectedFolder?.fetched) return setLoading(false);

		let cancelled = false;

		setMessageFolders((prev) => prev.map((folder) =>
			folder.id === selectedFolderId
				? { ...folder, fetchInitiated: true }
				: folder
		));

		let response: Promise<{ messages: Messages, folders: MessageFolders }>;
		if (account.selectedUser.accountType === "E") {
			response = handleStudentRequest(selectedFolderId, account.selectedUser.id);
		} else {
			response = handleFamilyRequest(selectedFolderId, account.selectedUser.familyId);
		}

		response.then((data) => {
			if (cancelled) return;
			setMessages((prev) => {
				const next = prev ? [...prev] : [];
				for (const message of data.messages) {
					if (!next.some((newMessage) => newMessage.id === message.id)) {
						next.push(message);
					}
				}
				return next;
			});
			setMessageFolders((prev) => {
				const next = [...prev];
				for (const folder of data.folders) {
					if (!next.some((newMessageFolder) => newMessageFolder.id === selectedFolderId)) {
						next.push(folder);
					}
				}
				const fetchedFolder = next.find((folder) => folder.id === selectedFolderId);
				if (fetchedFolder) {
					fetchedFolder.fetched = true;
					fetchedFolder.fetchInitiated = false;
				}
				return next;
			});
		})
			.catch((error) => {
				if (cancelled) return;
				console.error(error);
			}) // !:! report l'erreur
			.finally(() => setLoading(false));

		return () => {
			cancelled = true;
		}
	}, [selectedFolderId]);

	return loading;
}
