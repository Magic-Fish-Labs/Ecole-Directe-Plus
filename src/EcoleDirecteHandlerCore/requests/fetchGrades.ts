import { apiVersion } from "../constants/config";
import { FetchErrorBuilders } from "../constants/codes";
import EdError from "../class/EdError";
import FetchError from "../class/FetchError";

export default async function fetchGrades(schoolYear: string, userId: number, token: string, controller: AbortController | null = null) {
    const headers = new Headers();
    headers.append("x-token", token);
    headers.append("content-type", "application/x-www-form-urlencoded");

    const body = new URLSearchParams();
    body.append("data", JSON.stringify({anneeScolaire: schoolYear}));

    const options: RequestInit = {
        method: "POST",
        headers,
        body,
        signal: controller?.signal,
        referrerPolicy: "no-referrer",
    };

    return fetch(`https://api.ecoledirecte.com/v3/eleves/${userId}/notes.awp?verbe=get&v=${apiVersion}`, options)
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
                return data;
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