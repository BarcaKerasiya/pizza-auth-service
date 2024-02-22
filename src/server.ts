import { Config } from "./config";
import app from "./app";
import { logger } from "./config/logger";
import { AppDataSource } from "./config/data-source";

const startServer = () => {
  const PORT = Config.PORT;
  try {
    AppDataSource.initialize()
      .then(() => {
        logger.info("Database Connected....");
        app.listen(PORT, () => {
          logger.info(`Listening on port ${PORT}`);
        });
      })
      .catch((error) => console.log("TypeORM connection error: ", error));
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(error.message);
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    }
  }
};
startServer();
