import { useContext } from "react";
import { AccountContext } from "../../App";
import { Account } from "../../EcoleDirecteHandlerCore/hooks/useEcoleDirecteAccount";
import edApi from "../../api/EDApiClient";

type ThisAccountContext = Account;

export function useMoveMessage() {
	const { selectedUser: { id, accountType } } = useContext(AccountContext) as unknown as ThisAccountContext;

	

	async function moveMessage(messageIds: Array<number>, folderId: number) {
		if (accountType == "E") {
			await edApi.put(`/v3/eleves/${id}/messages`, {
				action: "deplacer",
				ids: messageIds,
				idClasseur: folderId
			});
		} else {
			await edApi.put(`/v3/familles/${id}/messages`, {
				action: "deplacer",
				ids: messageIds,
				idClasseur: folderId,
			});
		}
	}

	return moveMessage;
}
