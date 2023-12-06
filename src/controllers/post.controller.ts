import { Request, Response } from "express";

import {
  CreatePost,
  DeletePost,
  EditPost,
  GetPost,
  GetPosts,
} from "../schema/post.schema";

import {
  createPost,
  deletePost,
  editPost,
  getPost,
  getPosts,
} from "../services/post.service";

import log from "../utils/logger";

async function createPostHandler(
  req: Request<{}, {}, CreatePost["body"]>,
  res: Response
) {
  const { user_uuid } = res.locals.user;

  try {
    const post = await createPost(user_uuid, req.body);

    if (!post) return res.sendStatus(500); //for one reason or the other its returning undefined

    return res.status(201).json({ status: true, data: post });
  } catch (e: any) {
    log.error(e);
    return res.status(500).send(e.message);
  }
}

async function editPostHandler(
  req: Request<EditPost["params"], {}, EditPost["body"]>,
  res: Response
) {
  const { user_uuid } = res.locals.user;
  const postId = parseInt(req.params.postId);

  if (isNaN(postId)) return res.sendStatus(400);

  try {
    const response = await editPost(postId, user_uuid, req.body);

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

async function deletePostHandler(
  req: Request<DeletePost["params"]>,
  res: Response
) {
  const { user_uuid } = res.locals.user;
  const postId = parseInt(req.params.postId);

  if (isNaN(postId)) return res.sendStatus(400);

  try {
    const response = await deletePost(user_uuid, postId);

    if (!response) return res.sendStatus(409);

    return res.status(201).json({ status: true });
  } catch (e: any) {
    log.error(e);
    return res.status(500).send(e.message);
  }
}

async function getPostHandler(req: Request<GetPost["params"]>, res: Response) {
  const { param } = req.params;

  try {
    const post = await getPost({
      slug: param,
      id: !isNaN(parseInt(param)) ? parseInt(param) : undefined,
    });

    if (!post) return res.sendStatus(404);

    return res.status(200).json({ status: true, data: post });
  } catch (e: any) {
    log.error(e);
    return res.status(500).send(e.message);
  }
}

async function getPostsHandler(
  req: Request<GetPosts["params"]>,
  res: Response
) {
  let { limit, page } = req.query;
  const { param } = req.params;

  let _limit = limit ? parseInt(limit as string) : 10;
  let _page = page ? parseInt(page as string) : 1;

  try {
    const posts = await getPosts(
      _limit,
      _page,
      param
        ? {
            user_uuid: param,
            categoryId: !isNaN(parseInt(param)) ? parseInt(param) : undefined,
          }
        : undefined
    );

    return res.status(200).json({ status: true, data: posts });
  } catch (e: any) {
    log.error(e);
    return res.status(500).send(e.message);
  }
}

export default {
  createPostHandler,
  editPostHandler,
  deletePostHandler,
  getPostHandler,
  getPostsHandler,
};
