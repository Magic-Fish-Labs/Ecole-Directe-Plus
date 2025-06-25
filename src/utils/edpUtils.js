import CryptoJS from 'crypto-js';

import { KEY, LocalStorageKeys } from "./constants/constants"

export function encrypt(chain) {
    if (!chain) {
        return chain
    }
    return CryptoJS.AES.encrypt(chain, KEY).toString()
}

export function decrypt(chain) {
    if (!chain) {
        return chain
    }
    return CryptoJS.AES.decrypt(chain, KEY).toString(CryptoJS.enc.Utf8)
}

export function getInitialEcoleDirecteSessions() {
    const credentials = JSON.parse(decrypt(localStorage.getItem(LocalStorageKeys.ENCRYPTED_CREDENTIALS)));
    const token = localStorage.getItem(LocalStorageKeys.TOKEN);
    const users = localStorage.getItem(LocalStorageKeys.USERS);
    const selectedUserIndex = localStorage.getItem(LocalStorageKeys.LAST_SELECTED_USER);

    return {
        account: {
            username: credentials?.username ? credentials.username : "",
            password: credentials?.password ? credentials.password : "",
            token: token ? token : "",
            users: users ? JSON.parse(users) : null,
            selectedUserIndex: selectedUserIndex ? parseInt(selectedUserIndex) : 0,
        }
    }
}