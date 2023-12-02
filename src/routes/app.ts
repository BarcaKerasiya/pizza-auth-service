import express from "express";
import { Authcontroller } from "../controllers/AuthController";

const router = express.Router();
const authcontroller = new Authcontroller();

router.post("/register", (req, res) => authcontroller.register(req, res));

export default router;
