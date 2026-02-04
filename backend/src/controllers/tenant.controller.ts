import { RequestHandler } from "express";
import { controllerHandler } from "../utils/controllerHandler";
import { TenantService } from "../services/tenant.service";
import { CreditService } from "../services/credit.service";

/**
 * List all tenants with optional filters
 * GET /v1/admin/tenants?status=ACTIVE&planId=PRO&search=acme
 */
export const listTenants = controllerHandler(
    async (req) => {
        const { status, planId, type, search, limit, page } = req.query;

        const limitNum = limit ? parseInt(limit as string) : 50;
        const pageNum = page ? parseInt(page as string) : 1;
        const skip = (pageNum - 1) * limitNum;

        const result = await TenantService.listTenants({
            status: status as any,
            planId: planId as any,
            type: type as any,
            search: search as string,
            limit: limitNum,
            skip
        });

        return result;
    },
    {
        statusCode: 200,
        message: "Tenants retrieved successfully"
    }
);

/**
 * Get tenant details by ID
 * GET /v1/admin/tenants/:id
 */
export const getTenantById = controllerHandler(
    async (req) => {
        const { id } = req.params;
        const tenant = await TenantService.getTenantById(id);
        return { tenant };
    },
    {
        statusCode: 200,
        message: "Tenant details retrieved successfully"
    }
);

/**
 * Create a new tenant
 * POST /v1/admin/tenants
 */
export const createTenant = controllerHandler(
    async (req) => {
        const { name, type, ownerUserId, ownerEmail, firstName, lastName, planId, initialCredits } = req.body;

        const tenant = await TenantService.createTenant({
            name,
            type,
            ownerUserId,
            ownerUserData: ownerEmail ? {
                email: ownerEmail,
                firstName: firstName || 'Tenant',
                lastName: lastName || 'Owner'
            } : undefined,
            planId,
            initialCredits
        });

        return { tenant };
    },
    {
        statusCode: 201,
        message: "Tenant created successfully"
    }
);

/**
 * Update tenant basic info
 * PATCH /v1/admin/tenants/:id
 */
export const updateTenant = controllerHandler(
    async (req) => {
        const { id } = req.params;
        const { name, status } = req.body;

        const tenant = await TenantService.updateTenant(id, { name, status });

        return { tenant };
    },
    {
        statusCode: 200,
        message: "Tenant updated successfully"
    }
);

/**
 * Suspend a tenant
 * POST /v1/admin/tenants/:id/suspend
 */
export const suspendTenant = controllerHandler(
    async (req) => {
        const { id } = req.params;
        const { reason } = req.body;

        const tenant = await TenantService.suspendTenant(id, reason);

        return { tenant };
    },
    {
        statusCode: 200,
        message: "Tenant suspended successfully"
    }
);

/**
 * Activate a tenant
 * POST /v1/admin/tenants/:id/activate
 */
export const activateTenant = controllerHandler(
    async (req) => {
        const { id } = req.params;

        const tenant = await TenantService.activateTenant(id);

        return { tenant };
    },
    {
        statusCode: 200,
        message: "Tenant activated successfully"
    }
);

/**
 * Assign custom plan to tenant
 * POST /v1/admin/tenants/:id/assign-plan
 */
export const assignCustomPlan = controllerHandler(
    async (req) => {
        const { id } = req.params;
        const { basePlanId, customLimits } = req.body;

        const tenant = await TenantService.assignCustomPlan(id, {
            basePlanId,
            customLimits
        });

        return { tenant };
    },
    {
        statusCode: 200,
        message: "Custom plan assigned successfully"
    }
);

/**
 * Grant credits to tenant
 * POST /v1/admin/tenants/:id/credits/grant
 */
export const grantCredits = controllerHandler(
    async (req) => {
        const { id } = req.params;
        const { amount, reason } = req.body;
        const adminUserId = (req as any).user._id.toString();

        const result = await CreditService.grantCredits({
            tenantId: id,
            amount,
            adminUserId,
            reason
        });

        return result;
    },
    {
        statusCode: 200,
        message: "Credits granted successfully"
    }
);

/**
 * Deduct credits from tenant
 * POST /v1/admin/tenants/:id/credits/deduct
 */
export const deductCredits = controllerHandler(
    async (req) => {
        const { id } = req.params;
        const { amount, reason } = req.body;
        const adminUserId = (req as any).user._id.toString();

        const result = await CreditService.deductCredits({
            tenantId: id,
            amount,
            adminUserId,
            reason
        });

        return result;
    },
    {
        statusCode: 200,
        message: "Credits deducted successfully"
    }
);

/**
 * Get credit transaction history
 * GET /v1/admin/tenants/:id/credits/transactions
 */
export const getCreditTransactions = controllerHandler(
    async (req) => {
        const { id } = req.params;
        const { limit, offset } = req.query;

        const result = await CreditService.getTransactionHistory(id, {
            limit: limit ? parseInt(limit as string) : undefined,
            offset: offset ? parseInt(offset as string) : undefined
        });

        return result;
    },
    {
        statusCode: 200,
        message: "Credit transactions retrieved successfully"
    }
);

/**
 * Add feature override to tenant
 * POST /v1/admin/tenants/:id/features/add
 */
export const addFeatureOverride = controllerHandler(
    async (req) => {
        const { id } = req.params;
        const { featureId } = req.body;

        const tenant = await TenantService.addFeatureOverride(id, featureId);

        return { tenant };
    },
    {
        statusCode: 200,
        message: "Feature override added successfully"
    }
);

/**
 * Remove feature override from tenant
 * POST /v1/admin/tenants/:id/features/remove
 */
export const removeFeatureOverride = controllerHandler(
    async (req) => {
        const { id } = req.params;
        const { featureId } = req.body;

        const tenant = await TenantService.removeFeatureOverride(id, featureId);

        return { tenant };
    },
    {
        statusCode: 200,
        message: "Feature override removed successfully"
    }
);
