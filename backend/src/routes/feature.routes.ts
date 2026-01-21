import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireSuperAdmin } from "../middlewares/super-admin.middleware";
import * as featureController from "../controllers/feature.controller";

const router = Router();

// All routes require authentication and super admin role
router.use(authenticate);
router.use(requireSuperAdmin);

// Feature management
router.get("/", featureController.getAllFeatures);
router.post("/:featureId/toggle", featureController.toggleGlobalFeature);
router.get("/check", featureController.checkFeatureAccess);

export default router;
