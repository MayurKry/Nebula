import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

// Apply rate limiting to prevent abuse / DDoS
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, //Limit each IP to 5000 requests per windowMs
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false, // Disable the X-RateLimit-* headers
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      status: "error",
      message: "Too many requests, please try again later",
    });
  },
});
