import mongoose, { Schema, Document } from "mongoose";

export interface ITenant extends Document {
    name: string;
    type: "INDIVIDUAL" | "ORGANIZATION";
    ownerUserId: mongoose.Types.ObjectId;

    plan: {
        id: "FREE" | "PRO" | "TEAM" | "CUSTOM";
        isCustom: boolean;
        customLimits?: {
            maxUsers: number;
            monthlyCredits: number;
            features: string[];
            expiresAt?: Date;
        };
    };

    credits: {
        balance: number;
        lifetimeIssued: number;
        lifetimeConsumed: number;
    };

    status: "ACTIVE" | "SUSPENDED" | "LOCKED_PAYMENT_FAIL";

    // Feature overrides (tenant-specific)
    featureOverrides?: string[];

    createdAt: Date;
    updatedAt: Date;
}

const tenantSchema = new Schema<ITenant>(
    {
        name: { type: String, required: true },
        type: {
            type: String,
            enum: ["INDIVIDUAL", "ORGANIZATION"],
            required: true
        },
        ownerUserId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        plan: {
            id: {
                type: String,
                enum: ["FREE", "PRO", "TEAM", "CUSTOM"],
                default: "FREE"
            },
            isCustom: { type: Boolean, default: false },
            customLimits: {
                maxUsers: { type: Number },
                monthlyCredits: { type: Number },
                features: [{ type: String }],
                expiresAt: { type: Date }
            }
        },

        credits: {
            balance: { type: Number, default: 100 },
            lifetimeIssued: { type: Number, default: 100 },
            lifetimeConsumed: { type: Number, default: 0 }
        },

        status: {
            type: String,
            enum: ["ACTIVE", "SUSPENDED", "LOCKED_PAYMENT_FAIL"],
            default: "ACTIVE"
        },

        featureOverrides: [{ type: String }]
    },
    { timestamps: true }
);

// Index for faster queries
tenantSchema.index({ ownerUserId: 1 });
tenantSchema.index({ status: 1 });
tenantSchema.index({ "plan.id": 1 });

export const TenantModel = mongoose.model<ITenant>("Tenant", tenantSchema);
