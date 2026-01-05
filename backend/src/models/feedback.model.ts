import { Schema, model, Document, Types } from 'mongoose';

export interface IFeedback extends Document {
    userId: Types.ObjectId;
    category: 'bug' | 'feature' | 'general';
    rating: number;
    message: string;
    status: 'pending' | 'reviewed' | 'resolved';
    createdAt: Date;
}

const feedbackSchema = new Schema<IFeedback>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, enum: ['bug', 'feature', 'general'], required: true },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    message: { type: String, required: true },
    status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

export const FeedbackModel = model<IFeedback>('Feedback', feedbackSchema);
