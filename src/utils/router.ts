import express from "express";

import userRoutes from "../routes/user.routes";
import categoryRoutes from "../routes/category.routes";
import postRoutes from "../routes/post.routes";

const router = express.Router();

router.use("/user", userRoutes);
router.use("/category", categoryRoutes);
router.use("/post", postRoutes);

export = router;
