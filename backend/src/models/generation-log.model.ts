import mongoose, { Schema, Document } from "mongoose";

export interface IGenerationLog extends Document {
    generationId: string; // Map to Job ID or internal ID
    tenantId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    feature: string;
    inputType: "text" | "image" | "frame";
    status: "COMPLETED" | "FAILED" | "CANCELLED" | "BLOCKED";
    creditsConsumed: number;
    costIncurred: number;
    provider: string;
    aiModel?: string;
    latencyMs: number;

    // For blocked requests
    blockReason?: string;

    // Links
    jobId?: mongoose.Types.ObjectId;
    campaignId?: mongoose.Types.ObjectId;

    createdAt: Date;
}

const generationLogSchema = new Schema<IGenerationLog>(
    {
        generationId: { type: String, required: true, index: true },
        tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        feature: { type: String, required: true, index: true },
        inputType: { type: String, enum: ["text", "image", "frame"], required: true },
        status: {
            type: String,
            enum: ["COMPLETED", "FAILED", "CANCELLED", "BLOCKED"],
            required: true,
            index: true
        },
        creditsConsumed: { type: Number, default: 0 },
        costIncurred: { type: Number, default: 0 },
        provider: { type: String, required: true },
        aiModel: { type: String },
        latencyMs: { type: Number, default: 0 },

        blockReason: { type: String },

        jobId: { type: Schema.Types.ObjectId, ref: "Job" },
        campaignId: { type: Schema.Types.ObjectId, ref: "Campaign" },
    },
    { timestamps: true }
);

// Indexes for analytics
generationLogSchema.index({ tenantId: 1, createdAt: -1 });
generationLogSchema.index({ feature: 1, createdAt: -1 });
generationLogSchema.index({ status: 1, createdAt: -1 });
generationLogSchema.index({ createdAt: -1 }); // Global timeline

export const GenerationLogModel = mongoose.model<IGenerationLog>("GenerationLog", generationLogSchema);
