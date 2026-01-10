import { useContext, useEffect, useState } from "react";
import { AccountContext, UserDataContext } from "../../App";
import EDApiClient from "../../api/EDApiClient";
import { Account } from "../../EcoleDirecteHandlerCore/hooks/useEcoleDirecteAccount";
import { AccountDataDispatch } from "../../EcoleDirecteHandlerCore/hooks/utils/useAccountDataType";
import mapStudentMessageContent from "../../mappers/v3/eleves/messages/mapperById";
import mapFamilyMessageContent from "../../mappers/v3/familles/messages/mapperById";
import * as StudentMessageContentGet from "../../api/contracts/v3/eleves/messages/GetById";
import * as FamilyMessageContentGet from "../../api/contracts/v3/familles/messages/GetById";
import mapStudentMessages from "../../mappers/v3/eleves/messages/mapper";

type Messages = ReturnType<typeof mapStudentMessages>["messages"];

interface ThisUserData {
	messages: {
		value: Messages,
		set: AccountDataDispatch<Messages>
	},
}

const api = EDApiClient.getInstance();

function getMode(messageFoderId) {
	if (messageFoderId === -1 || messageFoderId == -4) {
		return "expediteur";
	} else {
		return "destinataire";
	}
}

async function handleStudentRequest(messageFolderId: number, userId: number, selectedMessageId: number) {
	const query: StudentMessageContentGet.Query = {
		mode: getMode(messageFolderId)
	}

	const data = await api.get(`/v3/eleves/${userId}/messages/${selectedMessageId}`, { anneeMessages: "2025-2026" }, query);

	return mapStudentMessageContent(data);
}

// These functions are the same but for typing convenience it is splitted

async function handleFamilyRequest(messageFolderId: number, userId: number, selectedMessageId: number) {
	const query: FamilyMessageContentGet.Query = {
		mode: getMode(messageFolderId),
	}

	const data = await api.get(`/v3/familles/${userId}/messages/${selectedMessageId}`, { anneeMessages: "2025-2026" }, query);

	return mapFamilyMessageContent(data);
}

export default function useLoadMessageContent(selectedMessageId: number | null) {
	const account = useContext(AccountContext) as unknown as Account;

	const userData = useContext(UserDataContext) as unknown as ThisUserData;
	const {
		messages: { value: messages, set: setMessages },
	} = userData;

	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!selectedMessageId) return setLoading(false);
		const targetMessage = messages?.find((message) => message.id === selectedMessageId);
		if (!targetMessage) {
			console.warn(`Targetted message of id '${targetMessage}' not found.`);
			return setLoading(false);
		}
		if (targetMessage.content) return setLoading(false);
		if (!account.selectedUser) return setLoading(false);

		setLoading(true);
		let cancelled = false;

		let response: Promise<ReturnType<typeof mapStudentMessageContent>>;
		if (account.selectedUser.accountType === "E") {
			response = handleStudentRequest(targetMessage.folderId, account.selectedUser.id, selectedMessageId);
		} else {
			response = handleFamilyRequest(targetMessage.folderId, account.selectedUser.familyId, selectedMessageId);
		}

		response.then((detailedMessage) => {
			if (cancelled) return;
			setMessages((prev) => {
				const targetMessage = prev.find((message) => message.id === detailedMessage.id);
				if (!targetMessage) {
					console.warn(`Targetted message of id '${targetMessage}' not found.`);
					return prev;
				}
				targetMessage.content = detailedMessage.content;
				return prev.map((message) => {
					if (message.id !== detailedMessage.id) return message;
					return { ...message, ...detailedMessage };
				});;
			});
		})
			.catch(console.error) // !:! report l'erreur
			.finally(() => setLoading(false));

		return () => {
			cancelled = true;
		}
	}, [selectedMessageId, account.selectedUser.id]);

	return loading;
}
