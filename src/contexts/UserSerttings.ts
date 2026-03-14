import { useContext } from "react";
import { defaultAccountSettings } from "../utils/constants/default";
import useAccountSettings from "../utils/hooks/useAccountSettings";

export interface UserSettingsContext {
	user: ReturnType<typeof useAccountSettings>
	// user: {
	// 	schoolYear: AccountSettingsSimpleEntry<Array<number>>,
	// 	isSchoolYearEnabled: AccountSettingsSimpleEntry<boolean>
	// }
}


const SettingsContext = createContext<UserSettingsContext>({
	user:
});

const useUserSettings = () => useContext(SettingsContext);
