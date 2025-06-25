import { getCurrentSchoolYear } from "../date"

export const defaultGlobalSettings = {
	keepLoggedIn: {
		value: false,
		properties: {
			type: 0,
		}
	},
	isDevChannel: {
		value: false,
		properties: {
			type: 0,
		}
	},
	shareSettings: {
		value: false,
		properties: {
			type: 0,
		}
	}
}

export const defaultAccountSettings = {
	keepLoggedIn: {
		value: false,
		properties: {},
	},
	displayTheme: {
		value: "auto",
		properties: {},
	},
	displayMode: {
		value: "quality",
		properties: {},
	},
	isSepiaEnabled: {
		value: false,
		properties: {},
	},
	isHighContrastEnabled: {
		value: false,
		properties: {},
	},
	isGrayscaleEnabled: {
		value: false,
		properties: {},
	},
	isPhotoBlurEnabled: {
		value: false,
		properties: {},
	},
	isPartyModeEnabled: {
		value: true,
		properties: {},
	},
	isPeriodEventEnabled: {
		value: true,
		properties: {},
	},
	isStreamerModeEnabled: {
		value: false,
		properties: {},
	},
	gradeScale: {
		value: 20,
		properties: {
			min: 0,
			max: 100,
		},
	},
	isGradeScaleEnabled: {
		value: false,
		properties: {},
	},
	schoolYear: {
		value: getCurrentSchoolYear(),
		properties: {},
	},
	isSchoolYearEnabled: {
		value: false,
		properties: {},
	},
	isLucioleFontEnabled: {
		value: false,
		properties: {},
	},
	windowArrangement: {
		value: [],
		properties: {},
	},
	allowWindowsArrangement: {
		value: true,
		properties: {},
	},
	dynamicLoading: {
		value: true,
		properties: {},
	},
	shareSettings: {
		value: true,
		properties: {},
	},
	negativeBadges: {
		value: false,
		properties: {},
	},
	allowAnonymousReports: {
		value: true,
		properties: {},
	},
	isDevChannel: {
		value: false,
		properties: {},
	},
	selectedChart: {
		value: 0,
		properties: {},
	},
}
