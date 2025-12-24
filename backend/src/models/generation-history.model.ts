import mongoose, { Schema, Document, Types } from "mongoose";

export interface IGenerationHistory extends Document {
    userId: Types.ObjectId;
    type: "image" | "video" | "video-project";
    prompt: string;
    settings: {
        style?: string;
        width?: number;
        height?: number;
        aspectRatio?: string;
        duration?: number;
        seed?: number;
        cameraAngle?: string;
        negativePrompt?: string;
        count?: number;
    };
    results: Array<{
        assetId?: Types.ObjectId;
        url: string;
        thumbnailUrl?: string;
        provider?: string;
        jobId?: string;
        status?: string;
    }>;
    provider?: string;
    status: "pending" | "processing" | "completed" | "failed";
    error?: string;
    createdAt: Date;
    updatedAt: Date;
}

const generationHistorySchema = new Schema<IGenerationHistory>(
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
            enum: ["image", "video", "video-project"],
            index: true
        },
        prompt: {
            type: String,
            required: true
        },
        settings: {
            style: { type: String },
            width: { type: Number },
            height: { type: Number },
            aspectRatio: { type: String },
            duration: { type: Number },
            seed: { type: Number },
            cameraAngle: { type: String },
            negativePrompt: { type: String },
            count: { type: Number }
        },
        results: [{
            assetId: { type: Schema.Types.ObjectId, ref: "Asset" },
            url: { type: String, required: true },
            thumbnailUrl: { type: String },
            provider: { type: String },
            jobId: { type: String },
            status: { type: String }
        }],
        provider: { type: String },
        status: {
            type: String,
            enum: ["pending", "processing", "completed", "failed"],
            default: "completed"
        },
        error: { type: String }
    },
    { timestamps: true }
);

// Compound indexes for efficient queries
generationHistorySchema.index({ userId: 1, createdAt: -1 });
generationHistorySchema.index({ userId: 1, type: 1, createdAt: -1 });
generationHistorySchema.index({ userId: 1, status: 1 });

export const GenerationHistoryModel = mongoose.model<IGenerationHistory>(
    "GenerationHistory",
    generationHistorySchema
);
