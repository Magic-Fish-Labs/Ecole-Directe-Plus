import z from "zod";
import * as StudentMessagesGet from "./v3/eleves/messages/Get";
import * as StudentMessagesGetById from "./v3/eleves/messages/GetById";
import * as FamilyMessagesGet from "./v3/familles/messages/Get";
import * as FamilyMessagesGetById from "./v3/familles/messages/GetById";
import * as MessagingFolderPost from "./v3/messagerie/classeurs/Post";

export type Api = {
	GET: {
		route: StudentMessagesGet.Route,
		query: StudentMessagesGet.Query,
		body: StudentMessagesGet.Body,
		data: StudentMessagesGet.Data,
	} | {
		route: StudentMessagesGetById.Route,
		query: StudentMessagesGetById.Query,
		body: StudentMessagesGetById.Body,
		data: StudentMessagesGetById.Data,
	} | {
		route: FamilyMessagesGet.Route,
		query: FamilyMessagesGet.Query,
		body: FamilyMessagesGet.Body,
		data: FamilyMessagesGet.Data,
	} | {
		route: FamilyMessagesGetById.Route,
		query: FamilyMessagesGetById.Query,
		body: FamilyMessagesGetById.Body,
		data: FamilyMessagesGetById.Data,
	},
	POST: {
		route: MessagingFolderPost.Route,
		query: never,
		body: MessagingFolderPost.Body,
		data: MessagingFolderPost.Data,
	},
};

export type ApiMethod = keyof Api;
export type Routes<M extends ApiMethod = ApiMethod> = Api[M]["route"];

export type Query<M extends ApiMethod, R extends Routes<M>> =
	Extract<Api[M], { route: R }>["query"];

export type Body<M extends ApiMethod, R extends Routes<M>> =
	Extract<Api[M], { route: R }>["body"];

export type Data<M extends ApiMethod = ApiMethod, R extends Routes<M> = Routes<M>> =
	Extract<Api[M], { route: R }>["data"];

export type QueryRoutes<M extends ApiMethod = ApiMethod> = {
	[R in Routes<M>]: Query<M, R> extends never ? never : R
}[Routes<M>];

export type NoQueryRoutes<M extends ApiMethod = ApiMethod> = {
	[R in Routes<M>]: Query<M, R> extends never ? R : never
}[Routes<M>];

export const schemaMap = {
	GET: {
		[StudentMessagesGet.route]: StudentMessagesGet.dataSchema,
		[StudentMessagesGetById.route]: StudentMessagesGetById.dataSchema,
		[FamilyMessagesGet.route]: FamilyMessagesGet.dataSchema,
		[FamilyMessagesGetById.route]: FamilyMessagesGetById.dataSchema,
	} as const,
	POST: {
		[MessagingFolderPost.route]: MessagingFolderPost.dataSchema,
	} as const
} as const;
