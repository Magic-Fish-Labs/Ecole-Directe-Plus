import { z } from "zod";
import { ParamToNumber } from "../../../../routeParamsUtils";
import { route } from "./Route";

// Route

export { route };
export type Route = ParamToNumber<typeof route>;

// Body

export type Body = {
	action: "marquerCommeNonLu" | "archiver" | "desarchiver",
	ids: Array<number>
	anneeMessages: string,
} | {
	action: "deplacer",
	ids: Array<number>,
	idClasseur: number,
} | {
	action: "supprimer",
	ids: Array<number>,
	anneeMessages: string,
	idDossier: -5,
}

// Response data

export const dataSchema = z.void();

export type Data = z.infer<typeof dataSchema>;
