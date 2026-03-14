import { BooleanSettingDefinition } from "./settingDefinitions/Boolean";
import { ChoiceSettingDefinition } from "./settingDefinitions/Choice";
import { ThemeModeSettingDefinition } from "./settingDefinitions/ThemeMode";

export type SettingDefinition = BooleanSettingDefinition | ChoiceSettingDefinition | ThemeModeSettingDefinition;
