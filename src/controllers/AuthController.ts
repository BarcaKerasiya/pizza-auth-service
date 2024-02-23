import { NextFunction, Request, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/AuthService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { TokenService } from "../services/TokenService";
import createHttpError from "http-errors";
import { CredentialService } from "../services/Credentialservice";

export class Authcontroller {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
    private credentialService: CredentialService,
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

  async login(req: Request, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    const { email, password } = req.body as Record<string, string>;

    this.logger.debug("New request to login user", {
      email,
      password: "******",
    });

    try {
      const user = await this.userService.findByEmail(email);

      if (!user) {
        const err = createHttpError(400, "Email or Password dose not match!");
        next(err);
        return true;
      }

      //compare password
      const isPasswordMatch = this.credentialService.comparePassword(
        password,
        user.password,
      );

      if (!isPasswordMatch) {
        const err = createHttpError(400, "Email or Password dose not match!");
        next(err);
        return true;
      }

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
      this.logger.info("User has been logged in", { id: user.id });

      res.status(201).json({ id: user.id });
    } catch (error) {
      next(error);
      return;
    }
  }
}
