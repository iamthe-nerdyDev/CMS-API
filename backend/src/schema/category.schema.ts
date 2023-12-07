import { object, string, TypeOf } from "zod";

const payload = {
  body: object({
    name: string({ required_error: "Category name is required" }),
  }),
};

const params = {
  params: object({
    categoryId: string({ required_error: "categoryId is required" }),
  }),
};

export const createCategorySchema = object({ ...payload });

export const editCategorySchema = object({ ...payload, ...params });

export const getCategorySchema = object({
  params: object({
    param: string({ required_error: "categoryId or slug is required" }),
  }),
});

export const deleteCategorySchema = object({ ...params });

export type CreateCategory = TypeOf<typeof createCategorySchema>;
export type EditCategory = TypeOf<typeof editCategorySchema>;
export type GetCategory = TypeOf<typeof getCategorySchema>;
export type DeleteCategory = TypeOf<typeof deleteCategorySchema>;
