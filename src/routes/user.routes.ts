import express from "express";
import validate from "../middleware/validateSchema";
import controller from "../controllers/user.controller";
import {
  changePasswordSchema,
  createUserSchema,
  editUserSchema,
  forgotPasswordSchema,
  getUserSchema,
  resetPasswordSchema,
} from "../schema/user.schema";

const router = express.Router();

router.get("/:user_uuid", validate(getUserSchema), controller.getUserHanlder);

router.get("/", controller.getUsersHanlder);

router.post(
  "/register",
  validate(createUserSchema),
  controller.createUserHanlder
);
router.put("/:user_uuid", validate(editUserSchema), controller.editUserHanlder);

router.patch(
  "/change-password",
  validate(changePasswordSchema),
  controller.changePasswordHanlder
);

router.patch(
  "/forgot-password",
  validate(forgotPasswordSchema),
  controller.forgotPasswordHanlder
);

router.put(
  "/reset-password/:passwordResetToken",
  validate(resetPasswordSchema),
  controller.resetPasswordHanlder
);

export = router;
