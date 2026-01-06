export type { RouteById as Route } from "./Route";

// Query params

export interface Query { mode: "destinataire" };

// Body

export interface Body { anneeMessages: string };

// Response data

export interface Data {
	id: number
	responseId: number
	forwardId: number
	mtype: string
	read: boolean
	idDossier: number
	idClasseur: number
	transferred: boolean
	answered: boolean
	to_cc_cci: string
	brouillon: boolean
	canAnswer: boolean
	subject: string
	content: string
	date: string
	to: Array<To>
	files: any[]
	from: From
};

export interface To {
	nom: string
	prenom: string
	particule: string
	civilite: string
	role: string
	id: number
	read: boolean
	to_cc_cci: string
	fonctionPersonnel: string
}

export interface From {
	nom: string
	prenom: string
	particule: string
	civilite: string
	role: string
	listeRouge: boolean
	id: number
	read: boolean
	fonctionPersonnel: string
};
