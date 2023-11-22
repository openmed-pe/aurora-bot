import { Schema, model } from "mongoose";
import { IChat, IMessage } from "./chats.interface";

const ChatSchema = new Schema<IChat>({
  number: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  messages: { type: [], required: true, trim: true },
  created_at: { type: Date, trim: true },
  updated_at: { type: String, trim: true },
  state: { type: String, required: true, trim: true },
});

const ChatModel = model<IChat>("chats", ChatSchema);

export default ChatModel;
