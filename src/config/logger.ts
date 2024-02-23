import winston from "winston";
// import { Config } from "./index";
const { format } = winston;

export const logger = winston.createLogger({
  level: "info",
  // format: winston.format.json(),
  defaultMeta: { serviceName: "auth-service" },
  format: format.combine(format.timestamp(), format.json()),

  transports: [
    new winston.transports.File({
      dirname: "logs",
      filename: "error.log",
      level: "error",
      // silent: Config.NODE_ENV === "test",
    }),
    new winston.transports.File({
      dirname: "logs",
      filename: "combined.log",
      level: "info",
      // silent: Config.NODE_ENV === "test",
    }),
    new winston.transports.Console({
      level: "info",
      // silent: Config.NODE_ENV === "test",
    }),
  ],
});
