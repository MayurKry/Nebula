import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireSuperAdmin } from "../middlewares/super-admin.middleware";
import * as tenantController from "../controllers/tenant.controller";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Public tenant routes (available to any authenticated user/tenant owner)
router.post("/switch-plan", tenantController.switchPlan);

// Super Admin restricted routes
router.use(requireSuperAdmin);

// Tenant management
router.get("/", tenantController.listTenants);
router.post("/", tenantController.createTenant);
router.get("/:id", tenantController.getTenantById);
router.patch("/:id", tenantController.updateTenant);

// Tenant status management
router.post("/:id/suspend", tenantController.suspendTenant);
router.post("/:id/activate", tenantController.activateTenant);

// Plan management
router.post("/:id/assign-plan", tenantController.assignCustomPlan);

// Credit management
router.post("/:id/credits/grant", tenantController.grantCredits);
router.post("/:id/credits/deduct", tenantController.deductCredits);
router.get("/:id/credits/transactions", tenantController.getCreditTransactions);

// Feature overrides
router.post("/:id/features/add", tenantController.addFeatureOverride);
router.post("/:id/features/remove", tenantController.removeFeatureOverride);

export default router;
