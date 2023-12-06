import { Request, Response } from "express";

import {
  CreateCategory,
  DeleteCategory,
  EditCategory,
  GetCategory,
} from "../schema/category.schema";

import {
  createCategory,
  deleteCategory,
  editCategory,
  getCategories,
  getCategory,
} from "../services/category.service";

import log from "../utils/logger";

async function createCategoryHandler(
  req: Request<{}, {}, CreateCategory["body"]>,
  res: Response
) {
  try {
    const response = await createCategory(req.body.name);

    return res.status(201).json({ status: true, data: response });
  } catch (e: any) {
    log.error(e);
    return res.status(500).send(e.message);
  }
}

async function editCategoryHandler(
  req: Request<EditCategory["params"], {}, EditCategory["body"]>,
  res: Response
) {
  try {
    const response = await editCategory(req.params.categoryId, req.body.name);

    if (!response.stat) {
      if (response.message == "not found") return res.sendStatus(404);

      return res.status(409).send(response.message);
    }

    return res.status(201).json({ status: true, message: response.message });
  } catch (e: any) {
    log.error(e);
    return res.status(500).send(e.message);
  }
}

async function getCategoryHandler(
  req: Request<GetCategory["params"]>,
  res: Response
) {
  const { param } = req.params;

  try {
    const category = await getCategory(param);

    if (!category) return res.sendStatus(404);

    return res.status(200).json({ status: true, data: category });
  } catch (e: any) {
    log.error(e);
    return res.status(500).send(e.message);
  }
}

async function getCategoriesHandler(req: Request, res: Response) {
  let { limit, page } = req.query;

  let _limit = limit ? parseInt(limit as string) : 10;
  let _page = page ? parseInt(page as string) : 1;

  try {
    const categories = await getCategories(_limit, _page);

    return res.status(200).json({ status: true, data: categories });
  } catch (e: any) {
    log.error(e);
    return res.status(500).send(e.message);
  }
}

async function deleteCategoryHandler(
  req: Request<DeleteCategory["params"]>,
  res: Response
) {
  const { categoryId } = req.params;

  try {
    const response = await deleteCategory(categoryId);

    if (!response) return res.sendStatus(409);

    return res.status(201).json({ status: true });
  } catch (e: any) {
    log.error(e);
    return res.status(500).send(e.message);
  }
}

export default {
  createCategoryHandler,
  editCategoryHandler,
  getCategoryHandler,
  getCategoriesHandler,
  deleteCategoryHandler,
};
