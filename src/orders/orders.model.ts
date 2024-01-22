import { Schema, model } from "mongoose";
import { IOrder } from "./orders.interface";

const OrderSchema = new Schema<IOrder>({
  userId: { type: String, required: true, trim: true },
  chatId: { type: String, required: true, trim: true },
  total: { type: Number },
  numOrder: { type: Number },
  products: { type: [], required: true, trim: true },
  createdAt: { type: Date, trim: true },
  updatedAt: { type: String, trim: true },
  state: { type: String, required: true, trim: true },
});

const OrderModel = model<IOrder>("orders", OrderSchema);

export default OrderModel;
