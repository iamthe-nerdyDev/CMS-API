import { Request, Response } from "express";
import {
  ChangePassword,
  CreateUser,
  EditUser,
  ForgotPassword,
  GetUser,
  ResetPassword,
} from "../schema/user.schema";
import log from "../utils/logger";
import { createUser } from "../services/user.service";

async function createUserHanlder(
  req: Request<{}, {}, CreateUser["body"]>,
  res: Response
) {
  try {
    const user = await createUser(req.body);
  } catch (e: any) {
    log.error(e);
    return res.status(500).send(e.message);
  }
}

async function editUserHanlder(
  req: Request<{}, {}, EditUser["body"]>,
  res: Response
) {
  const { user_uuid } = res.locals;

  try {
    //TODO: do fn
    //const response = await editUser({ user_uuid, ...req.body });
  } catch (e: any) {
    log.error(e);
    return res.status(500).send(e.message);
  }
}

async function changePasswordHanlder(
  req: Request<{}, {}, ChangePassword["body"]>,
  res: Response
) {
  const { user_uuid } = res.locals;

  try {
    //TODO: do fn
    //const response = await editUser({ user_uuid, ...req.body });
  } catch (e: any) {
    log.error(e);
    return res.status(500).send(e.message);
  }
}

async function getUserHanlder(req: Request<GetUser["params"]>, res: Response) {
  const { user_uuid } = req.params;

  try {
    //TODO: do fn
    //const user = await getUser(user_uuid);
  } catch (e: any) {
    log.error(e);
    return res.status(500).send(e.message);
  }
}

async function getUsersHanlder(req: Request, res: Response) {
  const { limit, page } = req.query;

  try {
    //TODO: do fn
    //const users = await getUsers(limit, page);
  } catch (e: any) {
    log.error(e);
    return res.status(500).send(e.message);
  }
}

async function forgotPasswordHanlder(
  req: Request<ForgotPassword["params"]>,
  res: Response
) {
  const { email } = req.params;

  try {
    //TODO: do fn
    //const response = await sendPasswordResetMail(email);
  } catch (e: any) {
    log.error(e);
    return res.status(500).send(e.message);
  }
}

async function resetPasswordHanlder(
  req: Request<ResetPassword["params"], {}, ResetPassword["body"]>,
  res: Response
) {
  const { passwordResetToken } = req.params;

  try {
    //TODO: do fn
    //const response = await resetPassword({ passwordResetToken, ...req.body });
  } catch (e: any) {
    log.error(e);
    return res.status(500).send(e.message);
  }
}

export default {
  createUserHanlder,
  editUserHanlder,
  changePasswordHanlder,
  getUserHanlder,
  getUsersHanlder,
  forgotPasswordHanlder,
  resetPasswordHanlder,
};
