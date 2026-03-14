import { SettingTypes } from "../SettingType";
import { BaseSettingDefinition } from "./Base";

export interface ThemeModeSettingDefinition extends BaseSettingDefinition<
	"light" | "dark" | "auto"
> {
	inputType: SettingTypes.ThemeMode;
	choices: ["light", "dark", "auto"];
}
