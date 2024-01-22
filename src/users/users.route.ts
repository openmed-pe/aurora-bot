import express from "express";
import { OrdersController } from "./users.controller";

const route = express.Router();
const orderController = new OrdersController();

route.get("/", orderController.list);
route.get("/:number", orderController.listByNumber);
route.post("/", orderController.insert);
route.put("/:number", orderController.update);
route.delete("/:number", orderController.delete);

export { route };
