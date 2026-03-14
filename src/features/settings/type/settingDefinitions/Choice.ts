import { SettingTypes } from "../SettingType";
import { BaseSettingDefinition } from "./Base";

export interface ChoiceSettingDefinition<T extends readonly unknown [] = readonly unknown []> extends BaseSettingDefinition<T[number]> {
	inputType: SettingTypes.Radio | SettingTypes.SegmentedButtons;
	choices: T
}
