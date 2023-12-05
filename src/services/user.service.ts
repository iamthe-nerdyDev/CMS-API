import bcryptjs from "bcryptjs";
import { config } from "../config";
import { CreateUser } from "../schema/user.schema";
import { customAlphabet } from "nanoid";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { omit } from "lodash";
import { GetUserFn } from "../interface";
import { getUsersCount } from "../utils/counter";

const db = config.db;

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);

export async function createUser(param: CreateUser["body"]) {
  const { emailAddress, firstName, lastName, password } = param;

  const salt = await bcryptjs.genSalt(config.saltWorkFactor);
  const hashedPassword = await bcryptjs.hash(password, salt);

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
        `email_user_${nanoid()}`,
      ]
    );

    const user = await getUser({ id: response[0].insertId });

    return user;
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function getUser(data: GetUserFn) {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT * FROM user WHERE user_uuid = ? OR id = ? OR emailAddress = ?`,
      [data.user_uuid, data.id, data.emailAddress]
    );

    const _user = rows[0];

    if (!_user || Object.keys(_user).length === 0) return undefined;

    return omit(_user, "password"); //remove the password from the response
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
