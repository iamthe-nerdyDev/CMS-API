import { ResultSetHeader, RowDataPacket } from "mysql2";
import { config } from "../config";
import { getPostsCount } from "../utils/counter";
import { GetPostFn } from "../interface";
import { CreatePost, EditPost } from "../schema/post.schema";
import { generateRandomString, stringToSlug } from "../utils/helper";

const db = config.db;

export async function createPost(user_uuid: string, data: CreatePost["body"]) {
  try {
    let slug = stringToSlug(data.title);

    const doesSlugExist = await getPost({ slug });
    if (doesSlugExist) slug = `${slug}-${generateRandomString()}`;

    const response = await db.query<ResultSetHeader>(
      `INSERT INTO post (title, slug, uuid, categoryId, featuredImageURL, body) VALUES(?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        slug,
        user_uuid,
        data.categoryId,
        data.featuredImageURL,
        data.body,
      ]
    );

    const post = await getPost({ id: response[0].insertId });

    return post;
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function editPost(
  id: number,
  user_uuid: string,
  data: EditPost["body"]
) {
  try {
    const post = await getPost({ id });
    if (!post) return { stat: false, message: "not found" };

    if (post.user_uuid !== user_uuid) return { stat: false, message: "denied" }; //don't have access to edit it

    let isChangeMade = false;

    let slug = post.slug; //set inital value of slug to db slug

    if (post.title !== data.title) {
      isChangeMade = true;

      //get a new slug
      slug = stringToSlug(data.title);

      const doesSlugExist = await getPost({ slug });
      if (doesSlugExist) slug = `${slug}-${generateRandomString()}`;
    }

    if (post.categoryId !== data.categoryId) isChangeMade = true;
    if (post.featuredImageURL !== data.featuredImageURL) isChangeMade = true;
    if (post.body !== data.body) isChangeMade = true;

    if (!isChangeMade) return { stat: true, message: "No row affected" };

    await db.query(
      `UPDATE post SET title = ?, slug = ?, categoryId = ?, featuredImageURL = ?, body = ? WHERE id = ? AND user_uuid = ?`,
      [
        data.title,
        slug,
        data.categoryId,
        data.featuredImageURL,
        data.body,
        id,
        user_uuid,
      ]
    );

    return { stat: true, message: "Post updated" };
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function deletePost(user_uuid: string, id: number) {
  try {
    const post = await getPost({ id });
    if (!post) return false;

    if (post.user_uuid !== user_uuid) return false; //don't have access to delete it

    const response = await db.query<ResultSetHeader>(
      `DELETE FROM post WHERE id = ?`,
      [id]
    );

    return response[0].affectedRows >= 1;
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function getPost(data: GetPostFn) {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT * FROM post WHERE slug = ? OR id = LIMIT 1`,
      [data.slug, data.id]
    );

    const post = rows[0];

    if (!post || Object.keys(post).length === 0) return undefined;

    return post;
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function getPosts(
  limit: number,
  page: number,
  param?: { user_uuid?: string; categoryId?: number }
) {
  const skip = (page - 1) * limit;

  try {
    const total = await getPostsCount(param);

    if (total <= 0) return { page, limit, total, data: null };

    if (param) {
      //for getting posts under user or category
      const [rows] = await db.query<RowDataPacket[]>(
        `SELECT * FROM post WHERE user_uuid = ? OR categoryId = ? ORDER BY createdAt DESC LIMIT ?, ?`,
        [param.user_uuid, param.categoryId, skip, limit]
      );

      return { page, limit, total, data: rows };
    }

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT * FROM post ORDER BY createdAt DESC LIMIT ?, ?`,
      [skip, limit]
    );

    return { page, limit, total, data: rows };
  } catch (e: any) {
    throw new Error(e);
  }
}
