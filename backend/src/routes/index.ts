import { Router } from "express";
import userRoutes from "./user.routes";
import adminRoutes from "./admin.routes";
import authRoutes from "./auth.routes";
import projectRoutes from "./project.routes";
import assetRoutes from "./asset.routes";
import folderRoutes from "./folder.routes";
import aiRoutes from "./ai.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/admins", adminRoutes);
router.use("/projects", projectRoutes);
router.use("/assets", assetRoutes);
router.use("/folders", folderRoutes);
router.use("/ai", aiRoutes);

export default router;

