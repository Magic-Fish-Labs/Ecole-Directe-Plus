import { apiVersion } from "../../api/apiConfigs";
import { FetchErrorBuilders } from "../constants/codes";
import EdError from "../class/EdError";
import FetchError from "../class/FetchError";

export default async function fetchTimeline(schoolYear: string, token: string, userId: number, controller: AbortController | null = null) {
    const headers = new Headers();
    headers.append("x-token", token);
    headers.append("content-type", "application/x-www-form-urlencoded");

    const body = new URLSearchParams();
    body.append("anneeScolaire", schoolYear);

    const options: RequestInit = {
        method: "POST",
        headers,
        body,
        signal: controller?.signal,
        referrerPolicy: "no-referrer",
    };

    return fetch(`https://api.ecoledirecte.com/v3/eleves/${userId}/timeline.awp?verbe=get&v=${apiVersion}`, options)
        .catch((error) => {
            throw new FetchError("Problem occured while fetching to Ed's API", { cause: error });
        })
        .then((response) => {
			if (response.ok) return response.json();

			throw new FetchError();
		})
        .then((data) => {
            if (!data) {
                throw new EdError(FetchErrorBuilders.EMPTY_RESPONSE);
            }
            if (data.code < 300) {
                return JSON.parse(data);
            }
            switch (data.code) {
                case 520:
                    throw new EdError(FetchErrorBuilders.INVALID_TOKEN);
                case 525:
                    throw new EdError(FetchErrorBuilders.EXPIRED_TOKEN);
                default: // UNHANDLED ERROR
                    throw new EdError({
                        name: "UnhandledError",
                        code: data.code,
                        message: data.message,
                    });
            }
        })
}

// function fetchT2imeline(schoolYear, token, userId, controller = undefined) {
//     const headers = new Headers();
//     headers.append("x-token", token);

//     const body = new URLSearchParams();
//     body.append("anneeScolaire", "schoolYear");

//     const options = {
//         method: "POST",
//         headers,
//         body,
//         signal: controller?.signal,
//         referrerPolicy: "no-referrer",
//     };

//     return fetch(`https://api.ecoledirecte.com/v3/eleves/${userId}/timeline.awp?verbe=get&v=${apiVersion}`, options)
//         .catch((error) => {
//             error.type = "FETCH_ERROR"
//             throw error;
//         })
//         .then((response) => response.json())
//         .then((response) => {
//             if (!response) {
//                 throw new EdError(FetchErrorBuilders.EMPTY_RESPONSE);
//             }
//             if (response.code < 300) {
//                 return response;
//             }
//             switch (response.code) {
//                 case 520:
//                     throw new EdError(FetchErrorBuilders.INVALID_TOKEN);
//                 case 525:
//                     throw new EdError(FetchErrorBuilders.EXPIRED_TOKEN);
//                 default: // UNHANDLED ERROR
//                     throw new EdError({
//                         name: "UnhandledError",
//                         code: response.code,
//                         message: response.message,
//                     });
//             }
//         })
// }