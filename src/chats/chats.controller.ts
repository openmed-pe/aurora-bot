import { Request, Response } from "express";
import mongoose from "mongoose";
import { IChat } from "./chats.interface";

import { ChatService } from "./chats.service";

const chatService = new ChatService();

export class ChatsController {
  async list(req: Request, res: Response) {
    try {
      const chats = await chatService.list();
      res.status(200).json({
        status: 200,
        data: chats,
        message: "CHATS_LISTED",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json("ERROR_GETTING_CHATS");
    }
  }

  async listByNumber(req: Request, res: Response) {
    const number = parseInt(req.params.number);
    try {
      const chats = await chatService.getByNumber(number);
      res.status(200).json({
        status: 200,
        data: chats,
        message: "CHAT_LISTED_BYNUMBER",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json("ERROR_GETTING_CHAT");
    }
  }

  async insert(req: Request, res: Response) {
    //const body = req.body;
    const data: Partial<IChat> = {
      number: req.body.number,
      name: req.body.name,
      messages: req.body.messages,
      created_at: new Date(),
      state: req.body.state,
    };
    try {
      const chat = await chatService.insert(data);
      res.status(200).json({
        status: 200,
        data: chat,
        message: "CHAT_INSERTED",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json("ERROR_INSERTING_CHAT");
    }
  }

  async update(req: Request, res: Response) {
    const number = parseInt(req.params.number);
    const state = req.body.state;
    const messages = req.body.messages;

    try {
      const chat = await chatService.getByNumber(number);
      chat.messages = [...chat.messages, ...messages];
      const updatedChat = await chatService.update(chat._id, chat);
      res.status(200).json({
        status: 200,
        data: updatedChat,
        message: "CHAT_UPDATED",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json("ERROR_UPDATING_CHAT");
    }
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ status: 400, message: "INVALID_CHAT_ID" });
      return;
    }
    try {
      const dletedChat = await chatService.delete(id);
      res.status(200).json({
        status: 200,
        data: dletedChat,
        message: "CHAT_DELETED",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json("ERROR_DELETING_CHAT");
    }
  }
}
