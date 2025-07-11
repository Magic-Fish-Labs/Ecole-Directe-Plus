import { apiVersion } from "../constants/config";
import EdpError from "../class/EdpError";

export default async function fetchHomeworksDone({ tasksDone = [], tasksNotDone = [] }, userId, token, controller) {
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
		.then((response) => response.json())
		.then((response) => {
			if (!response) {
				throw new EdpError(FetchErrorBuilders.EMPTY_RESPONSE);
			}
			if (response.code < 300) {
				return response;
			}
			switch (response.code) {
				case 520:
					throw new EdpError(FetchErrorBuilders.INVALID_TOKEN);
				case 525:
					throw new EdpError(FetchErrorBuilders.EXPIRED_TOKEN);
				default: // UNHANDLED ERROR
					throw new EdpError({
						name: "UnhandledError",
						code: response.code,
						message: response.message,
					});
			}
		});
}
