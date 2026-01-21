import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/db/index";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // If Authorization header is provided, use real JWT verification
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, config.ACCESS_SECRET!);
      (req as any).user = decoded;
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

  return res.status(401).json({ message: "No token provided" });
};
