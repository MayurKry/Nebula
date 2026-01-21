import mongoose, { Schema, Document } from "mongoose";

export interface ISystemFeature extends Document {
    featureId: string;
    name: string;
    description?: string;
    isGloballyEnabled: boolean;

    // Emergency shutdown tracking
    disabledBy?: mongoose.Types.ObjectId;
    disabledAt?: Date;
    disabledReason?: string;

    createdAt: Date;
    updatedAt: Date;
}

const systemFeatureSchema = new Schema<ISystemFeature>(
    {
        featureId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        name: { type: String, required: true },
        description: { type: String },
        isGloballyEnabled: { type: Boolean, default: true },

        disabledBy: { type: Schema.Types.ObjectId, ref: "User" },
        disabledAt: { type: Date },
        disabledReason: { type: String }
    },
    { timestamps: true }
);

export const SystemFeatureModel = mongoose.model<ISystemFeature>(
    "SystemFeature",
    systemFeatureSchema
);
