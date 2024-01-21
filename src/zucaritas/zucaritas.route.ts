import express from "express";
import { ZucaritasController } from "./zucaritas.controller";
import { AssistantController } from "../assistant/assistant.controller";

const route = express.Router();
const zucaritasController = new ZucaritasController();
const assitantController = new AssistantController();
route.get("/webhook", zucaritasController.validate);
route.post("/webhook", zucaritasController.events);
route.post("/assistant/threat", assitantController.generateThreads);

export { route };
