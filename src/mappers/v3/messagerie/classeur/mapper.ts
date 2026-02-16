import * as MessageFolderRenamePut from "../../../../api/contracts/v3/messagerie/classeur/PutById";

export default function mapper(folder: MessageFolderRenamePut.Data) {
	return {
		id: folder.id,
		name: folder.libelle,
		fetchInitiated: false,
		fetched: true,
	}
}