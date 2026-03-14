import { create } from "zustand";
import { CategoryKey } from "./type/CategoryKey";
import { SettingTypes } from "./type/SettingType";
import { defineSettings } from "./utils/defineSettings";

export const { userSettingStateCreator, registry: settingsRegistry } =
	defineSettings([
		{
			label: "Thème d'affichage",
			settingId: "displayThemeMode",
			inputType: SettingTypes.ThemeMode,
			category: CategoryKey.Graphics,
			default: "auto",
			choices: ["light", "dark", "auto"],
		},
		{
			label: "Mode d'affichage",
			settingId: "displayMode",
			inputType: SettingTypes.SegmentedButtons,
			category: CategoryKey.Graphics,
			default: "balanced",
			choices: ["quality", "balanced", "performance"],
		},
		{
			label: "Normaliser les barêmes",
			settingId: "normalizeScale",
			inputType: SettingTypes.Switch,
			category: CategoryKey.Account,
			default: false,
		},
	] as const);

export const useUserSettingStore = create(userSettingStateCreator);

export const test = useUserSettingStore((store) => store.displayThemeMode);
