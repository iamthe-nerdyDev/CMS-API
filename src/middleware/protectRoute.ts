import { Request, Response, NextFunction } from "express";

function protectRoute(_: Request, res: Response, next: NextFunction) {
  const user_uuid = res.locals.user_uuid;

  if (!user_uuid) return res.sendStatus(403);

  return next();
}

export default protectRoute;
