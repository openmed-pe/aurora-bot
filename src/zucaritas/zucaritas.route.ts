import express from "express";
import { ZucaritasController } from "./zucaritas.controller";

const route = express.Router();
const zucaritasController = new ZucaritasController();

route.get("/webhook", zucaritasController.validate);
route.post("/webhook", zucaritasController.events);

export { route };
