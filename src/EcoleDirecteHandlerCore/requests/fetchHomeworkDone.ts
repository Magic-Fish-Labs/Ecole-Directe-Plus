import { apiVersion } from "../../api/apiConfigs";
import EdError from "../class/EdError";
import FetchError from "../class/FetchError";
import { FetchErrorBuilders } from "../constants/codes";

export default async function fetchHomeworksDone({ tasksDone = [], tasksNotDone = [] }, userId: number, token: string, controller: AbortController | null = null) {
	const headers = new Headers();
	headers.append("x-token", token);
	headers.append("content-type", "application/x-www-form-urlencoded");

	const body = new URLSearchParams();
	body.append("data", JSON.stringify({ idDevoirsEffectues: tasksDone, idDevoirsNonEffectues: tasksNotDone }));

	const options = {
		method: "POST",
		headers,
		body,
		signal: controller?.signal
	};

	return fetch(`https://api.ecoledirecte.com/v3/Eleves/${userId}/cahierdetexte.awp?verbe=put&v=${apiVersion}`, options)
		.catch((error) => {
			error.type = "FETCH_ERROR";
			throw error;
		})
		.then((response) => {
			if (response.ok) return response.json();

			
			throw FetchError;
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
		});
}
