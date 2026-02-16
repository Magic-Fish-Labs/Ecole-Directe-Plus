import { useContext } from "react";
import edApi from "../../api/EDApiClient";
import { UserDataContext } from "../../App";
import { AccountDataEntry } from "../../EcoleDirecteHandlerCore/hooks/utils/useAccountDataType";
import { MessageFolders } from "../../mappers/v3/eleves/messages/mapper";

interface ThisUserData {
	messageFolders: AccountDataEntry<MessageFolders>;
}

export function useDeleteFolder() {
	const userData = useContext(UserDataContext) as unknown as ThisUserData;

	const {
		messageFolders: { set: setMessageFolders }
	} = userData;

	async function deleteFolder(folderId: number) {
		await edApi.delete(`/v3/messagerie/classeur/${folderId}`, {});
		setMessageFolders((prev) => prev.filter((folder) => folder.id !== folderId))
	}
	return deleteFolder;
}
