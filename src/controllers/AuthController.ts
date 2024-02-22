import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/AuthService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { TokenService } from "../services/TokenService";

export class Authcontroller {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
  ) {}
  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { firstName, lastName, email, password } = req.body;

    this.logger.debug("New request to register user", {
      firstName,
      lastName,
      email,
      password: "******",
    });
    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
      });

      this.logger.info("User has been created", { id: user.id });

      const payload: JwtPayload = {
        id: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccesToken(payload);
      // persist the refresh token
      const newRefreshtoken = await this.tokenService.persistRefreshtoken(user);

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: newRefreshtoken.id,
      });
      res.cookie("accessToken", accessToken, {
        maxAge: 1000 * 60 * 60, // 1h
        sameSite: "strict",
        domain: "localhost",
        httpOnly: true, // super token
      });
      res.cookie("refreshToken", refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
        sameSite: "strict",
        domain: "localhost",
        httpOnly: true, // super token
      });
      res.status(201).json({ id: user.id });
    } catch (error) {
      next(error);
      return;
    }
  }

  // async login(req: Request, res: Response, next: NextFunction) {}
}
