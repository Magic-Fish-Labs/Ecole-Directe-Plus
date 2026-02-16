import { useContext } from "react";
import edApi from "../../api/EDApiClient";
import { UserDataContext } from "../../App";
import { AccountDataEntry } from "../../EcoleDirecteHandlerCore/hooks/utils/useAccountDataType";
import { MessageFolders } from "../../mappers/v3/eleves/messages/mapper";
import mapRenamedMessage from "../../mappers/v3/messagerie/classeur/mapper"

interface ThisUserData {
	messageFolders: AccountDataEntry<MessageFolders>;
}

export function useRenameMessageFolder() {
	const userData = useContext(UserDataContext) as unknown as ThisUserData;

	const {
		messageFolders: { set: setMessageFolders }
	} = userData;

	async function renameMessageFolder(folderId: number, newFolderName: string) {
		const renamedFolder = mapRenamedMessage(await edApi.put(`/v3/messagerie/classeur/${folderId}`, {
			libelle: newFolderName
		}));

		setMessageFolders((prev) => {
			const next = [];
			for (const folder of prev) {
				if (folder.id === renamedFolder.id) {
					next.push(folder);
				} else {
					next.push(renamedFolder);
				}
			}
			return next;
		})
		return renamedFolder;
	}
	return renameMessageFolder;
}
