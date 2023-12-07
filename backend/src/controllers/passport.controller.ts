import { NextFunction, Request, Response } from "express";
import passport from "passport";
import { config } from "../config";
import { signJWT } from "../utils/jwt.utils";
import { createSession } from "../services/session.service";

async function _createSession(
  req: Request,
  res: Response,
  next: NextFunction,
  { user, err }: { user: any; err: any }
) {
  if (err) return next(err);

  const session = await createSession(user.user_uuid, req.get("user-agent"));

  const payload = { user_uuid: user.user_uuid, session: session!.id };

  const accessToken = signJWT(payload, {
    expiresIn: config.accessTokenToLive,
  });

  const refreshToken = signJWT(payload, {
    expiresIn: config.refreshTokenToLive,
  });

  return res.status(200).send({ accessToken, refreshToken });
}

function loginFacebook(req: Request, res: Response, next: NextFunction) {
  passport.authenticate("facebook", { session: false }, (err: any, user: any) =>
    _createSession(req, res, next, { user, err })
  )(req, res, next);
}

function loginGoogle(req: Request, res: Response, next: NextFunction) {
  passport.authenticate("google", { session: false }, (err: any, user: any) =>
    _createSession(req, res, next, { user, err })
  )(req, res, next);
}

function loginTwitter(req: Request, res: Response, next: NextFunction) {
  passport.authenticate("twitter", { session: false }, (err: any, user: any) =>
    _createSession(req, res, next, { user, err })
  )(req, res, next);
}

function loginLocal(req: Request, res: Response, next: NextFunction) {
  passport.authenticate("local", { session: false }, (err: any, user: any) =>
    _createSession(req, res, next, { user, err })
  )(req, res, next);
}

export default { loginFacebook, loginGoogle, loginLocal, loginTwitter };
