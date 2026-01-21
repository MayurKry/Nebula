import axiosInstance from './axiosInstance';


const API_BASE = '/admin';

export interface Tenant {
    _id: string;
    name: string;
    type: 'INDIVIDUAL' | 'ORGANIZATION';
    plan: {
        id: string;
        isCustom: boolean;
        customLimits?: {
            maxUsers: number;
            monthlyCredits: number;
            features: string[];
            expiresAt?: Date;
        };
    };
    credits: {
        balance: number;
        lifetimeIssued: number;
        lifetimeConsumed: number;
    };
    status: 'ACTIVE' | 'SUSPENDED' | 'LOCKED_PAYMENT_FAIL';
    featureOverrides?: string[];
    userCount?: number;
    users?: any[];
    recentTransactions?: any[];
}

export interface DashboardMetrics {
    tenants: {
        total: number;
        active: number;
        suspended: number;
    };
    credits: {
        totalBalance: number;
        totalIssued: number;
        totalConsumed: number;
        consumed24h: number;
    };
    highVelocityTenants: Array<{
        tenant: any;
        consumption24h: number;
        transactionCount: number;
    }>;
}

export interface Feature {
    featureId: string;
    name: string;
    isGloballyEnabled: boolean;
    disabledBy?: string;
    disabledAt?: string;
    disabledReason?: string;
}

export const adminApi = {
    // Dashboard
    getDashboardMetrics: () =>
        axiosInstance.get<{ data: DashboardMetrics }>(`${API_BASE}/dashboard/metrics`),

    // Tenants
    listTenants: (params?: { status?: string; planId?: string; type?: string; search?: string }) =>
        axiosInstance.get<{ data: { tenants: Tenant[] } }>(`${API_BASE}/tenants`, { params }),

    getTenantById: (id: string) =>
        axiosInstance.get<{ data: { tenant: Tenant } }>(`${API_BASE}/tenants/${id}`),

    createTenant: (data: { name: string; type: string; ownerUserId: string; planId?: string; initialCredits?: number }) =>
        axiosInstance.post<{ data: { tenant: Tenant } }>(`${API_BASE}/tenants`, data),

    updateTenant: (id: string, data: { name?: string; status?: string }) =>
        axiosInstance.patch<{ data: { tenant: Tenant } }>(`${API_BASE}/tenants/${id}`, data),

    suspendTenant: (id: string, reason?: string) =>
        axiosInstance.post<{ data: { tenant: Tenant } }>(`${API_BASE}/tenants/${id}/suspend`, { reason }),

    activateTenant: (id: string) =>
        axiosInstance.post<{ data: { tenant: Tenant } }>(`${API_BASE}/tenants/${id}/activate`),

    assignCustomPlan: (id: string, data: { basePlanId: string; customLimits: any }) =>
        axiosInstance.post<{ data: { tenant: Tenant } }>(`${API_BASE}/tenants/${id}/assign-plan`, data),

    // Credits
    grantCredits: (id: string, amount: number, reason: string) =>
        axiosInstance.post<{ data: any }>(`${API_BASE}/tenants/${id}/credits/grant`, { amount, reason }),

    deductCredits: (id: string, amount: number, reason: string) =>
        axiosInstance.post<{ data: any }>(`${API_BASE}/tenants/${id}/credits/deduct`, { amount, reason }),

    getCreditTransactions: (id: string, params?: { limit?: number; offset?: number }) =>
        axiosInstance.get<{ data: any }>(`${API_BASE}/tenants/${id}/credits/transactions`, { params }),

    // Features
    getAllFeatures: () =>
        axiosInstance.get<{ data: { features: Feature[] } }>(`${API_BASE}/features`),

    toggleGlobalFeature: (featureId: string, enabled: boolean, reason?: string) =>
        axiosInstance.post<{ data: { feature: Feature } }>(`${API_BASE}/features/${featureId}/toggle`, { enabled, reason }),

    addFeatureOverride: (tenantId: string, featureId: string) =>
        axiosInstance.post<{ data: { tenant: Tenant } }>(`${API_BASE}/tenants/${tenantId}/features/add`, { featureId }),

    removeFeatureOverride: (tenantId: string, featureId: string) =>
        axiosInstance.post<{ data: { tenant: Tenant } }>(`${API_BASE}/tenants/${tenantId}/features/remove`, { featureId }),
};
