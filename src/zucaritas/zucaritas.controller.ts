import { Request, Response } from "express";
import yenv from "yenv";
import { ZucaritasModel } from "./zucaritas.model";
import { GptController } from "../gpt/gpt.controller";
import { ChatsController } from "../chats/chats.controller";
import { ChatService } from "../chats/chats.service";
import { IChat } from "../chats/chats.interface";
import { ZucaritasService } from "./zucaritas.service";

const env = yenv();
const gptController = new GptController();
const chatsService = new ChatService();
const zucaritasService = new ZucaritasService();

export class ZucaritasController {
  async events(req: Request, res: Response) {
    //console.log(JSON.stringify(req.body, null, 2));
    // const zucaritas: ZucaritasModel = {
    //   name: req.body.entry[0].changes[0].value.contacts[0].profile.name,
    //   number: req.body.entry[0].changes[0].value.contacts[0].wa_id,
    //   message: req.body.entry[0].changes[0].value.messages[0].text.body,
    //   timestamp: req.body.entry[0].changes[0].value.messages[0].timestamp,
    // };
    if (req.body.object) {
      if (req.body.entry[0].changes[0].value.messages) {
        console.log(
          "MESSAGE EVENT",
          JSON.stringify(req.body.entry[0].changes[0].value.messages, null, 2)
        );

        const currentMessage = {
          role: "user",
          content: req.body.entry[0].changes[0].value.messages[0].text.body,
        };
        const data: Partial<IChat> = {
          number: req.body.entry[0].changes[0].value.contacts[0].wa_id,
          name: req.body.entry[0].changes[0].value.contacts[0].profile.name,
          state: "IN PROGRESS",
        };
        res.sendStatus(200);
        var chat = await chatsService.getByNumber(
          parseInt(req.body.entry[0].changes[0].value.contacts[0].wa_id)
        );
        if (chat != null) {
          await chatsService.pushMessage(chat._id, currentMessage);
          chat.messages.push(currentMessage);
        } else {
          data.messages = [currentMessage];
          chat = await chatsService.insert(data);
        }

        // Generate the response
        const response = await gptController.generateResponse(chat.messages);
        if (response) {
          await chatsService.pushMessage(chat._id, response);
        }
        //const response = "Hi, I got your message";
        console.log("GPT RESPONSE", response);
        // Save the response
        //await chatsService.pushMessage(chat._id, response);
        // Send response to wsp
        const resFinal = await zucaritasService.sendMessage(
          response.content,
          req.body.entry[0].changes[0].value.metadata.phone_number_id,
          req.body.entry[0].changes[0].value.messages[0].from
        );
        // if (resFinal) {
        //   res.sendStatus(200);
        // }
      } else if (req.body.entry[0].changes[0].value.statuses) {
        console.log(
          "STATUS MESSAGE EVENT",
          JSON.stringify(req.body.entry[0].changes[0].value.statuses, null, 2)
        );
        res.sendStatus(200);
      } else {
        console.log("UNRECOGNICED EVENT", JSON.stringify(req.body, null, 2));
        res.sendStatus(501);
      }
    } else {
      res.sendStatus(404);
    }

    //console.log(resFinal);
  }

  validate(req: Request, res: Response) {
    const verify_token = env.WSSP.VERIFY_TOKEN;

    // Parse params from the webhook verification request
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    // Check if a token and mode were sent
    if (mode && token) {
      // Check the mode and token sent are correct
      if (mode === "subscribe" && token === verify_token) {
        // Respond with 200 OK and challenge token from the request
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    }
  }
}
