import * as FamilyMessagesGet from "../../../../api/contracts/v3/familles/messages/Get";

export default function mapper(data: FamilyMessagesGet.Data) {
	return {
		messages: data.messages.received.map((message) => {
			return {
				date: message.date,
				files: structuredClone(message.files)?.map((file) => new File(file.id, file.type, file.libelle)),
				from: message.from,
				id: message.id,
				folderId: message.idClasseur,
				read: message.read,
				subject: message.subject,
				content: null,
			}
		}),
		messageFolders: data.classeurs.map((folder) => {
			return {
				id: folder.id,
				name: folder.libelle,
				fetchInitiated: false,
				fetched: false,
			}
		})
	};
}
