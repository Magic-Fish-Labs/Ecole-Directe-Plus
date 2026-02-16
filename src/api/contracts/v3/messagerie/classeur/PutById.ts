import { z } from "zod";
import { ParamToNumber } from "../../../../routeParamsUtils";
import { routeById as route } from "./Route";

// Route

export { route };
export type Route = ParamToNumber<typeof route>;

// Body

export interface Body { libelle: string }

// Response data

export const dataSchema = z.object({
	id: z.number(),
	libelle: z.string()
});

export type Data = z.infer<typeof dataSchema>;
