import express from "express";
import sessionController from "../controllers/session.conntroller";
import protectRoute from "../middleware/protectRoute";

const router = express.Router();

router.get("/", protectRoute, sessionController.getSessionsHandler);
router.delete("/", protectRoute, sessionController.deleteSessionHandler);

export = router;
