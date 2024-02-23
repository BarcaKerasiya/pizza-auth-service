import { compare } from "bcrypt";

export class CredentialService {
  async comparePassword(userPassword: string, hashedPassword: string) {
    return await compare(userPassword, hashedPassword);
  }
}
