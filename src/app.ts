import express from "express";
import { Request, Response } from "express";
import { route as routeZucaritas } from "./zucaritas/zucaritas.route";
import { route as routeChats } from "./chats/chats.route";

const app = express();
const cors = require("cors");
// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
//app.use(express.urlencoded({ extended: true }));

app.use("/zucaritas", routeZucaritas);
app.use("/chats", routeChats);

// Rutas
app.get("/health", (req: Request, res: Response) => res.send("Todo esta OK"));
// Errores
//app.use(ErrorHandler.pathNotFound);
//app.use(ErrorHandler.generic);

export default app;
