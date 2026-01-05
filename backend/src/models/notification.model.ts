import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
    userId: Types.ObjectId;
    title: string;
    description: string;
    type: 'success' | 'info' | 'warning' | 'error';
    read: boolean;
    link?: string;
    createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['success', 'info', 'warning', 'error'], default: 'info' },
    read: { type: Boolean, default: false },
    link: { type: String },
    createdAt: { type: Date, default: Date.now }
});

export const NotificationModel = model<INotification>('Notification', notificationSchema);
