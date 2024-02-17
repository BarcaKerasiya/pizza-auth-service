import { Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/AuthService";

export class Authcontroller {
  constructor(private userService: UserService) {}
  async register(req: RegisterUserRequest, res: Response) {
    const { firstName, lastName, email, password } = req.body;

    await this.userService.create({ firstName, lastName, email, password });

    res.status(201).json();
  }
}
