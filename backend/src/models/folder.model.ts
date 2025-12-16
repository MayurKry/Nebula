import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFolder extends Document {
    _id: Types.ObjectId;
    name: string;
    parentId?: Types.ObjectId;
    userId: Types.ObjectId;
    color?: string;
    icon?: string;
    createdAt: Date;
    updatedAt: Date;
}

const folderSchema = new Schema<IFolder>(
    {
        name: { type: String, required: true },
        parentId: { type: Schema.Types.ObjectId, ref: "Folder" },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        color: { type: String, default: "#71717A" },
        icon: { type: String, default: "folder" },
    },
    { timestamps: true }
);

// Index for faster queries
folderSchema.index({ userId: 1, parentId: 1 });

export const FolderModel = mongoose.model<IFolder>("Folder", folderSchema);
