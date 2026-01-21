import { Request } from "express";
import { TenantModel, ITenant } from "../models/tenant.model";
import { CreditTransactionModel } from "../models/credit-transaction.model";
import { UserModel } from "../models/user.model";
import mongoose from "mongoose";

export interface TenantFilters {
    status?: "ACTIVE" | "SUSPENDED" | "LOCKED_PAYMENT_FAIL";
    planId?: "FREE" | "PRO" | "TEAM" | "CUSTOM";
    type?: "INDIVIDUAL" | "ORGANIZATION";
    search?: string;
}

export interface CreateTenantDTO {
    name: string;
    type: "INDIVIDUAL" | "ORGANIZATION";
    ownerUserId: string;
    planId?: "FREE" | "PRO" | "TEAM";
    initialCredits?: number;
}

export interface UpdateTenantDTO {
    name?: string;
    status?: "ACTIVE" | "SUSPENDED" | "LOCKED_PAYMENT_FAIL";
}

export interface AssignCustomPlanDTO {
    basePlanId: "FREE" | "PRO" | "TEAM";
    customLimits: {
        maxUsers: number;
        monthlyCredits: number;
        features: string[];
        expiresAt?: Date;
    };
}

export const TenantService = {
    /**
     * List all tenants with optional filtering
     */
    async listTenants(filters: TenantFilters = {}) {
        const query: any = {};

        if (filters.status) {
            query.status = filters.status;
        }

        if (filters.planId) {
            query["plan.id"] = filters.planId;
        }

        if (filters.type) {
            query.type = filters.type;
        }

        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: "i" } },
                {
                    _id: mongoose.Types.ObjectId.isValid(filters.search)
                        ? new mongoose.Types.ObjectId(filters.search)
                        : null
                }
            ];
        }

        const tenants = await TenantModel.find(query)
            .populate("ownerUserId", "firstName lastName email")
            .sort({ createdAt: -1 })
            .lean();

        // Get user count for each tenant
        const tenantsWithStats = await Promise.all(
            tenants.map(async (tenant) => {
                const userCount = await UserModel.countDocuments({
                    tenantId: tenant._id
                });

                return {
                    ...tenant,
                    userCount
                };
            })
        );

        return tenantsWithStats;
    },

    /**
     * Get detailed tenant information
     */
    async getTenantById(tenantId: string) {
        const tenant = await TenantModel.findById(tenantId)
            .populate("ownerUserId", "firstName lastName email avatar")
            .lean();

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        // Get all users in this tenant
        const users = await UserModel.find({ tenantId })
            .select("firstName lastName email role avatar createdAt")
            .lean();

        // Get recent credit transactions
        const recentTransactions = await CreditTransactionModel.find({ tenantId })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate("adminUserId", "firstName lastName")
            .lean();

        return {
            ...tenant,
            users,
            recentTransactions
        };
    },

    /**
     * Create a new tenant
     */
    async createTenant(data: CreateTenantDTO) {
        const tenant = await TenantModel.create({
            name: data.name,
            type: data.type,
            ownerUserId: data.ownerUserId,
            plan: {
                id: data.planId || "FREE",
                isCustom: false
            },
            credits: {
                balance: data.initialCredits || 100,
                lifetimeIssued: data.initialCredits || 100,
                lifetimeConsumed: 0
            },
            status: "ACTIVE"
        });

        // Create initial credit transaction
        await CreditTransactionModel.create({
            tenantId: tenant._id,
            type: "GRANT",
            amount: data.initialCredits || 100,
            balanceBefore: 0,
            balanceAfter: data.initialCredits || 100,
            reason: "Initial tenant creation"
        });

        // Update user to link to this tenant
        await UserModel.findByIdAndUpdate(data.ownerUserId, {
            tenantId: tenant._id,
            role: "tenant_owner"
        });

        return tenant;
    },

    /**
     * Update tenant basic info
     */
    async updateTenant(tenantId: string, data: UpdateTenantDTO) {
        const tenant = await TenantModel.findByIdAndUpdate(
            tenantId,
            { $set: data },
            { new: true, runValidators: true }
        );

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        return tenant;
    },

    /**
     * Suspend a tenant
     */
    async suspendTenant(tenantId: string, reason?: string) {
        const tenant = await TenantModel.findByIdAndUpdate(
            tenantId,
            {
                $set: {
                    status: "SUSPENDED",
                    "metadata.suspendedAt": new Date(),
                    "metadata.suspendReason": reason
                }
            },
            { new: true }
        );

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        return tenant;
    },

    /**
     * Activate a tenant
     */
    async activateTenant(tenantId: string) {
        const tenant = await TenantModel.findByIdAndUpdate(
            tenantId,
            {
                $set: { status: "ACTIVE" },
                $unset: { "metadata.suspendedAt": "", "metadata.suspendReason": "" }
            },
            { new: true }
        );

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        return tenant;
    },

    /**
     * Assign custom plan to tenant
     */
    async assignCustomPlan(tenantId: string, data: AssignCustomPlanDTO) {
        const tenant = await TenantModel.findById(tenantId);

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        // Validate: Cannot reduce max users below current user count
        const currentUserCount = await UserModel.countDocuments({ tenantId });
        if (data.customLimits.maxUsers < currentUserCount) {
            throw new Error(
                `Cannot set max users to ${data.customLimits.maxUsers}. ` +
                `Tenant currently has ${currentUserCount} users.`
            );
        }

        tenant.plan = {
            id: "CUSTOM",
            isCustom: true,
            customLimits: data.customLimits
        };

        await tenant.save();

        return tenant;
    },

    /**
     * Add feature override to tenant
     */
    async addFeatureOverride(tenantId: string, featureId: string) {
        const tenant = await TenantModel.findByIdAndUpdate(
            tenantId,
            { $addToSet: { featureOverrides: featureId } },
            { new: true }
        );

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        return tenant;
    },

    /**
     * Remove feature override from tenant
     */
    async removeFeatureOverride(tenantId: string, featureId: string) {
        const tenant = await TenantModel.findByIdAndUpdate(
            tenantId,
            { $pull: { featureOverrides: featureId } },
            { new: true }
        );

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        return tenant;
    }
};
