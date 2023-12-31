import dotenv from "dotenv";
import mysql from "mysql2";
import { IConfig } from "../interface";

dotenv.config();

const SERVER_PORT = process.env.SERVER_PORT
  ? parseInt(process.env.SERVER_PORT)
  : 1337;

const db = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

export const config: IConfig = {
  db,
  server: { port: SERVER_PORT },
  passport: {
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
  passwordResetTokenValidity: 24 * 60 * 60 * 1000, //24 hours...
  jwt_secret: process.env.JWT_SECRET_TOKEN || "xxxx-test-xxxx",
  base_url: process.env.BASE_SERVER_URL || `http://localhost:${SERVER_PORT}`,
  client_url: process.env.BASE_CLIENT_URL || "",
};
