import * as MessageFolderCreatePost from "../../../../api/contracts/v3/messagerie/classeurs/Post";

export default function mapper(folder: MessageFolderCreatePost.Data) {
	return {
		id: folder.id,
		name: folder.libelle,
		fetchInitiated: false,
		fetched: true,
	}
}