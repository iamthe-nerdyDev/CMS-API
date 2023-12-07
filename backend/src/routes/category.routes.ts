import express from "express";
import validate from "../middleware/validateSchema";
import controller from "../controllers/category.controller";
import {
  createCategorySchema,
  deleteCategorySchema,
  editCategorySchema,
  getCategorySchema,
} from "../schema/category.schema";

const router = express.Router();

router.get("/", controller.getCategoriesHandler);

router.get(
  "/:param",
  validate(getCategorySchema),
  controller.getCategoryHandler
);

router.post(
  "/",
  validate(createCategorySchema),
  controller.createCategoryHandler
);

router.put(
  "/:categoryId",
  validate(editCategorySchema),
  controller.editCategoryHandler
);

router.delete(
  "/:categoryId",
  validate(deleteCategorySchema),
  controller.deleteCategoryHandler
);

export = router;
