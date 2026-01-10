export type ParamToNumber<S extends string> =
	S extends `${infer A}:${string}/${infer B}`
	? `${A}${number}/${ParamToNumber<B>}`
	: S extends `${infer A}:${string}`
	? `${A}${number}`
	: S

function routeToRegex(route: string): RegExp {
	return new RegExp(
		"^" + route.replace(/:[^/]+/g, "[^/]+") + "$"
	)
}

export function matchRoute<K extends string>(path: string, routes: Record<K, any>): K | null {
	for (const route in routes) {
		if (routeToRegex(route).test(path)) {
			return route;
		}
	}
	return null;
}
