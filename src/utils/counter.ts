import { RowDataPacket } from "mysql2";
import { config } from "../config";
import log from "./logger";

const db = config.db;

export async function getUsersCount(): Promise<number> {
  try {
    const [row] = await db.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS totalUsers from user`
    );

    return row[0].totalUsers;
  } catch (e: any) {
    log.error(e);

    return 0;
  }
}

export async function getCategoriesCount(): Promise<number> {
  try {
    const [row] = await db.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS totalCategories from category`
    );

    return row[0].totalCategories;
  } catch (e: any) {
    log.error(e);

    return 0;
  }
}
