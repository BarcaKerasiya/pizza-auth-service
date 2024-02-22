import fs from "fs";
import path from "path";
import createHttpError from "http-errors";
import { sign, JwtPayload } from "jsonwebtoken";
import { Config } from "../config";
import { RefreshToken } from "../entities/RefreshToken";
import { User } from "../entities/User";
import { Repository } from "typeorm";

export class TokenService {
  constructor(private refrshTokenRepository: Repository<RefreshToken>) {}
  generateAccesToken(payload: JwtPayload) {
    let privateKey: Buffer;
    try {
      privateKey = fs.readFileSync(
        path.join(__dirname, "../../certs/private.pem"),
      );
    } catch (error) {
      const err = createHttpError(500, "Error while reading private key");
      throw err;
    }
    const accessToken = sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "1h",
      issuer: "auth-service",
    });
    return accessToken;
  }

  generateRefreshToken(payload: JwtPayload) {
    const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET_KEY!, {
      algorithm: "HS256",
      expiresIn: "1y",
      issuer: "auth-service",
      jwtid: String(payload.id),
    });
    return refreshToken;
  }

  async persistRefreshtoken(user: User) {
    const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
    const newRefreshtoken = await this.refrshTokenRepository.save({
      user: user,
      expireAt: new Date(Date.now() + MS_IN_YEAR),
    });
    return newRefreshtoken;
  }
}
