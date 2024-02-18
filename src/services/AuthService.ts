import { Repository } from "typeorm";
import { User } from "../entities/User";
import { Userdata } from "../types";
import createHttpError from "http-errors";
import { Roles } from "../constants";

export class UserService {
  constructor(private userRepository: Repository<User>) {}
  async create({ firstName, lastName, email, password }: Userdata) {
    try {
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password,
        role: Roles.CUSTOMER,
      });
    } catch (error) {
      const err = createHttpError(500, "Failed to store the data in database");
      throw error;
    }
  }
}
