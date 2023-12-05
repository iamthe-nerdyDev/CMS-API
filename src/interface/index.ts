export interface IConfig {
  server: {
    port: number;
  };
  OAuth: {
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
}
