import { NotificationModel, INotification } from "../models/notification.model";
import { Types } from "mongoose";

export class NotificationService {
    static async createNotification(params: {
        userId: string | Types.ObjectId;
        title: string;
        description: string;
        type?: INotification['type'];
        link?: string;
    }) {
        const notification = new NotificationModel(params);
        return await notification.save();
    }

    static async getUserNotifications(userId: string | Types.ObjectId, limit: number = 50) {
        return await NotificationModel.find({ userId: new Types.ObjectId(userId.toString()) })
            .sort({ createdAt: -1 })
            .limit(limit);
    }

    static async markAsRead(notificationId: string) {
        return await NotificationModel.findByIdAndUpdate(notificationId, { read: true }, { new: true });
    }

    static async markAllAsRead(userId: string | Types.ObjectId) {
        return await NotificationModel.updateMany(
            { userId: new Types.ObjectId(userId.toString()), read: false },
            { read: true }
        );
    }
}
