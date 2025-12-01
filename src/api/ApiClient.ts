import FetchError from "../EcoleDirecteHandlerCore/class/FetchError";
import { apiBase, apiVersion } from "./apiConfigs";

export default class EDApiClient {
	private static instance: EDApiClient;
	private token: string = "";
	private doubleAuthToken: string = "";
	private abortControllers: Array<AbortController> = [];

	private constructor() {}

	static getInstance(): EDApiClient {
		if (!EDApiClient.instance) {
			EDApiClient.instance = new EDApiClient();
		}
		return EDApiClient.instance;
	}

	setToken(t: string): void {
		this.token = t;
	}

	setDoubleAuthToken(t: string): void {
		this.doubleAuthToken = t;
	}

	private buildUrl(path: string) {
		const url = new URL(path, apiBase);
		url.searchParams.append("v", apiVersion);
		return url;
	}

	async post(path: string, body: any): Promise<any> {
		const usedUrl = this.buildUrl(path);

		const usedHeaders = new Headers();
		usedHeaders.append("x-token", this.token);
		usedHeaders.append("2fa-token", this.doubleAuthToken);
		usedHeaders.append("content-type", "application/x-www-form-urlencoded");

		const requestBody = new URLSearchParams();
		requestBody.append("data", JSON.stringify(body));

		try {
			const res = await fetch(usedUrl, {
				method: "POST",
				headers: usedHeaders,
				body: requestBody
			});
			return res.json();
		} catch (error) {
			throw new FetchError("Problem occured while fetching to Ed's API", { cause: error });
		}
	}
}
