import { z } from "zod";
import { ParamToNumber } from "../../../../routeParamsUtils";
import { route } from "./Route";

// Route

export { route };
export type Route = ParamToNumber<typeof route>;

// Query params

export type Query = {
	typeRecuperation: FolderType,
	idClasseur: number,
	force: boolean,
	orderBy: "date", // !:! try to search for interesting queryParams that could be used
	order: "desc",
	onlyRead: "",
	getAll: 1
};

export type FolderType = "received" | "sent" | "draft" | "archived" | "classeur";

// Body

export interface Body { anneeMessages: string }

// Response data

export const messageSchema = z.object({
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
	to: z.array(
		z.object({
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
	),
	files: z.array(z.any()),
	from: z.object({
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
});

export const messagesSchema = z.object({
	received: z.array(messageSchema),
	sent: z.array(messageSchema),
	draft: z.array(messageSchema),
	archived: z.array(messageSchema)
});

export const dataSchema = z.object({
	classeurs: z.array(
		z.object({
			id: z.number(),
			libelle: z.string()
		})
	),
	messages: messagesSchema,
	parametrage: z.object({
		isActif: z.boolean(),
		canParentsLireMessagesEnfants: z.boolean(),
		destAdmin: z.boolean(),
		destEleve: z.boolean(),
		destFamille: z.boolean(),
		destProf: z.boolean(),
		destEspTravail: z.boolean(),
		disabledNotification: z.boolean(),
		notificationEmailEtablissement: z.boolean(),
		choixMailNotification: z.number(),
		autreMailNotification: z.string(),
		mailPro: z.string(),
		mailPerso: z.string(),
		messagerieApiVersion: z.string(),
		blackListProfActive: z.boolean(),
		estEnBlackList: z.boolean(),
		afficherToutesLesClasses: z.boolean()
	}),
	pagination: z.object({
		messagesRecusCount: z.number(),
		messagesEnvoyesCount: z.number(),
		messagesArchivesCount: z.number(),
		messagesRecusNotReadCount: z.number(),
		messagesDraftCount: z.number()
	})
});

export type Data = z.infer<typeof dataSchema>;
