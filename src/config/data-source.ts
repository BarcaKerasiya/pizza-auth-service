import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Config } from ".";
import { RefreshToken } from "../entities/RefreshToken";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: Config.DB_HOST,
  port: Number(Config.DB_PORT),
  username: Config.DB_USERNAME,
  password: Config.DB_PASSWORD,
  database: Config.DB_NAME,
  // do not use in production || allways keep false
  synchronize: false,
  // logging: true,
  entities: [User, RefreshToken],
  migrations: [],
  subscribers: [],
});
