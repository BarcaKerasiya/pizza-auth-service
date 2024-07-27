import { NextFunction, Request, Response } from "express";
import { AuthRequest, RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { TokenService } from "../services/TokenService";
import createHttpError from "http-errors";
import { CredentialService } from "../services/Credentialservice";
import { Roles } from "../constants";

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
        role: Roles.CUSTOMER,
      });

      this.logger.info("User has been created", { id: user.id });

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccesToken(payload);
      // persist the refresh token
      const newRefreshtoken = await this.tokenService.persistRefreshtoken(user);
      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshtoken.id),
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
      const isPasswordMatch = await this.credentialService.comparePassword(
        password,
        user.password,
      );

      if (!isPasswordMatch) {
        const err = createHttpError(400, "Email or Password dose not match!");
        next(err);
        return true;
      }

      const payload: JwtPayload = {
        sub: String(user.id),
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

      res.status(200).json({ id: user.id });
    } catch (error) {
      next(error);
      return;
    }
  }

  async self(req: AuthRequest, res: Response) {
    console.log("req.auth", req.auth);
    const user = await this.userService.findById(Number(req.auth.sub));
    res.json({ ...user, password: undefined });
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payload: JwtPayload = {
        sub: String(req.auth.sub),
        role: req.auth.role,
      };
      this.logger.info("Request for generate new refresh token", {
        id: req.auth.sub,
      });

      const accessToken = this.tokenService.generateAccesToken(payload);
      // persist the refresh token
      const user = await this.userService.findById(Number(req.auth.sub));
      if (!user) {
        const err = createHttpError(400, "User with token not found!");
        next(err);
        return true;
      }
      const newRefreshtoken = await this.tokenService.persistRefreshtoken(user);
      // delete the old refresh token
      await this.tokenService.deleteRefreshToken(Number(req.auth.id));
      this.logger.info("Old refresh token has been deleted", {
        id: req.auth.sub,
      });
      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: newRefreshtoken.id,
      });
      this.logger.info("New refresh token has been sent", {
        id: req.auth.sub,
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

      res.status(200).json({ id: user.id });
    } catch (error) {
      next(error);
      return;
    }
  }
}
