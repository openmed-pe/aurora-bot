export interface IMessage {
  role: string;
  content: string;
  created_at?: Date;
}

export interface IChat {
  _id: string;
  number: string;
  name: string;
  messages: IMessage[];
  created_at?: Date;
  updated_at?: string;
  state: string;
}
