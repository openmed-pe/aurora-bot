export interface IUser {
  _id: string;
  phone: number;
  phoneName: string;
  typeDoc: string;
  doc: string;
  chats: string[];
  orders: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
