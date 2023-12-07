import express from "express";
import validate from "../middleware/validateSchema";
import controller from "../controllers/post.controller";
import {
  createPostSchema,
  deletePostSchema,
  editPostSchema,
  getPostSchema,
} from "../schema/post.schema";
import protectRoute from "../middleware/protectRoute";

const router = express.Router();

router.get("/", controller.getPostsHandler);
router.get("/:param", validate(getPostSchema), controller.getPostsHandler); //user_uuid or categoryId
router.get(
  "/single/:param",
  validate(getPostSchema),
  controller.getPostHandler
); //slug or postId

router.post(
  "/",
  [protectRoute, validate(createPostSchema)],
  controller.createPostHandler
);

router.put(
  "/:postId",
  [protectRoute, validate(editPostSchema)],
  controller.editPostHandler
);

router.delete(
  "/:postId",
  [protectRoute, validate(deletePostSchema)],
  controller.deletePostHandler
);

export = router;
