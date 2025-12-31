import { Router } from "express";
import { getUser, createUser } from "../controllers/user.controller";
import { getActivityLog } from "../controllers/activity.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/getUser", authenticate, getUser);
router.post("/create", createUser);
router.get("/activity-log", authenticate, getActivityLog);

export default router;
