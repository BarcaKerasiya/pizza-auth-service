import express from "express";
import { Authcontroller } from "../controllers/AuthController";
import { UserService } from "../services/AuthService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authcontroller = new Authcontroller(userService);

router.post("/register", (req, res) => authcontroller.register(req, res));

export default router;
