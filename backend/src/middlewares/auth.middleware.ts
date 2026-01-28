import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/db/index";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // If Authorization header is provided, use real JWT verification
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, config.ACCESS_SECRET!);
      console.log(`[Auth] Decoded token:`, JSON.stringify(decoded, null, 2));
      (req as any).user = decoded;

      // Attach Tenant Context if user has tenantId
      const user = decoded as any;
      if (user.tenantId) {
        try {
          const { TenantModel } = await import("../models/tenant.model");
          const tenant = await TenantModel.findById(user.tenantId).lean();
          (req as any).tenant = tenant;

          if (tenant) {
            console.log(`[Auth] ✅ Loaded tenant: ${tenant.name} (ID: ${tenant._id}) for user: ${user.email}`);
          } else {
            console.warn(`[Auth] ⚠️  Tenant not found for tenantId: ${user.tenantId}`);
          }
        } catch (err) {
          console.error("[Auth] ❌ Failed to load tenant context:", err);
        }
      }

      return next();
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "jwt expired" });
      }
      return res.status(401).json({ message: "Invalid token" });
    }
  }

  // Development mode fallback - only if explicitly enabled or in dev env
  const isDevBypass = process.env.NODE_ENV === "development" || process.env.AUTH_BYPASS === "true";

  if (isDevBypass) {
    (req as any).user = {
      _id: "507f1f77bcf86cd799439011",
      userId: "507f1f77bcf86cd799439011",
      email: "dev@nebula.com",
      name: "Development User",
      role: "super_admin" // Allow super admin access in dev bypass mode
    };
    return next();
  }

  return res.status(401).json({ message: "Authentication required" });
};

export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (user.role !== 'super_admin') {
    return res.status(403).json({ message: "Access denied. Super Admin privileges required." });
  }

  return next();
};
