import mongoose, { Schema, Document } from "mongoose";

export interface ICreditTransaction extends Document {
    tenantId: mongoose.Types.ObjectId;
    type: "GRANT" | "DEDUCT" | "PURCHASE" | "CONSUMPTION" | "REFUND";
    amount: number;
    balanceBefore: number;
    balanceAfter: number;

    // For admin actions
    adminUserId?: mongoose.Types.ObjectId;
    reason?: string;

    // For consumption tracking
    relatedJobId?: mongoose.Types.ObjectId;
    feature?: string;

    metadata?: Record<string, any>;

    createdAt: Date;
}

const creditTransactionSchema = new Schema<ICreditTransaction>(
    {
        tenantId: {
            type: Schema.Types.ObjectId,
            ref: "Tenant",
            required: true,
            index: true
        },
        type: {
            type: String,
            enum: ["GRANT", "DEDUCT", "PURCHASE", "CONSUMPTION", "REFUND"],
            required: true
        },
        amount: { type: Number, required: true },
        balanceBefore: { type: Number, required: true },
        balanceAfter: { type: Number, required: true },

        adminUserId: { type: Schema.Types.ObjectId, ref: "User" },
        reason: { type: String },

        relatedJobId: { type: Schema.Types.ObjectId, ref: "Job" },
        feature: { type: String },

        metadata: { type: Schema.Types.Mixed }
    },
    { timestamps: true }
);

// Indexes for efficient queries
creditTransactionSchema.index({ tenantId: 1, createdAt: -1 });
creditTransactionSchema.index({ type: 1 });
creditTransactionSchema.index({ adminUserId: 1 });

export const CreditTransactionModel = mongoose.model<ICreditTransaction>(
    "CreditTransaction",
    creditTransactionSchema
);
