import mongoose, { Schema, Document } from "mongoose";

export type JobModule =
    | "campaign_wizard"
    | "text_to_image"
    | "text_to_video"
    | "image_to_video"
    | "text_to_audio"
    | "export";

export type JobStatus =
    | "queued"
    | "processing"
    | "completed"
    | "failed"
    | "retrying"
    | "cancelled";

export interface IJobOutput {
    type: "image" | "video" | "audio" | "script" | "export";
    url?: string;
    data?: any;
    metadata?: Record<string, any>;
}

export interface IJob extends Document {
    userId: mongoose.Types.ObjectId;
    module: JobModule;
    status: JobStatus;

    // Input data
    input: {
        prompt?: string;
        campaignId?: string;
        assetIds?: string[];
        config?: Record<string, any>;
    };

    // Output data
    output?: IJobOutput[];

    // Credits & retries
    creditsUsed: number;
    retryCount: number;
    maxRetries: number;

    // Error handling
    error?: {
        message: string;
        code?: string;
        timestamp: Date;
    };

    // Metadata
    metadata?: Record<string, any>;

    // Timestamps
    queuedAt: Date;
    startedAt?: Date;
    completedAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        module: {
            type: String,
            enum: ["campaign_wizard", "text_to_image", "text_to_video", "image_to_video", "text_to_audio", "export"],
            required: true
        },
        status: {
            type: String,
            enum: ["queued", "processing", "completed", "failed", "retrying", "cancelled"],
            default: "queued"
        },
        input: {
            prompt: { type: String },
            campaignId: { type: String },
            assetIds: [{ type: String }],
            config: { type: Schema.Types.Mixed }
        },
        output: [{
            type: { type: String, enum: ["image", "video", "audio", "script", "export"] },
            url: { type: String },
            data: { type: Schema.Types.Mixed },
            metadata: { type: Schema.Types.Mixed }
        }],
        creditsUsed: { type: Number, default: 0 },
        retryCount: { type: Number, default: 0 },
        maxRetries: { type: Number, default: 3 },
        error: {
            message: { type: String },
            code: { type: String },
            timestamp: { type: Date }
        },
        metadata: { type: Schema.Types.Mixed },
        queuedAt: { type: Date, default: Date.now },
        startedAt: { type: Date },
        completedAt: { type: Date }
    },
    { timestamps: true }
);

// Indexes for efficient querying
jobSchema.index({ userId: 1, createdAt: -1 });
jobSchema.index({ status: 1, queuedAt: 1 });
jobSchema.index({ module: 1, status: 1 });

export const JobModel = mongoose.model<IJob>("Job", jobSchema);
