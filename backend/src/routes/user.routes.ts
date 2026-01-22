import { Router } from "express";
import { getProfile, updateProfile, changePassword } from "../controllers/user.controller";
import { getActivityLog } from "../controllers/activity.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/change-password", changePassword);
router.get("/activity-log", getActivityLog);

export default router;
