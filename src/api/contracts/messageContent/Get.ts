import MessageContentRoute from "./Route";

// Query params

export interface MessageContentGetQuery { mode: "destinataire" };

// Body

export interface MessageContentGetBody { anneeMessages: string };

// Response data

export interface MessageContentGetData {
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
	to: Array<MessageContentGetTo>
	files: any[]
	from: MessageContentGetFrom
};

export interface MessageContentGetTo {
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

export interface MessageContentGetFrom {
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

// Entry exports

export type MessageContentGetQueryEntry = {
	[R in MessageContentRoute]: MessageContentGetQuery
};

export type MessageContentGetBodyEntry = {
	[R in MessageContentRoute]: MessageContentGetBody
};

export type MessageContentGetDataEntry = {
	[R in MessageContentRoute]: MessageContentGetData
};
