import { controllerHandler } from "../utils/controllerHandler";
import { UserService } from "../services/user.service";

export const getProfile = controllerHandler(async (req) => {
  const userId = (req as any).user.userId || (req as any).user._id;
  const user = await UserService.updateProfile(userId, {});
  const stats = await UserService.getUsageStats(userId);

  return { user, stats };
});

export const updateProfile = controllerHandler(async (req) => {
  const userId = (req as any).user.userId || (req as any).user._id;
  const user = await UserService.updateProfile(userId, req.body);
  return { user, message: "Profile updated successfully" };
});

export const changePassword = controllerHandler(async (req) => {
  const userId = (req as any).user.userId || (req as any).user._id;
  await UserService.changePassword(userId, req.body);
  return { message: "Password updated successfully" };
});
