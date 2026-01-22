import { GenerationLogModel } from "../models/generation-log.model";
import { ErrorLogModel } from "../models/error-log.model";
import { TenantModel } from "../models/tenant.model";
import { JobModel } from "../models/job.model";
import mongoose from "mongoose";

interface AnalyticsTimeRange {
    start: Date;
    end: Date;
}

export const AnalyticsService = {
    /**
     * Get usage metrics aggregated by feature
     */
    async getUsageByFeature(range: AnalyticsTimeRange) {
        return GenerationLogModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: range.start, $lte: range.end },
                    status: "COMPLETED"
                }
            },
            {
                $group: {
                    _id: "$feature",
                    count: { $sum: 1 },
                    creditsConsumed: { $sum: "$creditsConsumed" }
                }
            }
        ]);
    },

    /**
     * Get usage metrics aggregated by tenant type
     */
    async getUsageByTenantType(range: AnalyticsTimeRange) {
        // This requires lookups, might be heavy. 
        // Optimized approach: Aggregation with Lookup
        return GenerationLogModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: range.start, $lte: range.end },
                    status: "COMPLETED"
                }
            },
            {
                $lookup: {
                    from: "tenants",
                    localField: "tenantId",
                    foreignField: "_id",
                    as: "tenant"
                }
            },
            { $unwind: "$tenant" },
            {
                $group: {
                    _id: "$tenant.type",
                    count: { $sum: 1 },
                    creditsConsumed: { $sum: "$creditsConsumed" }
                }
            }
        ]);
    },

    /**
     * Get usage metrics by Plan
     */
    async getUsageByPlan(range: AnalyticsTimeRange) {
        return GenerationLogModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: range.start, $lte: range.end },
                    status: "COMPLETED"
                }
            },
            {
                $lookup: {
                    from: "tenants",
                    localField: "tenantId",
                    foreignField: "_id",
                    as: "tenant"
                }
            },
            { $unwind: "$tenant" },
            {
                $group: {
                    _id: "$tenant.plan.id",
                    count: { $sum: 1 },
                    creditsConsumed: { $sum: "$creditsConsumed" }
                }
            }
        ]);
    },

    /**
     * Get Error counts by category
     */
    async getErrorStats(range: AnalyticsTimeRange) {
        return ErrorLogModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: range.start, $lte: range.end }
                }
            },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            }
        ]);
    },

    /**
     * Get critical error rate (Failed vs Total jobs)
     */
    async getSystemHealth(range: AnalyticsTimeRange) {
        const totalGenerations = await GenerationLogModel.countDocuments({
            createdAt: { $gte: range.start, $lte: range.end }
        });

        const errors = await ErrorLogModel.countDocuments({
            createdAt: { $gte: range.start, $lte: range.end }
        });

        return {
            totalGenerations,
            totalErrors: errors,
            errorRate: totalGenerations > 0 ? (errors / totalGenerations) * 100 : 0
        };
    }
};
