import mongoose, { Schema, Document } from "mongoose";

export interface IErrorLog extends Document {
    tenantId?: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;

    category: "PROVIDER" | "TIMEOUT" | "CREDIT" | "FEATURE" | "COST" | "SYSTEM";
    feature?: string;

    message: string;
    stackTrace?: string;
    providerError?: any;

    relatedJobId?: mongoose.Types.ObjectId;
    relatedCampaignId?: mongoose.Types.ObjectId;

    retryCount: number;
    resolved: boolean;

    createdAt: Date;
}

const errorLogSchema = new Schema<IErrorLog>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", index: true },

        category: {
            type: String,
            enum: ["PROVIDER", "TIMEOUT", "CREDIT", "FEATURE", "COST", "SYSTEM"],
            required: true,
            index: true
        },
        feature: { type: String, index: true },

        message: { type: String, required: true },
        stackTrace: { type: String },
        providerError: { type: Schema.Types.Mixed },

        relatedJobId: { type: Schema.Types.ObjectId, ref: "Job" },
        relatedCampaignId: { type: Schema.Types.ObjectId, ref: "Campaign" },

        retryCount: { type: Number, default: 0 },
        resolved: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Indexes
errorLogSchema.index({ category: 1, createdAt: -1 });
errorLogSchema.index({ createdAt: -1 });

export const ErrorLogModel = mongoose.model<IErrorLog>("ErrorLog", errorLogSchema);
