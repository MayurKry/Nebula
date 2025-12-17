import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/db/index";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Development mode bypass - allows testing without authentication
  if (process.env.NODE_ENV === "development" && process.env.BYPASS_AUTH === "true") {
    (req as any).user = {
      _id: "dev-user-123",
      email: "dev@nebula.com",
      name: "Development User"
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, config.ACCESS_SECRET!);
    (req as any).user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "jwt expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};
