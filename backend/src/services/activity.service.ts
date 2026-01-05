import { ActivityModel, IActivity } from "../models/activity.model";
import { Types } from "mongoose";

export interface LogActivityParams {
    userId: string | Types.ObjectId;
    type: IActivity["type"];
    action: string;
    description: string;
    metadata?: Record<string, any>;
    status?: IActivity["status"];
    ip?: string;
    userAgent?: string;
}

export class ActivityService {
    static async logActivity(params: LogActivityParams) {
        try {
            const userId = typeof params.userId === 'string' && Types.ObjectId.isValid(params.userId)
                ? new Types.ObjectId(params.userId)
                : params.userId;

            const activity = new ActivityModel({
                ...params,
                userId
            });
            await activity.save();
            return activity;
        } catch (error) {
            console.error("Failed to log activity:", error);
            // Don't throw, activity logging shouldn't break main flow
        }
    }

    static async getUserActivity(userId: string | Types.ObjectId, limit: number = 20, skip: number = 0, startDate?: string, endDate?: string) {
        const uid = typeof userId === 'string' && Types.ObjectId.isValid(userId)
            ? new Types.ObjectId(userId)
            : userId;

        const query: any = { userId: uid };
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        const activities = await ActivityModel.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        const total = await ActivityModel.countDocuments(query);

        return {
            activities,
            total,
            limit,
            skip
        };
    }
}
