import { Request, Response } from "express";
import mongoose from "mongoose";
import { IUser } from "./users.interface";

import { UserService } from "./users.service";

const userService = new UserService();

export class UsersController {
  async list(req: Request, res: Response) {
    try {
      const users = await userService.list();
      res.status(200).json({
        status: 200,
        data: users,
        message: "USERS_LISTED",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json("ERROR_GETTING_USERS");
    }
  }

  async listByNumber(req: Request, res: Response) {
    const number = parseInt(req.params.number);
    try {
      const users = await userService.getByNumber(number);
      res.status(200).json({
        status: 200,
        data: users,
        message: "USER_LISTED_BYNUMBER",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json("ERROR_GETTING_USER");
    }
  }

  async insert(req: Request, res: Response) {
    //const body = req.body;
    const data: Partial<IUser> = {
      phone: req.body.phone,
      phoneName: req.body.phoneName,
      dni: req.body.dni,
      createdAt: new Date(),
    };
    try {
      const user = await userService.insert(data);
      res.status(200).json({
        status: 200,
        data: user,
        message: "USER_INSERTED",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json("ERROR_INSERTING_USER");
    }
  }

  async update(req: Request, res: Response) {
    const phone = parseInt(req.params.number);

    try {
      const user = await userService.getByNumber(phone);
      const updatedUser = await userService.update(user._id, user);
      res.status(200).json({
        status: 200,
        data: updatedUser,
        message: "USER_UPDATED",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json("ERROR_UPDATING_USER");
    }
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ status: 400, message: "INVALID_USER_ID" });
      return;
    }
    try {
      const dletedUser = await userService.delete(id);
      res.status(200).json({
        status: 200,
        data: dletedUser,
        message: "USER_DELETED",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json("ERROR_DELETING_USER");
    }
  }
}
