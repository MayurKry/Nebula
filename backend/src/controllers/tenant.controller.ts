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

        // Input validation
        if (!name || name.trim().length < 3 || name.trim().length > 100) {
            throw new Error("Tenant name must be between 3 and 100 characters");
        }

        if (!type || !['INDIVIDUAL', 'ORGANIZATION'].includes(type)) {
            throw new Error("Type must be either INDIVIDUAL or ORGANIZATION");
        }

        if (!ownerUserId && !ownerEmail) {
            throw new Error("Either ownerUserId or ownerEmail must be provided");
        }

        if (ownerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
            throw new Error("Invalid email format");
        }

        if (initialCredits !== undefined && (initialCredits < 0 || initialCredits > 100000)) {
            throw new Error("Initial credits must be between 0 and 100,000");
        }

        const tenant = await TenantService.createTenant({
            name: name.trim(),
            type,
            ownerUserId,
            ownerUserData: ownerEmail ? {
                email: ownerEmail.toLowerCase().trim(),
                firstName: firstName?.trim() || 'Tenant',
                lastName: lastName?.trim() || 'Owner'
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

        // Input validation
        if (!amount || amount <= 0 || amount > 100000) {
            throw new Error("Credit amount must be between 1 and 100,000");
        }

        if (!reason || reason.trim().length < 5) {
            throw new Error("Reason must be at least 5 characters");
        }

        const result = await CreditService.grantCredits({
            tenantId: id,
            amount,
            adminUserId,
            reason: reason.trim()
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

        // Input validation
        if (!amount || amount <= 0 || amount > 100000) {
            throw new Error("Credit amount must be between 1 and 100,000");
        }

        if (!reason || reason.trim().length < 5) {
            throw new Error("Reason must be at least 5 characters");
        }

        const result = await CreditService.deductCredits({
            tenantId: id,
            amount,
            adminUserId,
            reason: reason.trim()
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

/**
 * Switch plan for a tenant
 * POST /v1/admin/tenants/:id/switch-plan (admin)
 * POST /v1/tenants/switch-plan (user)
 */
export const switchPlan = controllerHandler(
    async (req) => {
        // Check if this is an admin request (has :id param) or user request
        const tenantId = req.params.id || (req as any).user.tenantId;
        const { planId } = req.body;

        if (!tenantId) {
            throw new Error("User is not associated with any tenant");
        }

        if (!planId || !['FREE', 'PRO', 'TEAM'].includes(planId)) {
            throw new Error("Invalid plan ID. Must be FREE, PRO, or TEAM");
        }

        const tenant = await TenantService.switchPlan(tenantId, planId);

        return { tenant };
    },
    {
        statusCode: 200,
        message: "Plan updated successfully"
    }
);
