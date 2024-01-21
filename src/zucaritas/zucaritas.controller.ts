import { Request, Response } from "express";
import yenv from "yenv";
import { GptController } from "../gpt/gpt.controller";
import { ChatService } from "../chats/chats.service";
import { IChat, IMessage } from "../chats/chats.interface";
import { ZucaritasService } from "./zucaritas.service";
import { UserService } from "../users/users.service";
import { IUser } from "../users/users.interface";

const env = yenv();
const gptController = new GptController();
const chatsService = new ChatService();
const userService = new UserService();
const zucaritasService = new ZucaritasService();

export class ZucaritasController {
  async events(req: Request, res: Response) {
    if (req.body.object) {
      if (req.body.entry[0].changes[0].value.messages) {
        // console.log(
        //   "MESSAGE EVENT",
        //   JSON.stringify(req.body.entry[0].changes[0].value.messages, null, 2)
        // );
        res.sendStatus(200);
        if (req.body.entry[0].changes[0].value.messages[0].type == "text") {
          const currentMessage: IMessage = {
            role: "user",
            content: req.body.entry[0].changes[0].value.messages[0].text.body,
          };
          console.log("USER: ", currentMessage.content);
          var user = await userService.getByNumber(
            parseInt(req.body.entry[0].changes[0].value.contacts[0].wa_id)
          );
          if (user == null) {
            const userData: Partial<IUser> = {
              phone: req.body.entry[0].changes[0].value.contacts[0].wa_id,
              phoneName:
                req.body.entry[0].changes[0].value.contacts[0].profile.name,
            };
            user = await userService.insert(userData);
          }

          var chat = await chatsService.getByUserIdandState(
            user._id,
            "Chatting"
          );
          if (chat == null) {
            const thread = await gptController.generateThreads(user);
            const chatData: Partial<IChat> = {
              userId: user._id,
              threadId: thread.id,
              threadStatus: "New",
              messages: [currentMessage],
              state: "Chatting",
            };
            chat = await chatsService.insert(chatData);
            await userService.pushChat(user._id, chat._id);
          } else {
            const aux = await chatsService.pushMessage(
              chat._id,
              currentMessage
            );
          }

          if (chat.threadStatus == "Busy") {
            const response =
              "Lo siento, nuestra AI esta ocupada generando la respuesta del mensaje previo";
            const resFinal = await zucaritasService.sendMessage(
              response,
              req.body.entry[0].changes[0].value.metadata.phone_number_id,
              req.body.entry[0].changes[0].value.messages[0].from
            );
            console.log("GPT: ", response);
          } else {
            // Generate the response
            await chatsService.updateThread(chat._id, "Busy");
            var response = await gptController.generateNewResponse(
              user,
              chat,
              currentMessage.content
            );
            var i = 1;
            while (response == "FAIL") {
              console.log("INTENTO: ", i);
              await new Promise((resolve) => setTimeout(resolve, 2000));
              response = await gptController.generateNewResponse(
                user,
                chat,
                "?"
              );
              i = i + 1;
            }
            const iresponse = {
              role: "assistant",
              content: response,
            };

            await chatsService.pushMessage(chat._id, iresponse);
            console.log("GPT RESPONSE", JSON.stringify(response, null, 2));
            await chatsService.updateThread(chat._id, "Free");
            const resFinal = await zucaritasService.sendMessage(
              response,
              req.body.entry[0].changes[0].value.metadata.phone_number_id,
              req.body.entry[0].changes[0].value.messages[0].from
            );
          }
        } else {
          console.log("I can't read this type of message");
        }
      } else if (req.body.entry[0].changes[0].value.statuses) {
        res.sendStatus(200);
      } else {
        console.log("UNRECOGNICED EVENT: ", JSON.stringify(req.body, null, 2));
        res.sendStatus(200);
      }
    } else {
      res.sendStatus(404);
    }
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
