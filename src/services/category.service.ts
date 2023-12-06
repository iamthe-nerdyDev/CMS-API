import { ResultSetHeader, RowDataPacket } from "mysql2";
import { config } from "../config";
import { generateRandomString, stringToSlug } from "../utils/helper";
import { getCategoriesCount } from "../utils/counter";

const db = config.db;

export async function createCategory(name: string) {
  let slug = stringToSlug(name);

  try {
    const doesSlugExist = await getCategory(slug);
    if (doesSlugExist) slug = `${slug}-${generateRandomString()}`;

    const response = await db.query<ResultSetHeader>(
      `
    INSERT INTO category (name, slug)
    VALUES (?, ?)
    `,
      [name, slug]
    );

    const category = await getCategory(response[0].insertId);

    return category;
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function editCategory(id: number, name: string) {
  try {
    const doesIdExist = await getCategory(id);
    if (!doesIdExist) return { stat: false, message: "not found" };

    if (name != doesIdExist.name) {
      let slug = stringToSlug(name);

      const doesSlugExist = await getCategory(slug);
      if (doesSlugExist) slug = `${slug}-${generateRandomString()}`;

      await db.query(`UPDATE category SET name = ?, slug = ? WHERE id = ?`, [
        name,
        slug,
        id,
      ]);

      return { stat: true, message: "Category updated" };
    }

    return { stat: true, message: "No row affected" };
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function deleteCategory(id: number) {
  try {
    const response = await db.query<ResultSetHeader>(
      `DELETE FROM category WHERE id = ?`,
      [id]
    );

    return response[0].affectedRows >= 1;
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function getCategory(param: number | string) {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT * FROM category WHERE id = ? OR slug = ? LIMIT 1`,
      [param, param]
    );

    const category = rows[0];

    if (!category || Object.keys(category).length === 0) return undefined;

    return category;
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function getCategories(limit: number, page: number) {
  const skip = (page - 1) * limit;

  try {
    const total = await getCategoriesCount();

    if (total <= 0) return { page, limit, total, data: null };

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT * FROM user ORDER BY createdAt DESC LIMIT ?, ?`,
      [skip, limit]
    );

    return { page, limit, total, data: rows };
  } catch (e: any) {
    throw new Error(e);
  }
}
