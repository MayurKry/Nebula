import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProject extends Document {
    name: string;
    description?: string;
    type: "text-to-video" | "image-to-video" | "storyboard" | "text-to-image";
    status: "draft" | "processing" | "completed" | "failed";
    userId: Types.ObjectId;
    thumbnail?: string;
    prompt?: string;
    style?: string;
    duration?: number;
    createdAt: Date;
    updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
    {
        name: { type: String, required: true },
        description: { type: String },
        type: {
            type: String,
            required: true,
            enum: ["text-to-video", "image-to-video", "storyboard", "text-to-image"],
        },
        status: {
            type: String,
            default: "draft",
            enum: ["draft", "processing", "completed", "failed"],
        },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        thumbnail: { type: String },
        prompt: { type: String },
        style: { type: String },
        duration: { type: Number },
    },
    { timestamps: true }
);

// Index for faster queries
projectSchema.index({ userId: 1, createdAt: -1 });

export const ProjectModel = mongoose.model<IProject>("Project", projectSchema);
