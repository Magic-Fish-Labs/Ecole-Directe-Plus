import { useContext } from "react";
import { AccountContext, SettingsContext } from "../../App";
import { Account } from "../../EcoleDirecteHandlerCore/hooks/useEcoleDirecteAccount";
import edApi from "../../api/EDApiClient";
import { AccountSettingsSimpleEntry } from "../../utils/hooks/useAccountSettingsType";
import { getCurrentSchoolYear } from "../../utils/date";

type ThisAccountContext = Account;

interface ThisUserSettings {
	user: {
		schoolYear: AccountSettingsSimpleEntry<Array<number>>,
		isSchoolYearEnabled: AccountSettingsSimpleEntry<boolean>
	}
}

export function useDeleteMessage() {
	const { selectedUser } = useContext(AccountContext) as unknown as ThisAccountContext;

	const userSettings = useContext(SettingsContext) as unknown as ThisUserSettings;
	const {
		isSchoolYearEnabled: {
			value: isSchoolYearEnabled
		},
		schoolYear: {
			value: schoolYear
		}
	} = userSettings.user;

	function deleteMessage(messageIds: Array<number>) {
		if (selectedUser.accountType == "E") {
			edApi.put(`/v3/eleves/${selectedUser.id}/messages`, {
				action: "supprimer",
				ids: messageIds,
				anneeMessages: (isSchoolYearEnabled ? schoolYear : getCurrentSchoolYear()).join("-"),
				idDossier: -5,
			});
		} else {
			edApi.put(`/v3/familles/${selectedUser.familyId}/messages`, {
				action: "supprimer",
				ids: messageIds,
				anneeMessages: (isSchoolYearEnabled ? schoolYear : getCurrentSchoolYear()).join("-"),
				idDossier: -5
			});
		}
	}

	return deleteMessage;
}
