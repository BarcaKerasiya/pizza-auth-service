import express, { NextFunction, Request, Response } from "express";
import { Authcontroller } from "../controllers/AuthController";
import { UserService } from "../services/AuthService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { logger } from "../config/logger";
import registorValidation from "../validators/registor-validation";
import { TokenService } from "../services/TokenService";
import { RefreshToken } from "../entities/RefreshToken";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);
const authcontroller = new Authcontroller(userService, logger, tokenService);

router.post(
  "/register",
  registorValidation,
  (req: Request, res: Response, next: NextFunction) =>
    authcontroller.register(req, res, next),
);

export default router;
