import express from "express";

import userRoutes from "../routes/user.routes";
import categoryRoutes from "../routes/category.routes";

const router = express.Router();

router.use("/user", userRoutes);
router.use("/category", categoryRoutes);

export = router;
