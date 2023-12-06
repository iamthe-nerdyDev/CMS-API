import { NextFunction, Request, Response } from "express";
import passport from "passport";
import { config } from "../config";
import { signJWT } from "../utils/jwt.utils";
import { createSession } from "../services/session.service";

const CLIENT_LOGIN_PAGE = `${config.client_url}/login`;

function _createSession(user: any, info: any, req: Request, res: Response) {
  if (!user) return res.redirect(`${CLIENT_LOGIN_PAGE}?error=${info.message}`);

  req.login(user, { session: false }, async (err) => {
    if (err) res.status(400).send({ err });

    //create session
    const session = await createSession(
      user.user_uuid,
      req.get("user-agent") || ""
    );

    if (!session) return res.sendStatus(500);

    const payload = { user_uuid: user.user_uuid, session: session.id };

    const accessToken = signJWT(payload, {
      expiresIn: config.accessTokenToLive,
    });

    const refreshToken = signJWT(payload, {
      expiresIn: config.refreshTokenToLive,
    });

    return res.status(200).send({ accessToken, refreshToken });
  });
}

function loginFacebook(req: Request, res: Response, next: NextFunction) {
  passport.authenticate(
    "facebook",
    { session: false },
    (_: any, user: any, info: any) => {
      _createSession(user, info, req, res);
    }
  )(req, res, next);
}

function loginGoogle(req: Request, res: Response, next: NextFunction) {
  passport.authenticate(
    "google",
    { session: false },
    (_: any, user: any, info: any) => {
      _createSession(user, info, req, res);
    }
  )(req, res, next);
}

function loginTwitter(req: Request, res: Response, next: NextFunction) {
  passport.authenticate(
    "twitter",
    { session: false },
    (err: any, user: any) => {
      _createSession(user, err, req, res);
    }
  )(req, res, next);
}

function loginLocal(req: Request, res: Response, next: NextFunction) {
  passport.authenticate(
    "local",
    { session: false },
    (_: any, user: any, info: any) => {
      _createSession(user, info, req, res);
    }
  )(req, res, next);
}

export default { loginFacebook, loginGoogle, loginLocal, loginTwitter };
