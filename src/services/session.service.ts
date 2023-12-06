import { get } from "lodash";
import { config } from "../config";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { signJWT, verifyJWT } from "../utils/jwt.utils";

const db = config.db;

export async function createSession(user_uuid: string, userAgent?: string) {
  try {
    const response = await db.query<ResultSetHeader>(
      `
    INSERT INTO session (user_uuid, userAgent)
    VALUES (?, ?)
    `,
      [user_uuid, userAgent ?? null]
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

export async function deleteSession(id: number, user_uuid: string) {
  try {
    const session = await getSession(id);
    if (!session) return false;

    if (session.user_uuid !== user_uuid) return false; //trying to delete another niggas shit!

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

  if (!decoded || !get(decoded, "session") || !get(decoded, "user_uuid")) {
    return false;
  }

  const session = await getSession(get(decoded, "session"));
  if (!session) return false; //not found

  if (get(decoded, "user_uuid") !== session.user_uuid) return false; //something is just wrong over here, wrong user_uuid somewhere

  const accessToken = signJWT(
    { user_uuid: session.user_uuid, session: session.id },
    { expiresIn: config.accessTokenToLive }
  );

  return accessToken;
}
