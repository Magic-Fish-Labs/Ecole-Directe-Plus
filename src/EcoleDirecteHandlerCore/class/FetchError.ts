
export default class FetchError extends Error {
	constructor(message?: string, options?: ErrorOptions) {
		super(message, options);
		this.name = "FetchError";
	}
}
