import { Request, Response } from "express";
import log from "../utils/logger";
import { deleteSession, getSessions } from "../services/session.service";

async function getSessionsHandler(_: Request, res: Response) {
  const { user_uuid } = res.locals.user;

  try {
    const response = await getSessions(user_uuid);

    return res.status(200).json({ status: true, data: response });
  } catch (e: any) {
    log.error(e);
    return res.status(500).send(e.message);
  }
}

async function deleteSessionHandler(_: Request, res: Response) {
  const { session, user_uuid } = res.locals.user;

  try {
    const response = await deleteSession(session, user_uuid);

    if (!response) return res.sendStatus(409);

    res.setHeader("x-access-token", "xxxx"); //to trigger deletion of access and refresh token

    return res
      .status(200)
      .json({ status: true, accessToken: null, refreshToken: null });
  } catch (e: any) {
    log.error(e);
    return res.status(500).send(e.message);
  }
}

export default { getSessionsHandler, deleteSessionHandler };
