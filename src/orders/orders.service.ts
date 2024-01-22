import { IOrder, IProduct } from "./orders.interface";
import OrderModel from "./orders.model";

export class OrderService {
  async list(): Promise<IOrder[]> {
    const orders = await OrderModel.find();
    return orders;
  }

  async getByChatId(id: string): Promise<IOrder | null> {
    const order = await OrderModel.findOne({ chatId: id });
    return order;
  }

  async getByChatIdandState(id: string, state: string): Promise<IOrder | null> {
    const order = await OrderModel.find().and([
      { chatId: id },
      { state: state },
    ]);
    //console.log(chat);
    return order[0];
  }

  async getById(id: string): Promise<IOrder | null> {
    const order = await OrderModel.findOne({ _id: id });
    return order;
  }

  async insert(data: Partial<IOrder>) {
    const order = await OrderModel.create(data);
    return order;
  }

  async update(id: string, data: Partial<IOrder>) {
    const order = await OrderModel.findOneAndUpdate({ _id: id }, { ...data });

    return order;
  }

  async updateState(id: string, state: string, numOrder: number) {
    const order = await OrderModel.findOneAndUpdate(
      { _id: id },
      { $set: { state: state, numOrder: numOrder } }
    );

    return order;
  }

  async pushProduct(id: string, product: Partial<IProduct>) {
    const order = await OrderModel.updateOne(
      { _id: id },
      { $push: { products: product } }
    );

    return order;
  }

  async delete(id: string) {
    const order = await OrderModel.deleteOne({ _id: id });
    return order;
  }
}
