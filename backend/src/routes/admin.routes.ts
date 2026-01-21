import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireSuperAdmin } from "../middlewares/super-admin.middleware";
import { getDashboardMetrics } from "../controllers/admin-dashboard.controller";
import tenantRoutes from "./tenant.routes";
import featureRoutes from "./feature.routes";

const router = Router();

// All admin routes require authentication and super admin role
router.use(authenticate);
router.use(requireSuperAdmin);

// Dashboard
router.get("/dashboard/metrics", getDashboardMetrics);

// Sub-routes
router.use("/tenants", tenantRoutes);
router.use("/features", featureRoutes);

export default router;
