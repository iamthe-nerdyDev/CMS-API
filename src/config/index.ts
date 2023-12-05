import dotenv from "dotenv";
import { IConfig } from "../interface";

dotenv.config();

const SERVER_PORT = process.env.SERVER_PORT
  ? parseInt(process.env.SERVER_PORT)
  : 1337;

export const config: IConfig = {
  server: { port: SERVER_PORT },
  OAuth: {
    facebook: {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    },
    google: {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    x: {
      clientID: process.env.X_CLIENT_ID,
      clientSecret: process.env.X_CLIENT_SECRET,
    },
  },
  saltWorkFactor: 10,
  refreshTokenToLive: "1y",
  accessTokenToLive: "5m",
  jwt_secret: process.env.JWT_SECRET_TOKEN || "xxxx-test-xxxx",
};
