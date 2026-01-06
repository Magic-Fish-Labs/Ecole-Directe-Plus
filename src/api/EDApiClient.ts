import FetchError from "../EcoleDirecteHandlerCore/class/FetchError";
import { apiBase, apiVersion } from "./apiConfigs";
import { ApiMethod, Body, Data, Query, Routes } from "./contracts";

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

	private buildUrl(method: ApiMethod, route: string, query: Record<string, any> = {}) {
		const searchParams = new URLSearchParams();
		for (const queryParam in query) {
			searchParams.append(queryParam, query[queryParam]?.toString() ?? "");
		}
		searchParams.append("verbe", method.toLowerCase());
		searchParams.append("v", apiVersion);
		const url = new URL(route, apiBase);
		url.search = searchParams.toString();
		return url;
	}

	private buildRequestInit(body: any = {}): RequestInit {
		const init: RequestInit = {
			method: "POST",
		};

		init.headers = new Headers();
		init.headers.append("x-token", this.token);
		init.headers.append("2fa-token", this.doubleAuthToken);
		init.headers.append("content-type", "application/x-www-form-urlencoded");

		const abortController = new AbortController();
		this.abortControllers.push(abortController);
		init.signal = abortController.signal;

		init.body = new URLSearchParams();
		init.body.append("data", JSON.stringify(body));

		return init;
	}

	private async handleRequest<M extends ApiMethod, R extends Routes>(url: URL, init: RequestInit): Promise<Data<M, R>> {
		try {
			const res = await fetch(url, init);
			// !:! handle invalide code
			const content = await res.json() as { code: number, token: string, host: string, data: Data<M, R> }
			return content.data;
		} catch (error) {
			if (!(error instanceof Error)) throw error;
			if (error.name === "AbortError") throw error;
			throw new FetchError("Problem occured while fetching to Ed's API", { cause: error });
		}
	}

	async get<R extends Routes<"GET">>(route: R, body: Body<"GET", R>): Promise<Data<"GET", R>>;
	async get<R extends Routes<"GET">>(route: R, body: Body<"GET", R>, query: Query<"GET", R>): Promise<Data<"GET", R>>;
	async get<R extends Routes<"GET">>(route: R, body: Body<"GET", R>, query?: Query<"GET", R>): Promise<Data<"GET", R>> {
		const url = this.buildUrl("GET", route, query);
		const init = this.buildRequestInit(body);

		return this.handleRequest(url, init);
	}

	async post<R extends Routes<"POST">>(route: R, body: Body<"POST", R>): Promise<Data<"POST", R>>;
	async post<R extends Routes<"POST">>(route: R, body: Body<"POST", R>, query: Query<"POST", R>): Promise<Data<"POST", R>>;
	async post<R extends Routes<"POST">>(route: R, body: Body<"POST", R>, query?: Query<"POST", R>): Promise<Data<"POST", R>> {
		const url = this.buildUrl("POST", route, query);
		const init = this.buildRequestInit(body);

		return this.handleRequest(url, init);
	}
}
