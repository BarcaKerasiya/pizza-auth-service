import fs from "fs";
import path from "path";
import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/AuthService";
import { Logger } from "winston";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";
import { JwtPayload, sign } from "jsonwebtoken";
import { Config } from "../config";

export class Authcontroller {
  constructor(
    private userService: UserService,
    private logger: Logger,
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
      let privateKey: string;
      try {
        privateKey = fs
          .readFileSync(path.join(__dirname, "../../certs/private.pem"))
          .toString();
      } catch (error) {
        const err = createHttpError(500, "Error while reading private key");
        next(err);
        return;
      }
      const payload: JwtPayload = {
        id: String(user.id),
        role: user.role,
      };

      const accessToken = sign(payload, privateKey, {
        algorithm: "RS256",
        expiresIn: "1h",
        issuer: "auth-service",
      });

      const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET_KEY!, {
        algorithm: "HS256",
        expiresIn: "1y",
        issuer: "auth-service",
      });
      console.log("refreshToken", refreshToken);
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
}
