import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password: string;
  refreshToken?: string;
  // Onboarding fields
  industry?: string;
  useCase?: string;
  skillLevel?: "beginner" | "intermediate" | "expert";
  onboardingCompleted: boolean;
  avatar?: string;
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: "user" },
    password: { type: String, required: true },
    refreshToken: { type: String },
    // Onboarding fields
    industry: { type: String },
    useCase: { type: String },
    skillLevel: {
      type: String,
      enum: ["beginner", "intermediate", "expert"]
    },
    onboardingCompleted: { type: Boolean, default: false },
    avatar: { type: String },
    credits: { type: Number, default: 100 },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>("User", userSchema);

