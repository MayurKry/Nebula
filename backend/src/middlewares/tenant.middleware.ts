
import { Request, Response, NextFunction } from "express";

export const requireTenant = (req: Request, res: Response, next: NextFunction) => {
    const tenant = (req as any).tenant;

    if (!tenant) {
        return res.status(404).json({
            message: "Tenant context not found. You must be part of a tenant to access this resource."
        });
    }

    if (tenant.status === "SUSPENDED" && !(req as any).isSuperAdmin) {
        return res.status(403).json({
            message: "Your organization account has been suspended. Please contact support."
        });
    }

    if (tenant.status === "LOCKED_PAYMENT_FAIL" && req.method !== "GET") {
        return res.status(402).json({
            message: "Your organization account is locked due to payment failure."
        });
    }

    next();
};
