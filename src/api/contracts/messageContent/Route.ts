export type StudentMessageContentRoute = `/v3/eleves/${number}/messages/${number}.awp`;
export type ParentMessageContentRoute = `/v3/familles/${number}/messages/${number}.awp`;

type MessageContentRoute = StudentMessageContentRoute | ParentMessageContentRoute; 
export default MessageContentRoute;
