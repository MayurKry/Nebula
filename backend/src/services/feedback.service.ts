import { FeedbackModel } from "../models/feedback.model";
import { Types } from "mongoose";

export class FeedbackService {
    static async createFeedback(params: {
        userId: string | Types.ObjectId;
        category: 'bug' | 'feature' | 'general';
        rating: number;
        message: string;
    }) {
        const feedback = new FeedbackModel(params);
        return await feedback.save();
    }

    static async getAllFeedback(limit: number = 50) {
        return await FeedbackModel.find().populate('userId', 'name email').sort({ createdAt: -1 }).limit(limit);
    }
}
