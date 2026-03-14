import { SettingDefinition } from "../type/SettingsDefinition";
import { StateCreator } from "zustand";

type ZustandSet<T> = (
	partial: T | Partial<T> | ((state: T) => T | Partial<T>),
	replace?: boolean,
) => void;

type StoreEntry<TValue> = {
	value: TValue;
	set: (valueOrUpdater: TValue | ((prev: TValue) => TValue)) => void;
};

type SettingsStoreState<
	T extends readonly SettingDefinition[],
	TGlobal extends boolean,
> = {
	[K in (TGlobal extends true
		? Extract<T[number], { isGlobal: true }>
		: Exclude<T[number], { isGlobal: true }>)["settingId"]]: StoreEntry<
		Extract<
			(TGlobal extends true
				? Extract<T[number], { isGlobal: true }>
				: Exclude<T[number], { isGlobal: true }>),
			{ settingId: K }
		>["default"]
	>;
};


function toStoreEntry<TValue>(
	settingDefinition: SettingDefinition & { default: TValue },
	storeSet: ZustandSet<Record<string, StoreEntry<unknown>>>,
): StoreEntry<TValue> {
	return {
		value: settingDefinition.default,
		set: (valueOrUpdater) => {
			storeSet((prev) => ({
				[settingDefinition.settingId]: {
					...prev[settingDefinition.settingId],
					value:
						typeof valueOrUpdater === "function"
							? (valueOrUpdater as ((prev: TValue) => TValue))(prev[settingDefinition.settingId].value as TValue)
							: valueOrUpdater,
				},
			}));
		},
	};
}

// const toStoreRecord = <T extends SettingDefinition>(settingsDefinition: T[], storeSet: ZustandSet<Record<string, StoreEntry<unknown>>>): Record<T["settingId"], StoreEntry<T["default"]>> =>
//   Object.fromEntries(settingsDefinition.map(settingDefinition => [settingDefinition.settingId, toStoreEntry(settingDefinition, storeSet)])) as Record<T["settingId"], StoreEntry<T["default"]>>

function toStoreRecord<T extends SettingDefinition>(
	definitions: T[],
	storeSet: ZustandSet<Record<string, StoreEntry<unknown>>>,
): {
	[K in T["settingId"]]: StoreEntry<Extract<T, { settingId: K }>["default"]>;
} {
	return Object.fromEntries(
		definitions.map((def) => [def.settingId, toStoreEntry(def, storeSet)]),
	) as any;
}

export function defineSettings<T extends readonly SettingDefinition[]>(
	settingsDefinition: [...T],
) {
	type UserStoreState = SettingsStoreState<T, false>;

	const userStateCreator: StateCreator<UserStoreState> = (set) => {
		return toStoreRecord(settingsDefinition.filter((settingDefinition) => !settingDefinition.isGlobal), set) as UserStoreState;
	};
	return { userSettingStateCreator: userStateCreator, registry: settingsDefinition };
}
