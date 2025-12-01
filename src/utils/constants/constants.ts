export const KEY = "THIS_IS_A_PLACEHOLDER_FOR_YOUR_OWN_SECURITY" // Replace this key with a string of your choice

export const LocalStorageKeys = {
    ENCRYPTED_CREDENTIALS: "encryptedCredentials",
    TOKEN: "token",
    USERS: "users",
    LAST_SELECTED_USER: "lastSelectedUser",
}

export enum Browsers {
    CHROMIUM = 0,
    FIREFOX,
    SAFARI,
    CHROME,
    OPERA,
    EDGE,
}

export const BrowserExtensionDownloadLink: Record<Browsers, string> = {
    [Browsers.CHROMIUM]: "https://chromewebstore.google.com/detail/ecole-directe-plus-unbloc/jglboadggdgnaicfaejjgmnfhfdnflkb?hl=fr",
    [Browsers.FIREFOX]: "https://unblock.ecole-directe.plus/edpu-0.1.4.xpi",
    [Browsers.CHROME]: "https://chromewebstore.google.com/detail/ecole-directe-plus-unbloc/jglboadggdgnaicfaejjgmnfhfdnflkb?hl=fr",
    [Browsers.SAFARI]: "/edp-unblock",
    [Browsers.OPERA]: "https://chromewebstore.google.com/detail/ecole-directe-plus-unbloc/jglboadggdgnaicfaejjgmnfhfdnflkb?hl=fr",
    [Browsers.EDGE]: "https://microsoftedge.microsoft.com/addons/detail/ecole-directe-plus-unbloc/bghggiemmicjhglgnilchjfnlbcmehgg",
}

export const BrowserLabels: Record<Browsers, string> = {
    [Browsers.CHROMIUM]: "Chromium",
    [Browsers.FIREFOX]: "Firefox",
    [Browsers.CHROME]: "Chrome",
    [Browsers.SAFARI]: "Safari",
    [Browsers.OPERA]: "Opera",
    [Browsers.EDGE]: "Edge",
}

export enum OperatingSystems {
    WINDOWS = 0,
    ANDROID,
    LINUX,
    MACOS,
    IOS,
}

export const OperatingSystemLabels: Record<OperatingSystems, string> = {
    [OperatingSystems.WINDOWS]: "Windows",
    [OperatingSystems.ANDROID]: "Android",
    [OperatingSystems.LINUX]: "Linux",
    [OperatingSystems.MACOS]: "MacOS",
    [OperatingSystems.IOS]: "iOS",
}
