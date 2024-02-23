import express, { NextFunction, Request, Response } from "express";
import { Authcontroller } from "../controllers/AuthController";
import { UserService } from "../services/AuthService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { logger } from "../config/logger";
import registorValidator from "../validators/registor-validator";
import { TokenService } from "../services/TokenService";
import { RefreshToken } from "../entities/RefreshToken";
import loginValidator from "../validators/login-validator";
import { CredentialService } from "../services/Credentialservice";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);
const credentialService = new CredentialService();
const authcontroller = new Authcontroller(
  userService,
  logger,
  tokenService,
  credentialService,
);

router.post(
  "/register",
  registorValidator,
  (req: Request, res: Response, next: NextFunction) =>
    authcontroller.register(req, res, next),
);

router.post(
  "/login",
  loginValidator,
  (req: Request, res: Response, next: NextFunction) => {
    void authcontroller.login(req, res, next);
  },
);

export default router;
