import express, { NextFunction, Request, Response } from "express";
import { logger } from "./config/logger";
import { HttpError } from "http-errors";
import authRouter from "./routes/app";

const app = express();

app.get("/", async (req, res) => {
  res.send("Welcome to Auth service");
});

app.use("/auth", authRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  console.log("inn");
  logger.error(err.message);
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    errors: [
      {
        type: err.name,
        msg: err.message,
        path: "",
        location: "",
      },
    ],
  });
});

export default app;
