export interface IMessage {
  role: string;
  content: string;
  created_at?: Date;
}

export interface IChat {
  _id: string;
  userId: string;
  threadId: string;
  threadStatus: string;
  messages: IMessage[];
  createdAt?: Date;
  updatedAt?: Date;
  state: string;
}
