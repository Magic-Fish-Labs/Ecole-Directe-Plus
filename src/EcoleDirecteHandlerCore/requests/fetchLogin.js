import { apiVersion } from "../constants/config";
import { FetchErrorBuilders } from "../constants/codes";
import EdpError from "../class/EdpError";

async function setupGtkToken() {
    return new Promise((resolve, reject) => {
        const handleMessage = (event) => {
            if (event.data && event.data.type === "EDPU_MESSAGE") {
                const message = event.data.payload;
                if (message.action === "gtkRulesUpdated") {
                    window.removeEventListener("message", handleMessage);
                    resolve();
                } else if (message.action === "noGtkCookie") {
                    window.removeEventListener("message", handleMessage);
                    reject(new EdpError(FetchErrorBuilders.login.EXT_NO_GTK_COOKIE));
                } else if (message.action === "noCookie") {
                    window.removeEventListener("message", handleMessage);
                    reject(new EdpError(FetchErrorBuilders.login.EXT_NO_COOKIE));
                }
            }
        }

        window.addEventListener("message", handleMessage);
        fetch(`https://api.ecoledirecte.com/v3/login.awp?gtk=1&v=${apiVersion}`)
            .then(() => {
                setTimeout(() => {
                    window.removeEventListener("message", handleMessage);
                    reject(new EdpError(FetchErrorBuilders.login.NO_EXT_RESPONSE));
                }, 3000);
            })
            .catch((error) => {
                window.removeEventListener("message", handleMessage);
                reject(error);
            });
    });
}

export default async function fetchLogin(username, password, A2FKey, controller = null) {
    await setupGtkToken();

    const headers = new Headers();
    headers.append("content-type", "application/x-www-form-urlencoded");

    const body = new URLSearchParams();
    body.append("data", JSON.stringify({
        identifiant: username,
        motdepasse: password,
        isReLogin: false,
        uuid: "",
        fa: A2FKey ? [A2FKey] : [],
    }));

    const options = {
        headers,
        body,
        method: "POST",
        signal: controller?.signal,
        referrerPolicy: "no-referrer",
    };

    return fetch(`https://api.ecoledirecte.com/v3/login.awp?v=${apiVersion}`, options)
        .catch((error) => {
            error.type = "FETCH_ERROR"
            throw error;
        })
        .then(async (response) => {
			if (response.ok) return [response.headers, await response.json()];

			const error = new Error();
			error.type = "FETCH_ERROR"
			throw error;
		})
        .then(([headers, data]) => {
            if (!data) {
                throw new EdpError(FetchErrorBuilders.EMPTY_RESPONSE);
            }
            if (data.code < 300) {
                return {
                    token: headers.get("x-token"),
                    doubleAuthToken: headers.get("2fa-token"),
                    data: data.data, // !:! I hate my life
                    code: data.code
                };
            }
            switch (data.code) {
                case 505:
                    throw new EdpError(FetchErrorBuilders.login.INVALID_CREDENTIALS);
                case 74000:
                    throw new EdpError(FetchErrorBuilders.login.SERVER_ERROR);
                default: // UNHANDLED ERROR
                    // !:! report l'erreur
                    throw new EdpError({
                        name: "UnhandledError",
                        code: data.code,
                        message: data.message,
                    });
            }
        })
}
