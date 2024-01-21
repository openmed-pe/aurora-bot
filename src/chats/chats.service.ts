import { IChat, IMessage } from "./chats.interface";
import ChatModel from "./chats.model";

export class ChatService {
  async list(): Promise<IChat[]> {
    const chats = await ChatModel.find();
    return chats;
  }

  async getByNumber(number: number): Promise<IChat | null> {
    const chat = await ChatModel.findOne({ number });
    return chat;
  }
  async getById(id: string): Promise<IChat | null> {
    const chat = await ChatModel.findOne({ _id: id });
    return chat;
  }
  async getByUserId(id: string): Promise<IChat | null> {
    const chat = await ChatModel.findOne({ userId: id });
    return chat;
  }

  async getByUserIdandState(id: string, state: string): Promise<IChat | null> {
    const chat = await ChatModel.find().and([{ userId: id }, { state: state }]);
    //console.log(chat);
    return chat[0];
  }
  async insert(data: Partial<IChat>) {
    data.createdAt = new Date();
    const chat = await ChatModel.create(data);
    return chat;
  }

  async update(id: string, data: Partial<IChat>) {
    const chat = await ChatModel.findOneAndUpdate({ _id: id }, { ...data });

    return chat;
  }

  async updateState(id: string, state: string) {
    const chat = await ChatModel.findOneAndUpdate(
      { _id: id },
      { $set: { state: state } }
    );

    return chat;
  }

  async updateThread(id: string, state: string) {
    const chat = await ChatModel.findOneAndUpdate(
      { _id: id },
      { $set: { threadStatus: state } }
    );

    return chat;
  }

  async pushMessage(id: string, message: Partial<IMessage>) {
    const chat = await ChatModel.updateOne(
      { _id: id },
      { $push: { messages: message } }
    );

    return chat;
  }

  async delete(id: string) {
    const chat = await ChatModel.deleteOne({ _id: id });
    return chat;
  }
}
