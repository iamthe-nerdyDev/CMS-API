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
import protectRoute from "../middleware/protectRoute";
import passport from "passport";

const router = express.Router();

router.get("/:user_uuid", validate(getUserSchema), controller.getUserHanlder);

router.get("/", controller.getUsersHanlder);

router.post(
  "/register",
  validate(createUserSchema),
  controller.createUserHanlder
);

router.put(
  "/edit-user",
  [protectRoute, validate(editUserSchema)],
  controller.editUserHanlder
);

router.patch(
  "/change-password",
  [protectRoute, validate(changePasswordSchema)],
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

//facebook social login routes
router.get(
  "/login/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);
router.get("/login/callback/facebook");

//twitter social login routes
router.get("/login/twitter", passport.authenticate("twitter"));
router.get("/login/callback/twitter");

//google social login route
router.get(
  "/login/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get("/login/callback/google");

//normal login
router.post("/login");

export = router;
