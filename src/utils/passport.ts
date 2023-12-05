import { Express } from "express";
import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { OAuth2Strategy as GoogleStrategy } from "passport-google-oauth";
import { Strategy as TwitterStrategy } from "passport-twitter";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { config } from "../config";

export default function initPassport(app: Express) {
  app.use(passport.initialize());

  //#ensuring that facebook clientID is passed
  if (!config.passport.facebook.clientID) {
    throw new Error("missing .env variable: FACEBOOK_CLIENT_ID");
  }
  //#ensuring that facebook clientSecret is passed
  if (!config.passport.facebook.clientSecret) {
    throw new Error("missing .env variable: FACEBOOK_CLIENT_SECRET");
  }
  //#ensuring that google clientID is passed
  if (!config.passport.google.clientID) {
    throw new Error("missing .env variable: GOOGLE_CLIENT_ID");
  }
  //#ensuring that google clientSecret is passed
  if (!config.passport.google.clientSecret) {
    throw new Error("missing .env variable: GOOGLE_CLIENT_SECRET");
  }
  //#ensuring that x clientID is passed
  if (!config.passport.x.clientID) {
    throw new Error("missing .env variable: X_CLIENT_ID");
  }
  //#ensuring that x clientSecret is passed
  if (!config.passport.x.clientSecret) {
    throw new Error("missing .env variable: X_CLIENT_SECRET");
  }

  passport.use(
    "jwt",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.jwt_secret,
      },
      function (jwtPayload, _callback) {
        const user_uuid = jwtPayload.user_uuid;

        //TODO: get stuffs from db and pass it as the jwtPayload in the _callback fnn
        return _callback(null, jwtPayload);
      }
    )
  );

  //for login with email and password
  passport.use(
    "local",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        session: false,
      },
      async (email, password, _callback) => {
        //TODO: Check for the user and ensure email and password is valid
        //return _callback(null or error, false or userObject, { message: errorMsg });
      }
    )
  );

  // for login with facebook
  passport.use(
    new FacebookStrategy(
      {
        clientID: config.passport.facebook.clientID,
        clientSecret: config.passport.facebook.clientSecret,
        callbackURL: config.base_url + "/api/v1/auth/callback/facebook",
        profileFields: ["id", "first_name", "last_name", "email", "picture"],
        passReqToCallback: true,
      },
      function (req, _, __, profile, _callback) {
        process.nextTick(async function () {
          try {
            if (!profile._json.email) {
              //incase phone number was used to create fb account
              return _callback(null, false, {
                message: "Email not linked to facebook account",
              });
            }

            //TODO: Try getting or creating a user and return necessary stuffs
          } catch (e) {
            return _callback(null, null, { message: "Unknown error" });
          }
        });
      }
    )
  );

  //for login with google
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.passport.google.clientID,
        clientSecret: config.passport.google.clientSecret,
        callbackURL: config.base_url + "/api/v1/auth/callback/google",
        passReqToCallback: true,
      },
      function (req, _, __, profile, _callback) {
        process.nextTick(async function () {
          try {
            //incase phone number was used to create google account
            if (!profile._json.email) {
              return _callback(null, false, {
                message: "Email not linked to google account",
              });
            }

            //TODO: Try getting or creating a user and return necessary stuffs
          } catch (err) {
            return _callback(null, null, { message: "Unknown error" });
          }
        });
      }
    )
  );

  //for login with twitter
  passport.use(
    new TwitterStrategy(
      {
        consumerKey: config.passport.x.clientID,
        consumerSecret: config.passport.x.clientSecret,
        callbackURL: config.base_url + "/api/v1/auth/callback/twitter",
        passReqToCallback: true,
      },
      function (req, _, __, profile, _callback) {
        process.nextTick(async function () {
          try {
            //incase phone number was used to create twitter account
            if (!profile._json.email) {
              return _callback(
                { message: "Email not linked to google account" },
                false
              );
            }

            //TODO: Try getting or creating a user and return necessary stuffs
          } catch (err) {
            return _callback({ message: "Unknown error" }, null);
          }
        });
      }
    )
  );
}
