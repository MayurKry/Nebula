import { RequestHandler } from "express";
import { controllerHandler } from "../utils/controllerHandler";
import { CreditService } from "../services/credit.service";
import { TenantModel } from "../models/tenant.model";
import { CreditTransactionModel } from "../models/credit-transaction.model";

/**
 * Get dashboard metrics
 * GET /v1/admin/dashboard/metrics
 */
export const getDashboardMetrics = controllerHandler(
    async (req) => {
        // Total tenants
        const totalTenants = await TenantModel.countDocuments();
        const activeTenants = await TenantModel.countDocuments({ status: "ACTIVE" });
        const suspendedTenants = await TenantModel.countDocuments({ status: "SUSPENDED" });

        // Credit statistics
        const creditStats = await TenantModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalBalance: { $sum: "$credits.balance" },
                    totalIssued: { $sum: "$credits.lifetimeIssued" },
                    totalConsumed: { $sum: "$credits.lifetimeConsumed" }
                }
            }
        ]);

        // Recent transactions (last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentConsumption = await CreditTransactionModel.aggregate([
            {
                $match: {
                    type: "CONSUMPTION",
                    createdAt: { $gte: oneDayAgo }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }
            }
        ]);

        // High-velocity tenants
        const highVelocityTenants = await CreditService.getHighVelocityTenants(5);

        return {
            tenants: {
                total: totalTenants,
                active: activeTenants,
                suspended: suspendedTenants
            },
            credits: {
                totalBalance: creditStats[0]?.totalBalance || 0,
                totalIssued: creditStats[0]?.totalIssued || 0,
                totalConsumed: creditStats[0]?.totalConsumed || 0,
                consumed24h: recentConsumption[0]?.total || 0
            },
            highVelocityTenants: highVelocityTenants.slice(0, 5) // Top 5
        };
    },
    {
        statusCode: 200,
        message: "Dashboard metrics retrieved successfully"
    }
);
