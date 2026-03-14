import { ReactNode } from "react";
import { CategoryKey } from "../CategoryKey";

export interface BaseSettingDefinition<TDefault> {
	/** A unique string that will act as an identifier for the setting */
	settingId: string;
	/** A unique string that will act as an identifier for the setting */
	category: CategoryKey;
	isGlobal?: boolean;
	default: TDefault;
	label: ReactNode;
	description?: ReactNode;
	info?: ReactNode;
}
