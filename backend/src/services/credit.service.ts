import { TenantModel } from "../models/tenant.model";
import { CreditTransactionModel } from "../models/credit-transaction.model";
import mongoose from "mongoose";

export interface GrantCreditsDTO {
    tenantId: string;
    amount: number;
    adminUserId: string;
    reason: string;
}

export interface DeductCreditsDTO {
    tenantId: string;
    amount: number;
    adminUserId: string;
    reason: string;
}

export interface ConsumeCreditsDTO {
    tenantId: string;
    amount: number;
    jobId?: string;
    feature: string;
}

export const CreditService = {
    /**
     * Grant credits to a tenant (admin action)
     */
    async grantCredits(data: GrantCreditsDTO) {
        const tenant = await TenantModel.findById(data.tenantId);

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        // Validate tenant status
        if (tenant.status === "SUSPENDED") {
            throw new Error("Cannot grant credits to a suspended tenant. Activate the tenant first.");
        }

        // Validate amount
        if (data.amount <= 0) {
            throw new Error("Credit amount must be positive");
        }

        const balanceBefore = tenant.credits.balance;
        const balanceAfter = balanceBefore + data.amount;

        // Prevent unrealistic credit balances
        if (balanceAfter > 10000000) {
            throw new Error("Credit balance cannot exceed 10,000,000");
        }

        // Update tenant credits
        tenant.credits.balance = balanceAfter;
        tenant.credits.lifetimeIssued += data.amount;
        await tenant.save();

        // Create transaction record
        const transaction = await CreditTransactionModel.create({
            tenantId: data.tenantId,
            type: "GRANT",
            amount: data.amount,
            balanceBefore,
            balanceAfter,
            adminUserId: data.adminUserId,
            reason: data.reason
        });

        return {
            tenant,
            transaction
        };
    },

    /**
     * Deduct credits from a tenant (admin action)
     */
    async deductCredits(data: DeductCreditsDTO) {
        const tenant = await TenantModel.findById(data.tenantId);

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        // Validate tenant status
        if (tenant.status === "SUSPENDED") {
            throw new Error("Cannot deduct credits from a suspended tenant");
        }

        // Validate amount
        if (data.amount <= 0) {
            throw new Error("Deduction amount must be positive");
        }

        const balanceBefore = tenant.credits.balance;
        const balanceAfter = balanceBefore - data.amount;

        if (balanceAfter < 0) {
            throw new Error(
                `Insufficient credits. Current balance: ${balanceBefore.toLocaleString()}, ` +
                `attempting to deduct: ${data.amount.toLocaleString()}. ` +
                `Shortfall: ${Math.abs(balanceAfter).toLocaleString()} credits.`
            );
        }

        // Update tenant credits
        tenant.credits.balance = balanceAfter;
        await tenant.save();

        // Create transaction record
        const transaction = await CreditTransactionModel.create({
            tenantId: data.tenantId,
            type: "DEDUCT",
            amount: data.amount,
            balanceBefore,
            balanceAfter,
            adminUserId: data.adminUserId,
            reason: data.reason
        });

        return {
            tenant,
            transaction
        };
    },

    /**
     * Consume credits (feature usage)
     */
    async consumeCredits(data: ConsumeCreditsDTO) {
        const tenant = await TenantModel.findById(data.tenantId);

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        if (tenant.status === "SUSPENDED") {
            throw new Error("Tenant is suspended. Cannot consume credits.");
        }

        if (tenant.status === "LOCKED_PAYMENT_FAIL") {
            throw new Error("Tenant is locked due to payment failure.");
        }

        // Validate amount
        if (data.amount <= 0) {
            throw new Error("Consumption amount must be positive");
        }

        // Validate feature
        if (!data.feature || data.feature.trim().length === 0) {
            throw new Error("Feature name is required for credit consumption");
        }

        const balanceBefore = tenant.credits.balance;
        const balanceAfter = balanceBefore - data.amount;

        if (balanceAfter < 0) {
            throw new Error(
                `Insufficient credits for ${data.feature}. ` +
                `Current balance: ${balanceBefore.toLocaleString()}, ` +
                `required: ${data.amount.toLocaleString()}`
            );
        }

        // Update tenant credits
        tenant.credits.balance = balanceAfter;
        tenant.credits.lifetimeConsumed += data.amount;
        await tenant.save();

        // Create transaction record
        const transaction = await CreditTransactionModel.create({
            tenantId: data.tenantId,
            type: "CONSUMPTION",
            amount: data.amount,
            balanceBefore,
            balanceAfter,
            relatedJobId: data.jobId ? new mongoose.Types.ObjectId(data.jobId) : undefined,
            feature: data.feature
        });

        return {
            tenant,
            transaction
        };
    },

    /**
     * Get credit transaction history for a tenant
     */
    async getTransactionHistory(
        tenantId: string,
        options: { limit?: number; offset?: number } = {}
    ) {
        const limit = options.limit || 50;
        const offset = options.offset || 0;

        const transactions = await CreditTransactionModel.find({ tenantId })
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .populate("adminUserId", "firstName lastName email")
            .populate("relatedJobId", "status type")
            .lean();

        const total = await CreditTransactionModel.countDocuments({ tenantId });

        return {
            transactions,
            total,
            limit,
            offset
        };
    },

    /**
     * Get credit balance for a tenant
     */
    async getBalance(tenantId: string) {
        const tenant = await TenantModel.findById(tenantId)
            .select("credits status")
            .lean();

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        return {
            balance: tenant.credits.balance,
            lifetimeIssued: tenant.credits.lifetimeIssued,
            lifetimeConsumed: tenant.credits.lifetimeConsumed,
            status: tenant.status
        };
    },

    /**
     * Get high-velocity tenants (consuming credits rapidly)
     */
    async getHighVelocityTenants(thresholdMultiplier: number = 5) {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Aggregate credit consumption in last 24 hours
        const recentConsumption = await CreditTransactionModel.aggregate([
            {
                $match: {
                    type: "CONSUMPTION",
                    createdAt: { $gte: oneDayAgo }
                }
            },
            {
                $group: {
                    _id: "$tenantId",
                    totalConsumed: { $sum: "$amount" },
                    transactionCount: { $sum: 1 }
                }
            },
            {
                $match: {
                    totalConsumed: { $gte: 500 * thresholdMultiplier } // Threshold: 500 credits/day baseline
                }
            },
            {
                $sort: { totalConsumed: -1 }
            }
        ]);

        // Populate tenant details
        const tenantIds = recentConsumption.map(item => item._id);
        const tenants = await TenantModel.find({ _id: { $in: tenantIds } })
            .populate("ownerUserId", "firstName lastName email")
            .lean();

        const results = recentConsumption.map(consumption => {
            const tenant = tenants.find(t => t._id.toString() === consumption._id.toString());
            return {
                tenant,
                consumption24h: consumption.totalConsumed,
                transactionCount: consumption.transactionCount
            };
        });

        return results;
    }
};
