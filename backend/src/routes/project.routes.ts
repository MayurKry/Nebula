import { Router } from "express";
import {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    getRecentProjects,
} from "../controllers/project.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get("/", getProjects);
router.get("/recent", getRecentProjects);
router.get("/:id", getProject);
router.post("/", createProject);
router.patch("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;
