
import { adminApi } from '@/api/admin.api';

export const tenantsService = {
    /**
     * List tenants with filters
     */
    async listTenants(params?: { status?: string; planId?: string; type?: string; search?: string }) {
        const response = await adminApi.listTenants(params);
        return response.data.data.tenants;
    },

    /**
     * Get single tenant details
     */
    async getTenant(id: string) {
        const response = await adminApi.getTenantById(id);
        return response.data.data.tenant;
    },

    /**
     * Suspend tenant
     */
    async suspendTenant(id: string, reason: string) {
        const response = await adminApi.suspendTenant(id, reason);
        return response.data.data.tenant;
    },

    /**
     * Activate tenant
     */
    async activateTenant(id: string) {
        const response = await adminApi.activateTenant(id);
        return response.data.data.tenant;
    },

    /**
     * Assign custom plan
     */
    async assignCustomPlan(id: string, data: { basePlanId: string; customLimits: any }) {
        const response = await adminApi.assignCustomPlan(id, data);
        return response.data.data.tenant;
    },

    /**
     * Grant/Deduct credits
     */
    async adjustCredits(id: string, amount: number, reason: string, type: 'grant' | 'deduct') {
        if (type === 'grant') {
            await adminApi.grantCredits(id, amount, reason);
        } else {
            await adminApi.deductCredits(id, amount, reason);
        }
    },

    /**
     * Get credit transactions
     */
    async getTransactions(id: string, limit = 50, offset = 0) {
        const response = await adminApi.getCreditTransactions(id, { limit, offset });
        return response.data.data;
    },

    /**
     * Feature overrides
     */
    async addFeatureOverride(tenantId: string, featureId: string) {
        const response = await adminApi.addFeatureOverride(tenantId, featureId);
        return response.data.data.tenant;
    },

    async removeFeatureOverride(tenantId: string, featureId: string) {
        const response = await adminApi.removeFeatureOverride(tenantId, featureId);
        return response.data.data.tenant;
    }
};
