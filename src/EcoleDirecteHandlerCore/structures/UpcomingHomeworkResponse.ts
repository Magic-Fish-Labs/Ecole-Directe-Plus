import { Tag } from "./HomeworkTag";

export interface UpcomingHomeworkResponse {
	code: number,
	token: string,
	host?: string,
	message?: string,
	data: UpcomingHomeworkData
}

export type UpcomingHomeworkData = Record<string, UpcomingHomeworkDayData>;

export interface UpcomingHomeworkDayData {
	matiere: string
	codeMatiere: string
	aFaire: boolean
	idDevoir: number
	documentsAFaire: boolean
	donneLe: string
	effectue: boolean
	interrogation: boolean
	rendreEnLigne: boolean
	tags: Tag[]
}
