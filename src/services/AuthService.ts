import { Repository } from "typeorm";
import { User } from "../entities/User";
import { Userdata } from "../types";

export class UserService {
  constructor(private userRepository: Repository<User>) {}
  async create({ firstName, lastName, email, password }: Userdata) {
    await this.userRepository.save({
      firstName,
      lastName,
      email,
      password,
    });
  }
}
