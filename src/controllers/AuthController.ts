import { Request, Response } from "express";

export class Authcontroller {
  register(req: Request, res: Response) {
    res.status(201).json();
  }
}
