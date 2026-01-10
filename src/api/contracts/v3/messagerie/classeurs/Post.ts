import z from "zod";
import { ParamToNumber } from "../../../../routeParamsUtils";
import { route } from "./Route";

// Route

export { route };
export type Route = ParamToNumber<typeof route>;

// Body

export interface Body { libelle: string }

// Response data

export const dataSchema = z.any();

export type Data = z.infer<typeof dataSchema>;
