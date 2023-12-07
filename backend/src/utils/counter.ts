import { RowDataPacket } from "mysql2";
import { config } from "../config";
import log from "./logger";

const db = config.db;

export async function getUsersCount(): Promise<number> {
  try {
    const [row] = await db.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS totalUsers FROM user`
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
      `SELECT COUNT(*) AS totalCategories FROM category`
    );

    return row[0].totalCategories;
  } catch (e: any) {
    log.error(e);

    return 0;
  }
}

export async function getPostsCount(param?: {
  user_uuid?: string;
  categoryId?: number;
}): Promise<number> {
  try {
    if (param) {
      const [row] = await db.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS totalPosts FROM post WHERE user_uuid = ? OR categoryId = ?`,
        [param.user_uuid, param.categoryId]
      );

      return row[0].totalPosts;
    }

    const [row] = await db.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS totalPosts FROM post`
    );

    return row[0].totalPosts;
  } catch (e: any) {
    log.error(e);

    return 0;
  }
}
