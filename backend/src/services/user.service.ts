import bcryptjs from "bcryptjs";
import { config } from "../config";
import {
  ChangePassword,
  CreateUser,
  EditUser,
  ResetPassword,
} from "../schema/user.schema";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { omit } from "lodash";
import { getUsersCount } from "../utils/counter";
import { sendMail } from "../utils/nodemailer";
import { generateRandomString, hashPassword } from "../utils/helper";
import { broadcastEvent } from "../utils/socket";

const db = config.db;

export async function createUser(param: CreateUser["body"]) {
  const { emailAddress, firstName, lastName, password } = param;

  const hashedPassword = await hashPassword(password);

  try {
    //check if email address already exist...
    const _check = await getUser({ emailAddress });
    if (_check) return false;

    const response = await db.query<ResultSetHeader>(
      `
    INSERT INTO user (emailAddress, firstName, lastName, password, user_uuid)
    VALUES (?, ?, ?, ?, ?)
    `,
      [
        emailAddress,
        firstName,
        lastName,
        hashedPassword,
        `email_user_${generateRandomString(10)}`,
      ]
    );

    const user = await getUser({ id: response[0].insertId });

    return user;
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function getUser(
  data: {
    user_uuid?: string;
    id?: number;
    emailAddress?: string;
    passwordResetToken?: string;
    providerUserId?: string;
  },
  hidePassword: boolean = true
) {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT * FROM user WHERE user_uuid = ? OR id = ? OR emailAddress = ? OR passwordResetToken = ? OR providerUserId = ? LIMIT 1`,
      [
        data.user_uuid,
        data.id,
        data.emailAddress,
        data.passwordResetToken,
        data.providerUserId,
      ]
    );

    const user = rows[0];

    if (!user || Object.keys(user).length === 0) return undefined;

    //remove the password from the response
    if (hidePassword) return omit(user, "password");
    else return user;
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function getUsers(limit: number, page: number) {
  const skip = (page - 1) * limit;

  try {
    const totalUsers = await getUsersCount();

    if (totalUsers <= 0) return { page, limit, total: totalUsers, data: null };

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT * FROM user ORDER BY createdAt DESC LIMIT ?, ?`,
      [skip, limit]
    );

    return {
      page,
      limit,
      total: totalUsers,
      data: rows.map((user) => omit(user, "password")),
    };
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function editUser(user_uuid: string, param: EditUser["body"]) {
  const { emailAddress, firstName, lastName } = param;

  try {
    const user = await getUser({ user_uuid });
    if (!user) return { stat: false, message: "not found" };

    if (user.user_uuid !== user_uuid) return { stat: false, message: "denied" };

    let isChangeMade = false;

    if (user.emailAddress != emailAddress) {
      //only normal email accounts should be able to change email address
      if (user.provider !== "email") {
        return {
          stat: false,
          message: "password change is not available for social account",
        };
      }

      isChangeMade = true;

      //check if email exist....
      const check = await getUser({ emailAddress });
      if (check) return { stat: false, message: "Email address already exist" };
    }

    if (user.firstName != firstName) isChangeMade = true;
    if (user.lastName != lastName) isChangeMade = true;

    if (isChangeMade) {
      await db.query(
        `UPDATE user set emailAddress = ?, firstName = ?, lastName = ? WHERE user_uuid = ?`,
        [emailAddress, firstName, lastName, user_uuid]
      );

      return { stat: true, message: "User updated" };
    }

    return { stat: true, message: "No row affected" };
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function changePassword(
  user_uuid: string,
  params: ChangePassword["body"]
) {
  const { newPassword, oldPassword } = params;

  try {
    const user = await getUser({ user_uuid }, false);
    if (!user) return { stat: false, message: "not found" };

    if (user.user_uuid !== user_uuid) return { stat: false, message: "denied" };

    //only users with normal email login can change password
    if (user.provider !== "email") {
      return {
        stat: false,
        message: "password change is not available for social account",
      };
    }

    const isPasswordCorrect = await bcryptjs.compare(
      oldPassword,
      user.password
    );
    if (!isPasswordCorrect) return { stat: false, message: "wrong password" };

    const hashedPassword = await hashPassword(newPassword);

    await db.query(`UPDATE user set password = ? WHERE user_uuid = ?`, [
      hashedPassword,
      user_uuid,
    ]);

    return { stat: true, message: "Password changed" };
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function resetPassword(
  passwordResetToken: string,
  params: ResetPassword["body"]
) {
  if (!passwordResetToken) return { stat: false, message: "token missing" };

  const { password } = params;

  try {
    const user = await getUser({ passwordResetToken });
    if (!user) return { stat: false, message: "invalid token" }; //invalid reset token

    //only normal email account can reset password
    if (user.provider !== "email") {
      return {
        stat: false,
        message: "password change is not available for social account",
      }; //how did you even get here...hmm
    }

    //check if token is expired
    const expiryTime = new Date(user.passwordResetTokenExpiry).getTime();
    const currentTime = new Date().getTime();

    if (currentTime >= expiryTime) {
      return { stat: false, message: "expired token" };
    }

    const hashedPassword = await hashPassword(password);

    await db.query(
      `UPDATE user set password = ?, passwordResetToken = ?, passwordResetTokenExpiry = ? WHERE user_uuid = ?`,
      [hashedPassword, null, null, user.user_uuid]
    );

    return { stat: true, message: "Password changed" };
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function sendPasswordResetMail(emailAddress: string) {
  try {
    const user = await getUser({ emailAddress });
    if (!user) return { stat: false, message: "user not found" }; //invalid reset token

    //only normal email account can reset password
    if (user.provider !== "email") {
      return {
        stat: false,
        message: "password change is not available for social account",
      };
    }

    let token;

    if (user.passwordResetToken) {
      //there is a reset token already
      //check if it is expired
      const expiryTime = new Date(user.passwordResetTokenExpiry).getTime();
      const currentTime = new Date().getTime();

      if (currentTime >= expiryTime) {
        //expired..
        //create new token and update the db!
        token = generateRandomString(20);

        await db.query(
          `UPDATE user set passwordResetToken = ?, passwordResetTokenExpiry = ? WHERE user_uuid = ?`,
          [
            token,
            new Date(Date.now() + config.passwordResetTokenValidity),
            user.user_uuid,
          ]
        );
      } else token = user.passwordResetToken;
    } else {
      //create a new token and update the db!
      token = generateRandomString(20);

      await db.query(
        `UPDATE user set passwordResetToken = ?, passwordResetTokenExpiry = ? WHERE user_uuid = ?`,
        [
          token,
          new Date(Date.now() + config.passwordResetTokenValidity),
          user.user_uuid,
        ]
      );
    }

    if (token) {
      //send email here
      const link = `${config.client_url}/reset-password/${token}`;
      const body = `Click on this link to reset password: <a href="${link}">${link}</a>`;

      const mailSent = await sendMail({
        receiver: emailAddress,
        subject: "CMS::Password Recovery Email",
        html: body,
      });

      if (mailSent) {
        return {
          stat: true,
          message: "Password reset email sent successfully",
        };
      }

      return { stat: false, message: "Unable to send password reset email" };
    }

    return { stat: false, message: "Unable to complete the operation" };
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function getOrCreateUserFromSocialProvider(
  providerUserId: string,
  firstName: string,
  lastName: string,
  profileImageURL: string | null,
  emailAddress: string,
  provider: "google" | "twitter" | "facebook" | "email"
) {
  try {
    const output: { user: any; error?: string } = {
      user: null,
      error: undefined,
    };

    //check if email address already exist...
    const isUserAlreadyRegistered = await getUser({ providerUserId });
    if (isUserAlreadyRegistered) {
      //there is a user with this providerUserId......valid
      output.user = isUserAlreadyRegistered;

      return output;
    }

    //trying to register a new user
    //check if the email address is not used to create another account
    const doesEmailExist = await getUser({ emailAddress });
    if (doesEmailExist) {
      output.error = `This email is already linked to a user with a ${doesEmailExist.provider} account`;

      return output;
    }

    //just proceed to registering the user...
    const response = await db.query<ResultSetHeader>(
      `
    INSERT INTO user (emailAddress, firstName, lastName, provider, providerUserId, profileImageURL, user_uuid)
    VALUES (?, ?, ?, ?, ?)
    `,
      [
        emailAddress,
        firstName,
        lastName,
        provider,
        providerUserId,
        profileImageURL,
        `${provider}_user_${generateRandomString(10)}`,
      ]
    );

    const user = await getUser({ id: response[0].insertId });
    output.user = user;

    broadcastEvent({
      target: "user",
      action: "create",
      data: {
        id: response[0].insertId,
        user_uuid: user!.user_uuid,
        provider,
      },
    });

    return output;
  } catch (e: any) {
    throw new Error(e);
  }
}
