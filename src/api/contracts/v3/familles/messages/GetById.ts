import { z } from "zod";
import { ParamToNumber } from "../../../../routeParamsUtils";
import { routeById as route } from "./Route";

// Route

export { route };
export type Route = ParamToNumber<typeof route>;

// Query params

export interface Query { mode: "destinataire" };

// Body

export interface Body { anneeMessages: string };

// Response data

export const toSchema = z.object({
	nom: z.string(),
	prenom: z.string(),
	particule: z.string(),
	civilite: z.string(),
	role: z.string(),
	id: z.number(),
	read: z.boolean(),
	to_cc_cci: z.string(),
	fonctionPersonnel: z.string()
});

export const fromSchema = z.object({
	nom: z.string(),
	prenom: z.string(),
	particule: z.string(),
	civilite: z.string(),
	role: z.string(),
	listeRouge: z.boolean(),
	id: z.number(),
	read: z.boolean(),
	fonctionPersonnel: z.string()
});

export const dataSchema = z.object({
	id: z.number(),
	responseId: z.number(),
	forwardId: z.number(),
	mtype: z.string(),
	read: z.boolean(),
	idDossier: z.number(),
	idClasseur: z.number(),
	transferred: z.boolean(),
	answered: z.boolean(),
	to_cc_cci: z.string(),
	brouillon: z.boolean(),
	canAnswer: z.boolean(),
	subject: z.string(),
	content: z.string(),
	date: z.string(),
	to: z.array(toSchema),
	files: z.array(z.any()),
	from: fromSchema
});

export type Data = z.infer<typeof dataSchema>;
