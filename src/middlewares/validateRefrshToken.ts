import { expressjwt } from "express-jwt";
import { Config } from "../config";
import { Request } from "express";
import { AuthCookies, IrefrshToeknPayload } from "../types";
import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entities/RefreshToken";
import { logger } from "../config/logger";

export default expressjwt({
  secret: Config.REFRESH_TOKEN_SECRET_KEY!,
  algorithms: ["HS256"],
  getToken(req: Request) {
    const { refreshToken } = req.cookies as AuthCookies;
    return refreshToken;
  },
  async isRevoked(request: Request, token) {
    console.log("token", token);
    try {
      const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
      const refreshToken = await refreshTokenRepo.findOne({
        where: {
          id: Number((token?.payload as IrefrshToeknPayload).id),
          user: { id: Number(token?.payload.sub) },
        },
      });
      return refreshToken === null;
    } catch (error) {
      logger.error("Error while getting the refresh toekn", {
        id: (token?.payload as IrefrshToeknPayload).id,
      });
    }
    return true;
  },
});
