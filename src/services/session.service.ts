import { get } from "lodash";
import { config } from "../config";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { signJWT, verifyJWT } from "../utils/jwt.utils";
import { getUser } from "./user.service";

const db = config.db;

export async function createSession(user_uuid: string, userAgent: string) {
  try {
    const response = await db.query<ResultSetHeader>(
      `
    INSERT INTO session (user_uuid, userAgent)
    VALUES (?, ?)
    `,
      [user_uuid, userAgent]
    );

    const session = await getSession(response[0].insertId);

    return session;
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function getSession(id: number) {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT * FROM session WHERE id = ?`,
      [id]
    );

    const session = rows[0];

    if (!session || Object.keys(session).length === 0) return undefined;

    return session;
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function getSessions(user_uuid: string) {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT * FROM session WHERE user_uuid = ?`,
      [user_uuid]
    );

    return rows;
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function deleteSession(id: number) {
  try {
    const response = await db.query<ResultSetHeader>(
      `DELETE FROM session WHERE id = ?`,
      [id]
    );

    return response[0].affectedRows >= 1; //returning false means the id was not found
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function reIssueAccessToken(refreshToken: string) {
  const { decoded } = verifyJWT(refreshToken);

  if (!decoded || !get(decoded, "session")) return false;

  const session = await getSession(get(decoded, "session"));
  if (!session) return false; //not found

  const user = await getUser({ user_uuid: session.user_uuid });
  if (!user) return false; //not found

  const accessToken = signJWT(
    { user_uuid: user.user_uuid, session: session.id },
    { expiresIn: config.accessTokenToLive }
  );

  return accessToken;
}
