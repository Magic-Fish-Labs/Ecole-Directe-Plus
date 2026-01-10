import * as StudentMessagesGetById from "../../../../api/contracts/v3/eleves/messages/GetById";
import EcoleDirecteFile from "../../../../EcoleDirecteHandlerCore/class/EcoleDirecteFile";

export default function mapper(data: StudentMessagesGetById.Data) {
	return {
		id: data.id,
		read: true,
		files: data.files.map((file) => new EcoleDirecteFile(file.id, file.type, file.libelle)),
		content: {
			id: data.id,
			subject: data.subject,
			date: data.subject,
			content: data.content
		}
	};
}
