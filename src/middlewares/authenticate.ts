import { GetVerificationKey, expressjwt } from "express-jwt";
import { Request } from "express";
import jwksClient from "jwks-rsa";
import { Config } from "../config";

export default expressjwt({
  secret: jwksClient.expressJwtSecret({
    jwksUri: Config.JWKS_URI!,
    cache: true,
    rateLimit: true,
  }) as GetVerificationKey,
  algorithms: ["RS256"],
  getToken(req: Request) {
    const authHeader = req.headers.authorization;

    // Bearer dfsdfdfsdfdf
    if (authHeader && authHeader.split(" ")[1] !== undefined) {
      const token = authHeader.split(" ")[1];
      if (token) {
        return token;
      }
    }

    interface AuthCookies {
      accessToken: string;
    }
    const { accessToken } = req.cookies as AuthCookies;
    return accessToken;
  },
});
