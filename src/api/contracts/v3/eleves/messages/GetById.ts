import { z } from "zod"
import { ParamToNumber } from "../../../../routeParamsUtils";
import { routeById } from "./Route";

// Route runtime

export { routeById as route };
export type Route = ParamToNumber<typeof routeById>

// Query params

export interface Query { mode: "destinataire" | "expediteur" };

// Body

export interface Body { anneeMessages: string };

// Schema

const toSchema = z.object({
	nom: z.string(),
	prenom: z.string(),
	particule: z.string(),
	civilite: z.string(),
	role: z.string(),
	id: z.number(),
	read: z.boolean(),
	to_cc_cci: z.string(),
	fonctionPersonnel: z.string()
})

const fromSchema = z.object({
	nom: z.string(),
	prenom: z.string(),
	particule: z.string(),
	civilite: z.string(),
	role: z.string(),
	listeRouge: z.boolean(),
	id: z.number(),
	read: z.boolean(),
	fonctionPersonnel: z.string()
})

const fileSchema = z.any();

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
	files: z.array(fileSchema),
	from: fromSchema
})

// Response data

export type Data = z.infer<typeof dataSchema>;
