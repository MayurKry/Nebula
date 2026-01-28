import { Request } from "express";
import bcrypt from "bcryptjs";
import { ApiError } from "../utils/ApiError";
import { UserModel } from "../models/user.model";
import { ActivityService } from "./activity.service";
import { TenantService } from "./tenant.service";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";

export const AuthService = {
  async register(req: Request) {
    console.log("Registration request body:", req.body);
    const { firstName, lastName, email, password, companyName, industry, useCase, plan } = req.body;

    if (!firstName || !lastName || !email || !password)
      throw new ApiError(400, "Name, email, and password are required");

    const existing = await UserModel.findOne({ email });
    if (existing) throw new ApiError(400, "User already exists");

    // 1. Create User
    const user = await UserModel.create({
      firstName,
      lastName,
      email,
      password, // Plain password; hashed by UserModel pre-save hook
      role: "tenant_owner",
      industry,
      useCase,
      plan: plan || "starter",
      onboardingCompleted: true
    }) as any;

    // Plan Mapping
    const planMapping: Record<string, string> = {
      'starter': 'FREE',
      'creator': 'PRO',
      'enterprise': 'TEAM'
    };

    const mappedPlanId = planMapping[plan?.toLowerCase()] || 'FREE';

    // 2. Create Tenant (Organization)
    const tenant = await TenantService.createTenant({
      name: companyName || `${firstName}'s Space`,
      type: companyName ? "ORGANIZATION" : "INDIVIDUAL",
      ownerUserId: user._id.toString(),
      planId: mappedPlanId as any,
      initialCredits: plan === 'creator' ? 1000 : 100
    });

    // 3. Update User with TenantId (redundant as TenantService does it, but safety first)
    user.tenantId = tenant._id as any;
    user.credits = plan === 'creator' ? 1000 : 100; // Sync user credits with tenant balance

    const accessToken = generateAccessToken({
      id: user._id,
      userId: user._id,
      email,
      role: user.role,
      tenantId: user.tenantId
    });
    const refreshToken = generateRefreshToken({
      id: user._id,
      userId: user._id,
      email,
      role: user.role,
      tenantId: user.tenantId
    });

    user.refreshToken = refreshToken;
    await user.save();

    await ActivityService.logActivity({
      userId: user._id as any,
      type: "login",
      action: "Account Created",
      description: `Welcome to Nebula, ${firstName}! Your organization '${tenant.name}' has been created.`,
      status: "success",
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    const safeUser = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      credits: user.credits,
      tenantId: user.tenantId
    };

    return { user: safeUser, accessToken, refreshToken };
  },

  async login(req: Request) {
    const { email, password } = req.body;

    if (!email || !password)
      throw new ApiError(400, "Email and password are required");

    const user = await UserModel.findOne({ email });
    if (!user) throw new ApiError(401, "Invalid email or password");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new ApiError(401, "Invalid email or password");

    const accessToken = generateAccessToken({
      id: user._id,
      userId: user._id,
      email,
      role: user.role,
      tenantId: user.tenantId
    });
    const refreshToken = generateRefreshToken({
      id: user._id,
      userId: user._id,
      email,
      role: user.role,
      tenantId: user.tenantId
    });

    user.refreshToken = refreshToken;
    await user.save();

    await ActivityService.logActivity({
      userId: user._id as any,
      type: "login",
      action: "Sign In",
      description: "Successfully signed in to your account.",
      status: "success",
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    const safeUser = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      credits: user.credits,
    };

    return { user: safeUser, accessToken, refreshToken };
  },

  async refreshToken(req: Request) {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new ApiError(400, "Refresh token required");

    const user = await UserModel.findOne({ refreshToken });
    if (!user) throw new ApiError(401, "Invalid refresh token");

    try {
      const decoded = verifyRefreshToken(refreshToken) as {
        id: string;
        email: string;
      };

      const newAccessToken = generateAccessToken({
        id: decoded.id,
        userId: decoded.id,
        email: decoded.email,
        role: user.role,
        tenantId: user.tenantId
      });
      const newRefreshToken = generateRefreshToken({
        id: decoded.id,
        userId: decoded.id,
        email: decoded.email,
        role: user.role,
        tenantId: user.tenantId
      });

      user.refreshToken = newRefreshToken;
      await user.save();

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch {
      throw new ApiError(401, "Invalid or expired refresh token");
    }
  },

  async logout(req: Request) {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new ApiError(400, "Refresh token required");

    const user = await UserModel.findOne({ refreshToken });
    if (!user) throw new ApiError(400, "Invalid token");

    user.refreshToken = undefined;
    await user.save();

    return { message: "Logged out successfully" };
  },
};
