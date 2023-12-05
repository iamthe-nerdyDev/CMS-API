import { Pool } from "mysql2/promise";

export interface IConfig {
  db: Pool;
  server: {
    port: number;
  };
  passport: {
    facebook: {
      clientID?: string;
      clientSecret?: string;
    };
    google: {
      clientID?: string;
      clientSecret?: string;
    };
    x: {
      clientID?: string;
      clientSecret?: string;
    };
  };
  saltWorkFactor: number;
  refreshTokenToLive: string;
  accessTokenToLive: string;
  jwt_secret: string;
  base_url: string;
  client_url: string;
}

export interface GetUserFn {
  user_uuid?: string;
  id?: number;
  emailAddress?: string;
}
