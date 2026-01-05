import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";
import { FeedbackService } from "../services/feedback.service";

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const notifications = await NotificationService.getUserNotifications(userId);
        res.json({ success: true, data: notifications });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const markNotificationRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await NotificationService.markAsRead(id);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const markAllNotificationsRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        await NotificationService.markAllAsRead(userId);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const submitFeedback = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { category, rating, message } = req.body;

        const feedback = await FeedbackService.createFeedback({
            userId,
            category,
            rating,
            message
        });

        res.json({ success: true, data: feedback });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
