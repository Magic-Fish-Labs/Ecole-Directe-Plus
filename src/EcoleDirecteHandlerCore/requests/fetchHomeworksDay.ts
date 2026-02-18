import { apiVersion } from "../../api/apiConfigs";
import { FetchErrorBuilders } from "../constants/codes";
import EdError from "../class/EdError";
import FetchError from "../class/FetchError";
import { DetailledHomeworkResponse } from "../structures/DetailledHomeworkResponse";

export default async function fetchHomeworksDay(date: string, userId: number, token: string, controller: AbortController | null = null) {
    const headers = new Headers();
    headers.append("x-token", token);
    headers.append("content-type", "application/x-www-form-urlencoded");

    const body = new URLSearchParams();
    body.append("data", "{}");

    const options: RequestInit = {
        method: "POST",
        headers,
        body,
        signal: controller?.signal,
        referrerPolicy: "no-referrer",
    };

    return fetch(`https://api.ecoledirecte.com/v3/Eleves/${userId}/cahierdetexte/${date}.awp?verbe=get&v=${apiVersion}`, options)
        .catch((error) => {
            error.type = "FETCH_ERROR"
            throw error;
        })
        .then((response) => {
			if (response.ok) return response.json() as Promise<DetailledHomeworkResponse>;

			const error = new FetchError();
			throw error;
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
