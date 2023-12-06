import { Request, Response } from "express";
import log from "../utils/logger";

import {
  changePassword,
  createUser,
  editUser,
  getUser,
  getUsers,
  resetPassword,
  sendPasswordResetMail,
} from "../services/user.service";

import {
  ChangePassword,
  CreateUser,
  EditUser,
  ForgotPassword,
  GetUser,
  ResetPassword,
} from "../schema/user.schema";

async function createUserHanlder(
  req: Request<{}, {}, CreateUser["body"]>,
  res: Response
) {
  try {
    const user = await createUser(req.body);

    if (!user) return res.status(409).send("Email address already exist");

    return res.status(201).json({ status: true, data: user });
  } catch (e: any) {
    log.error(e);
    return res.status(500).send(e.message);
  }
}

async function editUserHanlder(
  req: Request<{}, {}, EditUser["body"]>,
  res: Response
) {
  const { user_uuid } = res.locals.user;

  try {
    const response = await editUser(user_uuid, req.body);

    if (!response.stat) {
      if (response.message == "user not found") return res.sendStatus(404);

      return res.status(409).send(response.message);
    }

    return res.status(201).json({ status: true, message: response.message });
  } catch (e: any) {
    log.error(e);
    return res.status(500).send(e.message);
  }
}

async function changePasswordHanlder(
  req: Request<{}, {}, ChangePassword["body"]>,
  res: Response
) {
  const { user_uuid } = res.locals.user;

  try {
    const response = await changePassword(user_uuid, req.body);

    if (!response.stat) {
      if (response.message == "user not found") return res.sendStatus(404);

      return res.status(409).send(response.message);
    }

    return res.status(201).json({ status: true, message: response.message });
  } catch (e: any) {
    log.error(e);
    return res.status(500).send(e.message);
  }
}

async function getUserHanlder(req: Request<GetUser["params"]>, res: Response) {
  const { user_uuid } = req.params;

  try {
    const user = await getUser({ user_uuid });

    if (!user) return res.sendStatus(404);

    return res.status(200).json({ status: true, data: user });
  } catch (e: any) {
    log.error(e);
    return res.status(500).send(e.message);
  }
}

async function getUsersHanlder(req: Request, res: Response) {
  let { limit, page } = req.query;

  let _limit = limit ? parseInt(limit as string) : 10;
  let _page = page ? parseInt(page as string) : 1;

  try {
    const users = await getUsers(_limit, _page);

    return res.status(200).json({ status: true, data: users });
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
    const response = await sendPasswordResetMail(email);

    if (!response.stat) {
      if (response.message == "user not found") return res.sendStatus(404);

      return res.status(200).json({ status: false, message: response.message });
    }

    return res.status(201).json({ status: true, message: response.message });
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
    const response = await resetPassword(passwordResetToken, req.body);

    if (!response.stat) {
      if (
        response.message == "token missing" ||
        response.message == "invalid token"
      ) {
        return res.sendStatus(404);
      }

      return res.status(409).send(response.message);
    }

    return res.status(201).json({ status: true, message: response.message });
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
