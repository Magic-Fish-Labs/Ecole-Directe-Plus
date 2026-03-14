import { SettingTypes } from "../SettingType";
import { BaseSettingDefinition } from "./Base";

export interface BooleanSettingDefinition extends BaseSettingDefinition<boolean> {
	inputType: SettingTypes.CheckBox | SettingTypes.Switch;
}
