import { object, string, TypeOf } from "zod";

const payload = {
  body: object({
    categoryId: string({
      required_error: "categoryId is required",
    }),
    title: string({
      required_error: "title is required",
    }),
    featuredImageURL: string({
      required_error: "featuredImageURL is required",
    }),
    body: string({
      required_error: "body is required",
    }),
  }),
};

const params = {
  params: object({
    postId: string({
      required_error: "post id is required",
    }),
  }),
};

export const createPostSchema = object({ ...payload });

export const editPostSchema = object({ ...payload, ...params });

export const deletePostSchema = object({ ...params });

export const getPostSchema = object({
  params: object({
    param: string({
      required_error: "postId or slug is required",
    }),
  }),
});

export type CreatePost = TypeOf<typeof createPostSchema>;
export type EditPost = TypeOf<typeof editPostSchema>;
export type DeletePost = TypeOf<typeof deletePostSchema>;
export type GetPost = TypeOf<typeof getPostSchema>;
