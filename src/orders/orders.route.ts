import express from "express";
import { OrdersController } from "./orders.controller";

const route = express.Router();
const orderController = new OrdersController();

route.get("/", orderController.list);
route.post("/", orderController.insert);
route.delete("/:number", orderController.delete);

export { route };
