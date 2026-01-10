import * as FamilyMessagesGetById from "../../../../api/contracts/v3/familles/messages/GetById";
import EcoleDirecteFile from "../../../../EcoleDirecteHandlerCore/class/EcoleDirecteFile";

export default function mapper(data: FamilyMessagesGetById.Data) {
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
