import { RowDataPacket } from "mysql2";
import { config } from "../config";
import log from "./logger";

const db = config.db;

export async function getUsersCount(): Promise<number> {
  try {
    const [row] = await db.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS totalUsers from user`
    );

    const totalUsers = row[0].totalUsers;

    return totalUsers;
  } catch (e: any) {
    log.error(e);

    return 0;
  }
}
