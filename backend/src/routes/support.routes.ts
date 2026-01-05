import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    submitFeedback
} from "../controllers/support.controller";

const router = Router();

// Notifications
router.get("/notifications", authenticate, getNotifications);
router.put("/notifications/:id/read", authenticate, markNotificationRead);
router.put("/notifications/read-all", authenticate, markAllNotificationsRead);

// Feedback
router.post("/feedback", authenticate, submitFeedback);

export default router;
