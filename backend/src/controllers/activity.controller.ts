import { Request, Response } from "express";
import { ActivityService } from "../services/activity.service";

export const getActivityLog = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id || (req as any).user?._id;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = parseInt(req.query.skip as string) || 0;

        const result = await ActivityService.getUserActivity(userId, limit, skip);

        return res.status(200).json({
            success: true,
            message: "Activity log retrieved successfully",
            data: result
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve activity log"
        });
    }
};
