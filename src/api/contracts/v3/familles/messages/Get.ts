export type { Route } from "./Route";

// Query params

export type Query = {
	typeRecuperation: MessagesFolderType,
	idClasseur: number,
	force: boolean,
	orderBy: "date", // !:! try to search for interesting queryParams that could be used
	order: "desc",
	onlyRead: "",
	getAll: 1
};

export type MessagesFolderType = "received" | "sent" | "draft" | "archived" | "classeur";

// Body

export interface Body { anneeMessages: string }

// Response data

export interface Data {
	classeurs: Array<{
		id: number
		libelle: string
	}>
	messages: Messages
	parametrage: {
		isActif: boolean
		canParentsLireMessagesEnfants: boolean
		destAdmin: boolean
		destEleve: boolean
		destFamille: boolean
		destProf: boolean
		destEspTravail: boolean
		disabledNotification: boolean
		notificationEmailEtablissement: boolean
		choixMailNotification: number
		autreMailNotification: string
		mailPro: string
		mailPerso: string
		messagerieApiVersion: string
		blackListProfActive: boolean
		estEnBlackList: boolean
		afficherToutesLesClasses: boolean
	}
	pagination: {
		messagesRecusCount: number
		messagesEnvoyesCount: number
		messagesArchivesCount: number
		messagesRecusNotReadCount: number
		messagesDraftCount: number
	}
}

export interface Messages {
	received: Array<Message>
	sent: Array<Message>
	draft: Array<Message>
	archived: Array<Message>
}

export interface Message {
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
	to: Array<{
		nom: string
		prenom: string
		particule: string
		civilite: string
		role: string
		id: number
		read: boolean
		to_cc_cci: string
		fonctionPersonnel: string
	}>
	files: any[]
	from: {
		nom: string
		prenom: string
		particule: string
		civilite: string
		role: string
		listeRouge: boolean
		id: number
		read: boolean
		fonctionPersonnel: string
	}
}
