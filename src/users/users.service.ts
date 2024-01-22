import { IUser } from "./users.interface";
import UserModel from "./users.model";

export class UserService {
  async list(): Promise<IUser[]> {
    const users = await UserModel.find();
    return users;
  }

  async getByNumber(phone: number): Promise<IUser | null> {
    const user = await UserModel.findOne({ phone });
    return user;
  }
  async getById(id: string): Promise<IUser | null> {
    const user = await UserModel.findOne({ _id: id });
    return user;
  }

  async insert(data: Partial<IUser>) {
    data.createdAt = new Date();
    const user = await UserModel.create(data);
    return user;
  }

  async update(id: string, data: Partial<IUser>) {
    const user = await UserModel.findOneAndUpdate({ _id: id }, { ...data });
    return user;
  }

  async updateInfo(id: string, typeDoc: string, doc: string) {
    const chat = await UserModel.findOneAndUpdate(
      { _id: id },
      { $set: { typeDoc: typeDoc, doc: doc } }
    );

    return chat;
  }

  async pushChat(id: string, chat: string) {
    const user = await UserModel.updateOne(
      { _id: id },
      { $push: { chats: chat } }
    );
    return user;
  }

  async pushOrder(id: string, order: string) {
    const user = await UserModel.updateOne(
      { _id: id },
      { $push: { orders: order } }
    );
    return user;
  }

  async delete(id: string) {
    const user = await UserModel.deleteOne({ _id: id });
    return user;
  }
}
