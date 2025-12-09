import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAsset extends Document {
    name: string;
    type: "video" | "image" | "storyboard" | "audio";
    url: string;
    thumbnailUrl?: string;
    projectId?: Types.ObjectId;
    folderId?: Types.ObjectId;
    userId: Types.ObjectId;
    metadata?: {
        duration?: number;
        width?: number;
        height?: number;
        size?: number;
        format?: string;
    };
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const assetSchema = new Schema<IAsset>(
    {
        name: { type: String, required: true },
        type: {
            type: String,
            required: true,
            enum: ["video", "image", "storyboard", "audio"],
        },
        url: { type: String, required: true },
        thumbnailUrl: { type: String },
        projectId: { type: Schema.Types.ObjectId, ref: "Project" },
        folderId: { type: Schema.Types.ObjectId, ref: "Folder" },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        metadata: {
            duration: { type: Number },
            width: { type: Number },
            height: { type: Number },
            size: { type: Number },
            format: { type: String },
        },
        tags: [{ type: String }],
    },
    { timestamps: true }
);

// Indexes for faster queries
assetSchema.index({ userId: 1, createdAt: -1 });
assetSchema.index({ folderId: 1 });
assetSchema.index({ projectId: 1 });
assetSchema.index({ type: 1 });

export const AssetModel = mongoose.model<IAsset>("Asset", assetSchema);
