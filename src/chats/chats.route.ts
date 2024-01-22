import express from "express";
import { ChatsController } from "./chats.controller";
import { GptController } from "../gpt/gpt.controller";

const route = express.Router();
const chatsController = new ChatsController();
const gptController = new GptController();

route.get("/", chatsController.list);
route.get("/:number", chatsController.listByNumber);
route.post("/", chatsController.insert);
route.put("/:number", chatsController.update);
route.delete("/:number", chatsController.delete);

route.get("/thread/:id", gptController.retrieveThreads);

export { route };
