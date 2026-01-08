import mongoose, { Schema, Document } from "mongoose";

export interface ICampaignAsset {
    type: "image" | "video";
    jobId: mongoose.Types.ObjectId;
    url?: string;
    status: "pending" | "generating" | "completed" | "failed";
    metadata?: Record<string, any>;
}

export interface ICampaign extends Document {
    userId: mongoose.Types.ObjectId;

    // Step 1: Campaign Overview
    name: string;
    objective: "Brand Awareness" | "Product Promotion" | "Lead Generation" | "App Installs";
    platforms: string[]; // Instagram, Facebook, YouTube, TikTok

    // Step 2: Audience & Region
    country: string;
    language: string;
    audienceType: "B2C" | "B2B";
    audienceDescription?: string;

    // Step 3: Brand Assets
    brandName: string;
    brandTone?: string;
    brandLogo?: string;
    brandImages?: string[];
    primaryColor?: string;

    // Step 4: Product Details (Optional)
    productName?: string;
    productLink?: string;
    productDescription?: string;
    cta: string; // Call to action

    // Step 5: Content Preferences
    contentType: "video" | "image" | "both";
    videoDuration?: 6 | 15 | 30;
    visualStyle?: string;
    aspectRatios?: Record<string, string>; // platform -> aspect ratio

    // Step 6: AI Generated Content
    generatedScript?: string;
    sceneOutline?: string[];

    // Assets
    assets: ICampaignAsset[];

    // Status
    status: "draft" | "generating" | "completed" | "failed";

    // Jobs
    jobIds: mongoose.Types.ObjectId[];

    createdAt: Date;
    updatedAt: Date;
}

const campaignSchema = new Schema<ICampaign>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        // Step 1
        name: { type: String, required: true },
        objective: {
            type: String,
            enum: ["Brand Awareness", "Product Promotion", "Lead Generation", "App Installs"],
            // required: false  <-- Relaxed
        },
        platforms: [{ type: String }],

        // Step 2
        country: { type: String },
        language: { type: String },
        audienceType: {
            type: String,
            enum: ["B2C", "B2B"],
            // required: false <-- Relaxed
        },
        audienceDescription: { type: String },

        // Step 3
        brandName: { type: String }, // Relaxed
        brandTone: { type: String },
        brandLogo: { type: String },
        brandImages: [{ type: String }],
        primaryColor: { type: String },

        // Step 4
        productName: { type: String },
        productLink: { type: String },
        productDescription: { type: String },
        cta: { type: String }, // Relaxed

        // Step 5
        contentType: {
            type: String,
            enum: ["video", "image", "both"],
            // required: false <-- Relaxed
        },
        videoDuration: {
            type: Number,
            enum: [6, 15, 30]
        },
        visualStyle: { type: String },
        aspectRatios: { type: Schema.Types.Mixed },

        // Step 6
        generatedScript: { type: String },
        sceneOutline: [{ type: String }],

        // Assets
        assets: [{
            type: { type: String, enum: ["image", "video"], required: true },
            jobId: { type: Schema.Types.ObjectId, ref: "Job" },
            url: { type: String },
            status: {
                type: String,
                enum: ["pending", "generating", "completed", "failed"],
                default: "pending"
            },
            metadata: { type: Schema.Types.Mixed }
        }],

        // Status
        status: {
            type: String,
            enum: ["draft", "generating", "completed", "failed"],
            default: "draft",
            index: true
        },

        // Jobs
        jobIds: [{ type: Schema.Types.ObjectId, ref: "Job" }]
    },
    { timestamps: true }
);

// Indexes
campaignSchema.index({ userId: 1, createdAt: -1 });
campaignSchema.index({ status: 1 });

export const CampaignModel = mongoose.model<ICampaign>("Campaign", campaignSchema);
