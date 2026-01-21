import { RequestHandler } from "express";
import { controllerHandler } from "../utils/controllerHandler";
import { FeatureAccessService } from "../services/feature-access.service";

/**
 * Get all features with their global status
 * GET /v1/admin/features
 */
export const getAllFeatures = controllerHandler(
    async (req) => {
        const features = await FeatureAccessService.getAllFeaturesStatus();
        return { features };
    },
    {
        statusCode: 200,
        message: "Features retrieved successfully"
    }
);

/**
 * Toggle global feature (emergency kill switch)
 * POST /v1/admin/features/:featureId/toggle
 */
export const toggleGlobalFeature = controllerHandler(
    async (req) => {
        const { featureId } = req.params;
        const { enabled, reason } = req.body;
        const adminUserId = (req as any).user._id;

        const feature = await FeatureAccessService.toggleGlobalFeature(
            featureId as any,
            enabled,
            adminUserId,
            reason
        );

        return { feature };
    },
    {
        statusCode: 200,
        message: "Feature toggled successfully"
    }
);

/**
 * Check if tenant can access a feature
 * GET /v1/admin/features/check?tenantId=xxx&featureId=yyy
 */
export const checkFeatureAccess = controllerHandler(
    async (req) => {
        const { tenantId, featureId } = req.query;

        const canAccess = await FeatureAccessService.canAccessFeature(
            tenantId as string,
            featureId as any
        );

        return { canAccess };
    },
    {
        statusCode: 200,
        message: "Feature access checked successfully"
    }
);
