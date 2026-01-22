import { Router } from "express";
import { authenticate, requireSuperAdmin } from "../middlewares/auth.middleware";
import * as ObservabilityController from "../controllers/admin-observability.controller";

const router = Router();

// Protect all routes
router.use(authenticate, requireSuperAdmin);

// Analytics
router.get("/analytics/usage", ObservabilityController.getUsageAnalytics);
router.get("/system-health", ObservabilityController.getSystemStatus);

// Logs
router.get("/logs/generations", ObservabilityController.getGenerationLogs);
router.get("/logs/errors", ObservabilityController.getErrorLogs);

// Campaign Oversight
router.get("/campaigns", ObservabilityController.listCampaigns);
router.post("/campaigns/:id/stop", ObservabilityController.forceStopCampaign);

// Support
router.get("/support/timeline", ObservabilityController.getSupportTimelines);

export default router;
