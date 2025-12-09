import { Router } from "express";
import {
    getFolders,
    getFolderTree,
    createFolder,
    updateFolder,
    deleteFolder,
} from "../controllers/folder.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get("/", getFolders);
router.get("/tree", getFolderTree);
router.post("/", createFolder);
router.patch("/:id", updateFolder);
router.delete("/:id", deleteFolder);

export default router;
