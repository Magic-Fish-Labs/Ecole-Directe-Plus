import * as MessagesGet from "../../../../api/contracts/v3/eleves/messages/Get";

export default function mapper(data: MessagesGet.Data) {
	const sortedMessages = data.messages.received.map((message) => {
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
	});
	return sortedMessages;
}
