export default async function fetchFile(fileId, fileType, token, specialParams) {
	const specialUrlParams = new URLSearchParams(specialParams);

	const headers = new Headers();
	headers.append("x-token", token);
	headers.append("content-type", "application/x-www-form-urlencoded");

	const body = new URLSearchParams();
	body.append("data", JSON.stringify({ forceDownload: 0 }));

	const options = {
		method: "POST",
		headers,
		body,
		referrerPolicy: "no-referrer"
	}

	return await fetch(`https://api.ecoledirecte.com/v3/telechargement.awp?verbe=get&fichierId=${fileId}&leTypeDeFichier=${fileType}${specialUrlParams.toString()}`, options)
		.catch((error) => {
			error.type = "FETCH_ERROR";
			throw error;
		})
		.then((response) => {
			if (response.ok) return response.blob();

			const error = new Error();
			error.type = "FETCH_ERROR"
			throw error;
		});
}
  
export default async function fetchGrades(schoolYear, userId, token, controller = undefined) {
	const headers = new Headers();
	headers.append("x-token", token);

	const body = new URLSearchParams();
	body.append("data", JSON.stringify({ anneeScolaire: schoolYear }));

	const options = {
		method: "POST",
		headers,
		body,
		signal: controller?.signal,
		referrerPolicy: "no-referrer",
	};

	return fetch(`https://api.ecoledirecte.com/v3/eleves/${userId}/notes.awp?verbe=get&v=${apiVersion}`, options)
		.catch((error) => {
			error.type = "FETCH_ERROR"
			throw error;
		})
		.then((response) => {
			if (response.ok) return response.json();

			const error = new Error();
			error.type = "FETCH_ERROR"
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
