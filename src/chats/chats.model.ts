import { Schema, model } from "mongoose";
import { IChat, IMessage } from "./chats.interface";

const ChatSchema = new Schema<IChat>({
  userId: { type: String, required: true, trim: true },
  threadId: { type: String, required: true, trim: true },
  threadStatus: { type: String, required: true, trim: true },
  messages: { type: [], required: true, trim: true },
  createdAt: { type: Date, trim: true },
  updatedAt: { type: Date, trim: true },
  state: { type: String, required: true, trim: true },
});

const ChatModel = model<IChat>("chats", ChatSchema);

export default ChatModel;
