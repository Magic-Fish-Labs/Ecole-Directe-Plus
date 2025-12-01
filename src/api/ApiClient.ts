import FetchError from "../EcoleDirecteHandlerCore/class/FetchError";
import { apiBase, apiVersion } from "./apiConfigs";

export default class EDApiClient {
	private static instance: EDApiClient;
	private token: string = "";
	private doubleAuthToken: string = "";
	private abortControllers: Array<AbortController> = [];

	private constructor() { }

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

	abort(reason?: any) {
		this.abortControllers.forEach((abortController) => abortController.abort(reason));
	}

	private buildUrl(path: string) {
		const url = new URL(path, apiBase);
		url.searchParams.append("v", apiVersion);
		return url;
	}

	private buildRequestInit(method: "GET" | "HEAD"): RequestInit
	private buildRequestInit(method: "POST" | "PUT" | "PATCH" | "DELETE", body: any): RequestInit
	private buildRequestInit(method: string, body?: any): RequestInit {
		const init: RequestInit = {
			method,
		};

		init.headers = new Headers();
		init.headers.append("x-token", this.token);
		init.headers.append("2fa-token", this.doubleAuthToken);

		const abortController = new AbortController();
		this.abortControllers.push(abortController);
		init.signal = abortController.signal;

		if (body === undefined) {
			init.headers.append("content-type", "application/x-www-form-urlencoded");
			init.body = new URLSearchParams();
			init.body.append("data", JSON.stringify(body));
		}
		return init;
	}

	async post(path: string, body: any): Promise<any> {
		const url = this.buildUrl(path);
		const init = this.buildRequestInit("POST", body);

		try {
			const res = await fetch(url, init);
			return res.json();
		} catch (error) {
			if (!(error instanceof Error)) throw error;
			if (error.name === "AbortError") throw error;
			throw new FetchError("Problem occured while fetching to Ed's API", { cause: error });
		}
	}
}
