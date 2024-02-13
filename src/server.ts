import { Config } from "./config";
import app from "./app";
import { logger } from "./config/logger";
import { AppDataSource } from "./config/data-source";

const startServer = () => {
  const PORT = Config.PORT;
  try {
    console.log("first");
    AppDataSource.initialize()
      .then(() => {
        app.listen(PORT, () => {
          console.log("Database Connected....");
          logger.info(`Listening on port ${PORT}`);
        });
      })
      .catch((error) => console.log("TypeORM connection error: ", error));
  } catch (error: unknown) {
    console.log("catch");
    if (error instanceof Error) {
      logger.error(error.message);
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    }
  }
};
startServer();
