
import { adminApi } from '@/api/admin.api';
import axiosInstance from '@/api/axiosInstance';

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
     * Get credit transactions
     */
    async getTransactions(id: string, limit = 50, offset = 0) {
        const response = await adminApi.getCreditTransactions(id, { limit, offset });
        return response.data.data;
    },


    /**
     * Switch plan (Self-service)
     */
    async switchPlan(planId: "FREE" | "PRO" | "TEAM") {
        const response = await axiosInstance.post('/tenants/switch-plan', { planId });
        return response.data.data.tenant;
    }
};
