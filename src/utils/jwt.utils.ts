import jwt from "jsonwebtoken";
import { config } from "../config";
import { get } from "lodash";

const jwtSecret = config.jwt_secret;

export function signJWT(object: Object, options?: jwt.SignOptions) {
  return jwt.sign(object, jwtSecret, {
    ...(options || {}),
    algorithm: "HS256",
  });
}

export function verifyJWT(token: string): {
  valid: boolean;
  expired?: boolean;
  decoded?: jwt.JwtPayload;
} {
  const decoded = jwt.decode(token) as jwt.JwtPayload;
  if (!decoded) return { valid: false }; //an invalid token passed

  const currentTime = Math.floor(new Date().getTime() / 1000);

  if (get(decoded, "exp")! <= currentTime) {
    return { valid: false, expired: true };
  }

  return { valid: true, expired: false, decoded };
}
