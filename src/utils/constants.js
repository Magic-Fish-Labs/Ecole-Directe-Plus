export const KEY = "THIS_IS_A_PLACEHOLDER_FOR_YOUR_OWN_SECURITY" // Replace this key with a string of your choice

export const LocalStorageNames = {
    ENCRYPTED_CREDENTIALS: "encryptedCredentials",
    TOKEN: "token",
    USERS: "users",
    LAST_SELECTED_USER: "lastSelectedUser",
}

export const Browsers = {
    CHROMIUM: 0,
    FIREFOX: 1,
    SAFARI: 2,
    CHROME: 3,
    OPERA: 4,
    EDGE: 5,
}

export const BrowserExtensionDownloadLink = {
    [Browsers.CHROMIUM]: "https://chromewebstore.google.com/detail/ecole-directe-plus-unbloc/jglboadggdgnaicfaejjgmnfhfdnflkb?hl=fr",
    [Browsers.FIREFOX]: "https://unblock.ecole-directe.plus/edpu-0.1.4.xpi",
    [Browsers.CHROME]: "https://chromewebstore.google.com/detail/ecole-directe-plus-unbloc/jglboadggdgnaicfaejjgmnfhfdnflkb?hl=fr",
    [Browsers.SAFARI]: "/edp-unblock",
    [Browsers.OPERA]: "https://chromewebstore.google.com/detail/ecole-directe-plus-unbloc/jglboadggdgnaicfaejjgmnfhfdnflkb?hl=fr",
    [Browsers.EDGE]: "https://microsoftedge.microsoft.com/addons/detail/ecole-directe-plus-unbloc/bghggiemmicjhglgnilchjfnlbcmehgg",
}
