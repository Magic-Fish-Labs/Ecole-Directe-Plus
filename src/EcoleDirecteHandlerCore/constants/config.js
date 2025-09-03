export const apiVersion = "4.83.0";
export const guestDataPath = {
    login: "/guestData/default/login.json",
    grades: "/guestData/default/grades.json",
    incoming_homeworks: "/guestData/default/incoming_homeworks.json",
    detailed_homeworks: "/guestData/default/detailed_homeworks.json",
}

export const guestCredentials = {
    username: "a",
    password: "a"
}

/**
 * EXPLANATIONS ON SPECIAL SETTINGS PROPERTIES :
 * isCommon  : tells if the setting is common between all the users of a same account
 * isSavable : tells if the setting is savable or if it will be reset at every start of the application
 * 
 * SETTNG TYPE MEANING AND SUBPROPERTIES NEEDED :
 * 0 : boolean
 * 1 : multiple defined choices
 *     - list of choices values (the default value doesn't have to be one of those)
 *     - list of choices to display (these lists need to be the same size, choice values and display will be linked by index)
 * 2 : number
 *     - min
 *     - max
 *     - step
 */

/**{
    keepLoggedIn: false,
    displayTheme: "auto",
    displayMode: "quality",
    isSepiaEnabled: false,
    isHighContrastEnabled: false,
    isGrayscaleEnabled: false,
    isPhotoBlurEnabled: false,
    isPartyModeEnabled: true,
    isStreamerModeEnabled: false,
    gradeScale: 20,
    isGradeScaleEnabled: false,
    schoolYear: getCurrentSchoolYear(),
    isSchoolYearEnabled: false,
    isLucioleFontEnabled: false,
    windowArrangement: [],
    allowWindowsArrangement: true,
    dynamicLoading: true,
    shareSettings: true,
    negativeBadges: false,
    allowAnonymousReports: true,
    isDevChannel: false
} */