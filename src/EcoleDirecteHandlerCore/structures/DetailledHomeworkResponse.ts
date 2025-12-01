import { Tag } from "./HomeworkTag"

export interface DetailledHomeworkResponse {
	code: number,
	token: string,
	host: string,
	message: string,
	data: DetailledHomeworkData
}

export interface DetailledHomeworkData {
	date: string,
	matieres: Array<DetailledHomeworkDayData>
}

export interface DetailledHomeworkDayData {
	id: number
	entityCode: string
	entityType: string
	aFaire?: AssignementData
	contenuDeSeance: SessionContentData
	interrogation: boolean
	matiere: string
	entityLibelle: string
	codeMatiere: string
	nomProf: string
	nbJourMaxRenduDevoir: number
	blogActif: boolean
}

export interface SessionContentData {
	idDevoir: number
	contenu: string
	documents: any[]
	commentaires: any[]
	elementsProg: any[]
	liensManuel: any[]
}

export interface AssignementData {
	idDevoir: number
	contenu: string
	rendreEnLigne: boolean
	donneLe: string
	effectue: boolean
	ressource: string
	documentsRendusDeposes: boolean
	ressourceDocuments: any[]
	documents: any[]
	commentaires: any[]
	elementsProg: any[]
	liensManuel: any[]
	documentsRendus: any[]
	tags: Array<Tag>
	cdtPersonnalises: any[]
	contenuDeSeance: AssignementSessionContentData
}

export type AssignementSessionContentData = {
	contenu: string
	documents: any[]
	commentaires: any[]
};
