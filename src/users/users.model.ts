import { Schema, model } from "mongoose";
import { IUser } from "./users.interface";

const UserSchema = new Schema<IUser>({
  phone: { type: Number, required: true, trim: true },
  phoneName: { type: String, required: true, trim: true },
  typeDoc: { type: String, trim: true },
  doc: { type: String, trim: true },
  chats: { type: [], required: true, trim: true },
  orders: { type: [], required: true, trim: true },
  createdAt: { type: Date, trim: true },
  updatedAt: { type: Date, trim: true },
});

const UserModel = model<IUser>("users", UserSchema);

export default UserModel;
