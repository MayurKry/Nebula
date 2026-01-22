import { UserModel } from "../models/user.model";
import bcrypt from "bcryptjs";

export const UserService = {
  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; email?: string }) {
    const user = await UserModel.findByIdAndUpdate(userId, data, { new: true }).select("-password");
    return user;
  },

  async changePassword(userId: string, { oldPassword, newPassword }: any) {
    const user = await UserModel.findById(userId).select("+password");
    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new Error("Invalid old password");

    user.password = newPassword;
    await user.save();

    return { message: "Password updated successfully" };
  },

  async getUsageStats(userId: string) {
    const user = await UserModel.findById(userId).select("credits storageUsage plan");
    // Mock storage if not real
    return {
      credits: user?.credits || 0,
      storage: user?.storageUsage || 1.2 * 1024 * 1024 * 1024, // Mock 1.2GB
      plan: user?.plan || 'free'
    };
  }
};
