import express from "express";
import { ChatsController } from "./chats.controller";

const route = express.Router();
const chatsController = new ChatsController();

route.get("/", chatsController.list);
route.get("/:number", chatsController.listByNumber);
route.post("/", chatsController.insert);
route.put("/:number", chatsController.update);
route.delete("/:number", chatsController.delete);

export { route };
