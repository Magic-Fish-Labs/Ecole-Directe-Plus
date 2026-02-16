import { z } from "zod";
import { ParamToNumber } from "../../../../routeParamsUtils";
import { routeById as route } from "./Route";

// Route

export { route };
export type Route = ParamToNumber<typeof route>;

// Body

export interface Body {}

// Response data

export const dataSchema = z.void();

export type Data = z.infer<typeof dataSchema>;
