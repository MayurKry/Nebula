import { Request, Response, NextFunction } from "express";

/**
 * Maintenance Mode Middleware
 * Checks if the system is in maintenance mode and blocks requests accordingly
 */

export const checkMaintenanceMode = (req: Request, res: Response, next: NextFunction) => {
    const isMaintenanceMode = process.env.MAINTENANCE_MODE === "true";

    if (isMaintenanceMode) {
        return res.status(503).json({
            success: false,
            message: "System is currently under maintenance. Please try again later.",
            error: "MAINTENANCE_MODE"
        });
    }

    next();
};

/**
 * Check if Gemini API is specifically under maintenance
 */
export const isGeminiMaintenance = (): boolean => {
    const isKeyMissing = !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "api_key_missing";
    return process.env.GEMINI_MAINTENANCE === "true" || process.env.MAINTENANCE_MODE === "true" || isKeyMissing;
};

/**
 * Get maintenance status
 */
export const getMaintenanceStatus = () => {
    return {
        maintenanceMode: process.env.MAINTENANCE_MODE === "true",
        geminiMaintenance: process.env.GEMINI_MAINTENANCE === "true",
        message: process.env.MAINTENANCE_MESSAGE || "System is under maintenance"
    };
};
