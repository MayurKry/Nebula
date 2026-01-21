import { Request, Response, NextFunction } from "express";

export const requireSuperAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = (req as any).user;

    if (!user) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    if (user.role !== "super_admin") {
        return res.status(403).json({
            message: "Access denied. Super admin privileges required."
        });
    }

    next();
};
