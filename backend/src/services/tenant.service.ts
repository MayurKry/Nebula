import { Request } from "express";
import { TenantModel, type ITenant } from "../models/tenant.model";
import { CreditTransactionModel } from "../models/credit-transaction.model";
import { UserModel } from "../models/user.model";
import mongoose from "mongoose";

export interface TenantFilters {
    status?: "ACTIVE" | "SUSPENDED" | "LOCKED_PAYMENT_FAIL";
    planId?: "FREE" | "PRO" | "TEAM" | "CUSTOM";
    type?: "INDIVIDUAL" | "ORGANIZATION";
    search?: string;
    limit?: number;
    skip?: number;
}

export interface CreateTenantDTO {
    name: string;
    type: "INDIVIDUAL" | "ORGANIZATION";
    ownerUserId?: string; // Made optional since ownerUserData can be provided instead
    ownerUserData?: {
        email: string;
        firstName: string;
        lastName: string;
    };
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

        const total = await TenantModel.countDocuments(query);
        const tenants = await TenantModel.find(query)
            .populate("ownerUserId", "firstName lastName email")
            .sort({ createdAt: -1 })
            .limit(filters.limit || 50)
            .skip(filters.skip || 0)
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

        return { tenants: tenantsWithStats, total };
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
        // 1. Check for duplicate tenant name
        const existingTenantName = await TenantModel.findOne({ name: data.name });
        if (existingTenantName) {
            throw new Error(`Tenant with name "${data.name}" already exists.`);
        }

        let ownerUserId = data.ownerUserId;

        // 2. Identify or Create Owner User
        if (!ownerUserId && data.ownerUserData) {
            const { email, firstName, lastName } = data.ownerUserData;

            let user = await UserModel.findOne({ email });

            if (user) {
                // Check if user is already in a tenant
                if (user.tenantId) {
                    const existingUserTenant = await TenantModel.findById(user.tenantId);
                    const tenantName = existingUserTenant ? existingUserTenant.name : 'Unknown Organization';
                    throw new Error(`User ${email} is already associated with "${tenantName}". Users cannot belong to multiple tenants.`);
                }
            } else {
                // Create new user
                user = await UserModel.create({
                    firstName,
                    lastName,
                    email,
                    password: "$2b$10$EpOppp9iM7V7i.h1/t3dUOq1.q1/t3dUOq1.q1/t3dUOq1.q1", // Default 'password123'
                    role: "tenant_owner",
                    isEmailVerified: true
                });
            }

            ownerUserId = (user._id as mongoose.Types.ObjectId).toString();
        }

        if (!ownerUserId) {
            throw new Error("Owner User ID or User Data is required");
        }

        // 3. Final Validation on Owner
        const ownerCheck = await UserModel.findById(ownerUserId);
        if (!ownerCheck) throw new Error("Specified owner user not found.");
        if (ownerCheck.tenantId) throw new Error(`User ${ownerCheck.email} is already assigned to a tenant.`);

        // 4. Create Tenant
        const tenant = await TenantModel.create({
            name: data.name,
            type: data.type,
            ownerUserId: ownerUserId,
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

        // 5. Initialize Ledger
        await CreditTransactionModel.create({
            tenantId: tenant._id,
            type: "GRANT",
            amount: data.initialCredits || 100,
            balanceBefore: 0,
            balanceAfter: data.initialCredits || 100,
            reason: "Initial tenant infrastructure provisioning"
        });

        // 6. Link User to Tenant
        await UserModel.findByIdAndUpdate(ownerUserId, {
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

        // Validate custom limits
        if (data.customLimits.maxUsers < 1) {
            throw new Error("Max users must be at least 1");
        }

        if (data.customLimits.monthlyCredits < 100 || data.customLimits.monthlyCredits > 1000000) {
            throw new Error("Monthly credits must be between 100 and 1,000,000");
        }

        if (!data.customLimits.features || data.customLimits.features.length === 0) {
            throw new Error("At least one feature must be specified");
        }

        // Validate expiration date
        if (data.customLimits.expiresAt && new Date(data.customLimits.expiresAt) <= new Date()) {
            throw new Error("Expiration date must be in the future");
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
    },

    /**
     * Switch plan for a tenant (Self-service/Admin)
     */
    async switchPlan(tenantId: string, planId: "FREE" | "PRO" | "TEAM") {
        const tenant = await TenantModel.findById(tenantId);
        if (!tenant) throw new Error("Tenant not found");

        // Simple credit allocation logic based on plan
        const planCreditMapping = {
            "FREE": 100,
            "PRO": 1000,
            "TEAM": 5000
        };

        const creditsToGrant = planCreditMapping[planId] || 0;
        const balanceBefore = tenant.credits.balance;

        tenant.plan = {
            id: planId,
            isCustom: false
        };

        // Grant credits for the new plan
        tenant.credits.balance += creditsToGrant;
        tenant.credits.lifetimeIssued += creditsToGrant;

        await tenant.save();

        // Log the credit grant
        await CreditTransactionModel.create({
            tenantId: tenant._id,
            type: "GRANT",
            amount: creditsToGrant,
            balanceBefore,
            balanceAfter: tenant.credits.balance,
            reason: `Plan switched to ${planId}`
        });

        // Update owner user record plan field for UI consistency
        await UserModel.findByIdAndUpdate(tenant.ownerUserId, {
            plan: planId.toLowerCase()
        });

        return tenant;
    }
};
