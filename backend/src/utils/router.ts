import express from "express";

import userRoutes from "../routes/user.routes";
import categoryRoutes from "../routes/category.routes";
import postRoutes from "../routes/post.routes";
import sessionRoutes from "../routes/session.routes";

const router = express.Router();

router.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(200);

  next();
});

router.use("/user", userRoutes);
router.use("/category", categoryRoutes);
router.use("/post", postRoutes);
router.use("/session", sessionRoutes);

router.get("/healthcheck", (_, res) => res.sendStatus(200));

export = router;
