import { ResultSetHeader, RowDataPacket } from "mysql2";
import { config } from "../config";
import { getPostsCount } from "../utils/counter";
import { CreatePost, EditPost } from "../schema/post.schema";
import { generateRandomString, stringToSlug } from "../utils/helper";
import { isArray } from "lodash";
import { getCategory } from "./category.service";
import { getUser } from "./user.service";

const db = config.db;

export async function createPost(user_uuid: string, data: CreatePost["body"]) {
  try {
    let slug = stringToSlug(data.title);

    const doesSlugExist = await getPost({ slug });
    if (doesSlugExist) slug = `${slug}-${generateRandomString()}`;

    const response = await db.query<ResultSetHeader>(
      `
      INSERT INTO post (title, slug, uuid, categoryId, featuredImageURL, body) 
      VALUES(?, ?, ?, ?, ?, ?)
      `,
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
    if (!post) return { stat: false, message: "not found" };

    if (post.user_uuid !== user_uuid) return { stat: false, message: "denied" }; //don't have access to delete it

    const response = await db.query<ResultSetHeader>(
      `DELETE FROM post WHERE id = ?`,
      [id]
    );

    return {
      stat: true,
      message:
        response[0].affectedRows >= 1 ? "Post deleted" : "No row affected",
    };
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function getPost(
  data: { slug?: string; id?: number },
  populate: boolean = false
) {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT * FROM post WHERE slug = ? OR id = ? LIMIT 1`,
      [data.slug, data.id]
    );

    const post = rows[0];

    if (!post || Object.keys(post).length === 0) return undefined;

    if (populate) return populatePost(post);
    else return post;
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function getPosts(
  limit: number,
  page: number,
  param?: { user_uuid?: string; categoryId?: number },
  populate: boolean = false
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

    return { page, limit, total, data: populate ? populatePost(rows) : rows };
  } catch (e: any) {
    throw new Error(e);
  }
}

async function populatePost(post: any) {
  if (!post) return post;

  if (isArray(post)) {
    post.map(async (_post) => {
      _post.categoryId = await getCategory({ id: _post.categoryId as number });
      _post.user_uuid = await getUser({ user_uuid: _post.user_uuid as string });
    });
  } else {
    post.categoryId = await getCategory({ id: post.categoryId as number });
    post.user_uuid = await getUser({ user_uuid: post.user_uuid as string });
  }

  return post;
}
