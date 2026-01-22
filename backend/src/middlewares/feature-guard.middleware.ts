import { Request, Response, NextFunction } from "express";
import { FeatureId } from "../constants/feature-constants";
import { SystemFeatureModel } from "../models/system-feature.model";
import { SYSTEM_PLANS } from "../constants/plan-constants";

/**
 * Middleware to check if a feature is enabled for the current tenant
 */
export const requireFeature = (feature: FeatureId) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenant: any = (req as any).tenant;
            const user: any = (req as any).user;

            // Super admins bypass all checks (mostly)
            if (user?.role === 'super_admin') {
                return next();
            }

            // 1. Check Global Kill Switch (System Feature)
            // We use a cache-first approach or fast DB query
            const systemFeature = await SystemFeatureModel.findOne({ featureId: feature });
            if (systemFeature && !systemFeature.isGloballyEnabled) {
                return res.status(503).json({
                    message: `Feature '${feature}' is temporarily disabled for maintenance.`
                });
            }

            if (!tenant) {
                return res.status(403).json({ message: "No tenant context found." });
            }

            // 2. Check Tenant Overrides (Allow)
            if (tenant.featureOverrides && tenant.featureOverrides.includes(feature)) {
                return next();
            }

            // 3. Check Plan Definition
            const planId = tenant.plan.id;
            let allowedFeatures: string[] = [];

            if (tenant.plan.isCustom) {
                // Custom plan features are explicit in customLimits
                allowedFeatures = tenant.plan.customLimits?.features || [];
            } else {
                // System plans
                // Access the plan definition using the planId as key
                // We need to cast or ensure planId is a valid key, default to FREE if not
                const planDef = SYSTEM_PLANS[planId as keyof typeof SYSTEM_PLANS] || SYSTEM_PLANS.FREE;
                allowedFeatures = (planDef.features as unknown) as string[] || [];
            }

            // 'all' keyword support
            if (allowedFeatures.includes('all') || allowedFeatures.includes(feature)) {
                return next();
            }

            return res.status(403).json({
                message: `Your current plan (${planId}) does not include access to '${feature}'.`
            });

        } catch (error) {
            console.error("Feature Guard Error:", error);
            res.status(500).json({ message: "Internal Server Error during feature check" });
        }
    };
};
