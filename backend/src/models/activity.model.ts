import mongoose, { Schema, Document, Types } from "mongoose";

export interface IActivity extends Document {
    userId: Types.ObjectId;
    type: "generation" | "login" | "profile_update" | "settings_change" | "security_alert";
    action: string;
    description: string;
    metadata?: Record<string, any>;
    status: "success" | "failure" | "warning";
    ip?: string;
    userAgent?: string;
    createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        type: {
            type: String,
            required: true,
            enum: ["generation", "login", "profile_update", "settings_change", "security_alert"],
            index: true
        },
        action: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        metadata: {
            type: Schema.Types.Mixed
        },
        status: {
            type: String,
            enum: ["success", "failure", "warning"],
            default: "success"
        },
        ip: { type: String },
        userAgent: { type: String }
    },
    { timestamps: true }
);

// Indexes
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ userId: 1, type: 1 });

export const ActivityModel = mongoose.model<IActivity>("Activity", activitySchema);
