import { Express } from "express";
import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { OAuth2Strategy as GoogleStrategy } from "passport-google-oauth";
import { Strategy as TwitterStrategy } from "passport-twitter";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { config } from "../config";
import {
  getOrCreateUserFromSocialProvider,
  getUser,
} from "../services/user.service";
import bcryptjs from "bcryptjs";
import { omit } from "lodash";

function initPassport(app: Express) {
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
      async function (jwtPayload, done) {
        const user_uuid = jwtPayload.user_uuid;

        const user = await getUser({ user_uuid });

        //TODO: get stuffs from db and pass it as the jwtPayload in the done fnn
        return done(null, user);
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
      async (email, password, done) => {
        const user = await getUser({ emailAddress: email }, false);
        if (!user) return done(new Error("Wrong email"));

        const compare = await bcryptjs.compare(password, user.password);
        if (!compare) return done(new Error("Wrong password"));

        //login is successful
        return done(false, omit(user, "password"));
      }
    )
  );

  // for login with facebook
  passport.use(
    new FacebookStrategy(
      {
        clientID: config.passport.facebook.clientID,
        clientSecret: config.passport.facebook.clientSecret,
        callbackURL: config.base_url + "/api/v1/login/callback/facebook",
        profileFields: ["id", "first_name", "last_name", "email", "picture"],
        passReqToCallback: true,
      },
      function (_, __, ___, profile, done) {
        process.nextTick(async function () {
          try {
            if (!profile._json.email) {
              //incase phone number was used to create fb account
              return done(new Error("Email not linked to facebook account"));
            }

            const { user, error } = await getOrCreateUserFromSocialProvider(
              profile.id,
              profile._json.first_name,
              profile._json.last_name,
              profile._json.picture.data.url,
              profile._json.email,
              "facebook"
            );

            if (error) return done(new Error(error));

            return done(null, user);
          } catch (e) {
            return done(new Error("Unknown error"));
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
        callbackURL: config.base_url + "/api/v1/login/callback/google",
        passReqToCallback: true,
      },
      function (_, __, ___, profile, done) {
        process.nextTick(async function () {
          try {
            //incase phone number was used to create google account
            if (!profile._json.email) {
              return done(new Error("Email not linked to google account"));
            }

            const { user, error } = await getOrCreateUserFromSocialProvider(
              profile.id,
              profile._json.given_name,
              profile._json.family_name,
              profile._json.picture,
              profile._json.email,
              "google"
            );

            if (error) return done(new Error(error));

            return done(null, user);
          } catch (err) {
            return done(new Error("Unknown error"));
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
        callbackURL: config.base_url + "/api/v1/login/callback/twitter",
        passReqToCallback: true,
      },
      function (_, __, ___, profile, done) {
        process.nextTick(async function () {
          try {
            if (!profile.emails) {
              //incase phone number was used to create twitter account
              return done(new Error("Email not linked to google account"));
            }

            if (!profile.name) {
              //no name to fetch..
              return done(new Error("Unable to retrieve profile name"));
            }

            const { user, error } = await getOrCreateUserFromSocialProvider(
              profile.id,
              profile.name.givenName,
              profile.name.familyName,
              (profile.photos && profile.photos[0].value) || null,
              profile.emails[0].value,
              "twitter"
            );

            if (error) return done(new Error(error));

            return done(null, user);
          } catch (err) {
            return done(new Error("Unknown error"));
          }
        });
      }
    )
  );
}

export default { initPassport };
