import { v5 as uuidv5 } from "uuid";
import sha256 from 'js-sha256';
import { Browsers, OperatingSystems } from "./constants/constants";

const UUID_NAMESPACE = "7bbc8dba-be5b-4ff2-b516-713692d5f601";

export function areOccurenciesEqual(obj1, obj2) {
    if (typeof obj1 !== "object" || typeof obj2 !== "object") {
        return obj1 === obj2;
    }
    if (obj1?.length !== obj2?.length) {
        return false;
    }
    for (const i in obj1) {
        if (obj2.hasOwnProperty(i)) {
            if (!areOccurenciesEqual(obj1[i], obj2[i])) {
                return false;
            }
        }
    }
    return true;
}

export function createUserLists(accountNumber) {
    const list = [];
    for (let i = 0; i < accountNumber; i++) {
        list.push(undefined);
    }
    return list;
}

export function getISODate(date) {
    if (typeof date === "string") {
        date = new Date(date)
    }
    return date.getUTCFullYear() +
        "-" +
        (date.getUTCMonth() + 1 + "").padStart(2, "0") +
        "-" +
        date.getUTCDate().toString().padStart(2, "0")
}

export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function decodeBase64(string) {
    const decodedText = atob(string);

    const bytes = new Uint8Array(decodedText.length);
    for (let i = 0; i < decodedText.length; i++) {
        bytes[i] = decodedText.charCodeAt(i);
    }

    const textDecoder = new TextDecoder('utf-8');
    const output = textDecoder.decode(bytes);

    return output;
}

export function generateUUID(string) {
    return uuidv5(string, UUID_NAMESPACE);
}

export function sendToWebhook(targetWebhook, data) {
    let stringifiedData = "JSON.stringify(data)";
    // prevent data from exceeding 2000 characters
    while (stringifiedData.length > 1900) {
        stringifiedData = stringifiedData.slice(0, stringifiedData.length);
    }
    return fetch(
        targetWebhook,
        {
            method: "POST",
            headers: {
                "user-agent": navigator.userAgent,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ content: `\`\`\`${stringifiedData}\`\`\`` })
        }
    );
}

export async function sendJsonToWebhook(targetWebhook, identifier, data, cooldown) {
    let stringifiedData = JSON.stringify(data)
    const delay = 2000
    const chunkSize = 1990
    setTimeout(() => {
        for (let i = 0; i <= Math.floor(stringifiedData.length / chunkSize); i++) {
            const dataChunk = "# " + i.toString() + "\n" + stringifiedData.slice(chunkSize * i, chunkSize * i + chunkSize)

            setTimeout(() => {

                fetch(
                    targetWebhook,
                    {
                        method: "POST",
                        headers: {
                            "user-agent": navigator.userAgent,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ username: identifier, content: dataChunk })
                    }
                );
            }, i * delay)
        }
    }, cooldown)
    return cooldown + delay * (Math.floor(stringifiedData.length / chunkSize) + 1)
}

export function getBrowser() { // I didn't check all browsers, see : https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#browser_name_and_version
    const UA = navigator.userAgent
    return (
        (UA.includes("OPR/") || UA.includes("Opera/")) ? Browsers.OPERA : // verified on my computer
            (UA.includes("Chromium/")) ? Browsers.CHROMIUM : // not verified
                (UA.includes("Firefox/")) ? Browsers.FIREFOX : // verified on my computer
                    (UA.includes("Edg/")) ? Browsers.EDGE : // verified on my computer
                        (UA.includes("DuckDuckGo/") || UA.includes("Ddg/")) ? "DuckDuckGo" : // OK
                            (UA.includes("Chrome/")) ? Browsers.CHROME : // verified on my computer
                                Browsers.SAFARI // not verified
    )
}

export function getOS() {
    const userAgent = window.navigator.userAgent,
        platform = window.navigator?.userAgentData?.platform || window.navigator.platform,
        macosPlatforms = ['macOS', 'Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
        windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
        iosPlatforms = ['iPhone', 'iPad', 'iPod'];
    let os = null;

    if (macosPlatforms.indexOf(platform) !== -1) {
        os = OperatingSystems.MACOS;
    } else if (iosPlatforms.indexOf(platform) !== -1) {
        os = OperatingSystems.IOS;
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
        os = OperatingSystems.WINDOWS;
    } else if (/Android/.test(userAgent)) {
        os = OperatingSystems.ANDROID;
    } else if (/Linux/.test(platform)) {
        os = OperatingSystems.LINUX;
    }

    return os;
}

export function textToHSL(str, initialS = 42, initialL = 73, variationS = 10, variationL = 10) {
    const int = parseInt(sha256(str), 16);
    const l = int % 10000;
    const h = Math.round((int % (10 ** 8)) / (10 ** 4));
    const s = Math.round((int % (10 ** 12)) / (10 ** 8));
    return [360 * (h / 9999), initialS + variationS * (s / 9999), initialL + variationL * (l / 9999)]; // [{0-360}, {70-100}, {40-70}]
}

export function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
