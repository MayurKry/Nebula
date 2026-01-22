import { GenerationLogModel } from "../models/generation-log.model";
import { ErrorLogModel } from "../models/error-log.model";

export const LoggingService = {
    /**
     * List generation logs with filters
     */
    async listGenerationLogs(filters: any, pagination: { limit: number; offset: number }) {
        const query: any = {};

        if (filters.tenantId) query.tenantId = filters.tenantId;
        if (filters.feature) query.feature = filters.feature;
        if (filters.status) query.status = filters.status;
        if (filters.generationId) query.generationId = filters.generationId;

        if (filters.search) {
            // Basic search if needed
        }

        if (filters.dateRange) {
            query.createdAt = {
                $gte: new Date(filters.dateRange.start),
                $lte: new Date(filters.dateRange.end)
            };
        }

        const totals = await GenerationLogModel.countDocuments(query);
        const logs = await GenerationLogModel.find(query)
            .sort({ createdAt: -1 })
            .skip(pagination.offset)
            .limit(pagination.limit)
            .populate("tenantId", "name")
            .populate("userId", "email firstName lastName")
            .lean();

        return { logs, total: totals };
    },

    /**
     * List error logs with filters
     */
    async listErrorLogs(filters: any, pagination: { limit: number; offset: number }) {
        const query: any = {};

        if (filters.category) query.category = filters.category;
        if (filters.tenantId) query.tenantId = filters.tenantId;

        const totals = await ErrorLogModel.countDocuments(query);
        const logs = await ErrorLogModel.find(query)
            .sort({ createdAt: -1 })
            .skip(pagination.offset)
            .limit(pagination.limit)
            .populate("tenantId", "name")
            .lean();

        return { logs, total: totals };
    },

    /**
     * Get details of a specific generation log
     */
    async getGenerationDetail(id: string) {
        return GenerationLogModel.findOne({ generationId: id })
            .populate("tenantId")
            .populate("userId")
            .lean();
    },

    /**
     * Create a new generation log
     */
    async createGenerationLog(data: any) {
        try {
            return await GenerationLogModel.create(data);
        } catch (error) {
            console.error("Failed to create generation log:", error);
        }
    },

    /**
     * Create a new error log
     */
    async createErrorLog(data: any) {
        try {
            return await ErrorLogModel.create(data);
        } catch (error) {
            console.error("Failed to create error log:", error);
        }
    }
};
