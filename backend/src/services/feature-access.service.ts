import { SystemFeatureModel } from "../models/system-feature.model";
import { TenantModel } from "../models/tenant.model";
import { SYSTEM_PLANS, PlanId } from "../constants/plan-constants";
import { FEATURES, FeatureId } from "../constants/feature-constants";

export const FeatureAccessService = {
    /**
     * Check if a tenant can access a specific feature
     * Logic: (Plan includes feature OR Tenant override) AND Global feature enabled
     */
    async canAccessFeature(tenantId: string, featureId: FeatureId): Promise<boolean> {
        // Check global kill switch
        const globalFeature = await SystemFeatureModel.findOne({ featureId });
        if (globalFeature && !globalFeature.isGloballyEnabled) {
            return false;
        }

        // Get tenant
        const tenant = await TenantModel.findById(tenantId).lean();
        if (!tenant) {
            throw new Error("Tenant not found");
        }

        // Check if tenant is active
        if (tenant.status !== "ACTIVE") {
            return false;
        }

        // Check tenant-specific override
        if (tenant.featureOverrides?.includes(featureId)) {
            return true;
        }

        // Check plan-based access
        if (tenant.plan.isCustom && tenant.plan.customLimits?.features) {
            return tenant.plan.customLimits.features.includes(featureId);
        }

        // Check system plan (only if not custom)
        if (tenant.plan.id !== "CUSTOM") {
            const planId = tenant.plan.id as PlanId;
            const plan = SYSTEM_PLANS[planId];
            return plan.features.includes(featureId as any);
        }

        return false;
    },

    /**
     * Get all accessible features for a tenant
     */
    async getAccessibleFeatures(tenantId: string): Promise<FeatureId[]> {
        const allFeatures = Object.values(FEATURES);
        const accessible: FeatureId[] = [];

        for (const feature of allFeatures) {
            const canAccess = await this.canAccessFeature(tenantId, feature);
            if (canAccess) {
                accessible.push(feature);
            }
        }

        return accessible;
    },

    /**
     * Toggle global feature (emergency kill switch)
     */
    async toggleGlobalFeature(
        featureId: FeatureId,
        enabled: boolean,
        adminUserId: string,
        reason?: string
    ) {
        let feature = await SystemFeatureModel.findOne({ featureId });

        if (!feature) {
            // Create feature record if it doesn't exist
            feature = await SystemFeatureModel.create({
                featureId,
                name: featureId,
                isGloballyEnabled: enabled
            });
        } else {
            feature.isGloballyEnabled = enabled;

            if (!enabled) {
                feature.disabledBy = adminUserId as any;
                feature.disabledAt = new Date();
                feature.disabledReason = reason;
            } else {
                feature.disabledBy = undefined;
                feature.disabledAt = undefined;
                feature.disabledReason = undefined;
            }

            await feature.save();
        }

        return feature;
    },

    /**
     * Get all features with their global status
     */
    async getAllFeaturesStatus() {
        const allFeatures = Object.values(FEATURES);
        const dbFeatures = await SystemFeatureModel.find().lean();

        const featuresStatus = allFeatures.map(featureId => {
            const dbFeature = dbFeatures.find(f => f.featureId === featureId);

            return {
                featureId,
                name: featureId,
                isGloballyEnabled: dbFeature?.isGloballyEnabled ?? true,
                disabledBy: dbFeature?.disabledBy,
                disabledAt: dbFeature?.disabledAt,
                disabledReason: dbFeature?.disabledReason
            };
        });

        return featuresStatus;
    },

    /**
     * Initialize all features in database (run once on startup)
     */
    async initializeFeatures() {
        const allFeatures = Object.values(FEATURES);

        for (const featureId of allFeatures) {
            const exists = await SystemFeatureModel.findOne({ featureId });
            if (!exists) {
                await SystemFeatureModel.create({
                    featureId,
                    name: featureId,
                    isGloballyEnabled: true
                });
            }
        }
    }
};
