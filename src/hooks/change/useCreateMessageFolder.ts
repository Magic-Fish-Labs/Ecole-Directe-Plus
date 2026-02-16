import { useContext } from "react";
import edApi from "../../api/EDApiClient";
import { UserDataContext } from "../../App";
import { AccountDataEntry } from "../../EcoleDirecteHandlerCore/hooks/utils/useAccountDataType";
import { MessageFolders } from "../../mappers/v3/eleves/messages/mapper";
import mapNewMessage from "../../mappers/v3/messagerie/classeurs/mapper"

interface ThisUserData {
	messageFolders: AccountDataEntry<MessageFolders>;
}

export function useCreateMessageFolder() {
	const userData = useContext(UserDataContext) as unknown as ThisUserData;

	const {
		messageFolders: { set: setMessageFolders }
	} = userData;

	async function createFolder(folderName: string) {
		const newFolder = mapNewMessage(await edApi.post("/v3/messagerie/classeurs", {
			libelle: folderName
		}));

		setMessageFolders((prev) => {
			return [...prev, newFolder];
		})
		return newFolder;
	}
	return createFolder;
}
