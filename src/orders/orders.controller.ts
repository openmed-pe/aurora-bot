import { Request, Response } from "express";
import mongoose from "mongoose";
import { IOrder } from "./orders.interface";

import { OrderService } from "./orders.service";

const orderService = new OrderService();

export class OrdersController {
  async list(req: Request, res: Response) {
    try {
      const orders = await orderService.list();
      res.status(200).json({
        status: 200,
        data: orders,
        message: "ORDERS_LISTED",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json("ERROR_GETTING_ORDERS");
    }
  }

  // async listByNumber(req: Request, res: Response) {
  //   const number = parseInt(req.params.number);
  //   try {
  //     const orders = await orderService.getByNumber(number);
  //     res.status(200).json({
  //       status: 200,
  //       data: orders,
  //       message: "ORDER_LISTED_BYNUMBER",
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     res.status(500).json("ERROR_GETTING_ORDER");
  //   }
  // }

  async insert(req: Request, res: Response) {
    //const body = req.body;
    const data: Partial<IOrder> = {
      chatId: req.body.chatId,
      userId: req.body.userId,
      products: req.body.products,
      createdAt: new Date(),
      state: req.body.state,
    };
    try {
      const order = await orderService.insert(data);
      res.status(200).json({
        status: 200,
        data: order,
        message: "ORDER_INSERTED",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json("ERROR_INSERTING_ORDER");
    }
  }

  // async update(req: Request, res: Response) {
  //   const number = parseInt(req.params.number);
  //   const state = req.body.state;
  //   const products = req.body.products;

  //   try {
  //     const order = await orderService.getByNumber(number);
  //     order.products = [...order.products, ...products];
  //     const updatedOrder = await orderService.update(order._id, order);
  //     res.status(200).json({
  //       status: 200,
  //       data: updatedOrder,
  //       message: "ORDER_UPDATED",
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     res.status(500).json("ERROR_UPDATING_ORDER");
  //   }
  // }

  async delete(req: Request, res: Response) {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ status: 400, message: "INVALID_ORDER_ID" });
      return;
    }
    try {
      const dletedOrder = await orderService.delete(id);
      res.status(200).json({
        status: 200,
        data: dletedOrder,
        message: "ORDER_DELETED",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json("ERROR_DELETING_ORDER");
    }
  }
}
