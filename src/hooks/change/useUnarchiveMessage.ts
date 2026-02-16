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

export function useUnarchiveMessage() {
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

	function unarchiveMessage(messageIds: Array<number>) {
		if (selectedUser.accountType == "E") {
			edApi.put(`/v3/eleves/${selectedUser.id}/messages`, {
				action: "desarchiver",
				anneeMessages: (isSchoolYearEnabled ? schoolYear : getCurrentSchoolYear()).join("-"),
				ids: messageIds
			});
		} else {
			edApi.put(`/v3/familles/${selectedUser.familyId}/messages`, {
				action: "desarchiver",
				anneeMessages: (isSchoolYearEnabled ? schoolYear : getCurrentSchoolYear()).join("-"),
				ids: messageIds
			});
		}
	}

	return unarchiveMessage;
}
