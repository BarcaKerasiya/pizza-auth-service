import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Config } from ".";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: Config.DB_HOST,
  port: Number(Config.DB_PORT),
  username: Config.DB_USERNAME,
  password: Config.DB_PASSWORD,
  database: Config.DB_NAME,
  // do not use in production
  synchronize:
    Config.NODE_ENV === "dev" || Config.NODE_ENV === "test" ? true : false,
  // logging: true,
  entities: [User],
  migrations: [],
  subscribers: [],
});
