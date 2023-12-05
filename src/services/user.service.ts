import bcryptjs from "bcryptjs";
import { config } from "../config";
import { CreateUser } from "../schema/user.schema";
import { customAlphabet } from "nanoid";
import { ResultSetHeader } from "mysql2";

const db = config.db;

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);

export async function createUser(param: CreateUser["body"]) {
  const { emailAddress, firstName, lastName, password } = param;

  const salt = await bcryptjs.genSalt(config.saltWorkFactor);
  const hashedPassword = await bcryptjs.hash(password, salt);

  try {
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

    const _id = response[0].insertId;
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function getUser() {}
