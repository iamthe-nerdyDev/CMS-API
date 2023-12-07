import { ResultSetHeader, RowDataPacket } from "mysql2";
import { config } from "../config";
import { generateRandomString, stringToSlug } from "../utils/helper";
import { getCategoriesCount } from "../utils/counter";

const db = config.db;
const fallback_categoryId = 1; //fallback categoryId: Uncategorized

export async function createCategory(name: string) {
  let slug = stringToSlug(name);

  try {
    const doesSlugExist = await getCategory({ slug });
    if (doesSlugExist) slug = `${slug}-${generateRandomString()}`;

    const response = await db.query<ResultSetHeader>(
      `
    INSERT INTO category (name, slug)
    VALUES (?, ?)
    `,
      [name, slug]
    );

    const category = await getCategory({ id: response[0].insertId });

    return category;
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function editCategory(id: number, name: string) {
  try {
    const isCategoryIDValid = await getCategory({ id });
    if (!isCategoryIDValid) return { stat: false, message: "not found" };

    if (name != isCategoryIDValid.name) {
      let slug = stringToSlug(name);

      const doesSlugExist = await getCategory({ slug });
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
  if (id === fallback_categoryId) return false; //disable deletion of fallback category

  try {
    const response = await db.query<ResultSetHeader>(
      `DELETE FROM category WHERE id = ?`,
      [id]
    );

    //set all post with the deleted categoryId to the fallback categoryId i.e 1
    await db.query(`UPDATE post SET categoryId = ? WHERE categoryId = ?`, [
      fallback_categoryId,
      id,
    ]);

    return response[0].affectedRows >= 1;
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function getCategory(data: { slug?: string; id?: number }) {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT * FROM category WHERE id = ? OR slug = ? LIMIT 1`,
      [data.id, data.slug]
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
      `SELECT * FROM category ORDER BY createdAt DESC LIMIT ?, ?`,
      [skip, limit]
    );

    return { page, limit, total, data: rows };
  } catch (e: any) {
    throw new Error(e);
  }
}
