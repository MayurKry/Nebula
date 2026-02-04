import { Router } from "express";
import {
    getAssets,
    getAsset,
    createAsset,
    updateAsset,
    deleteAsset,
    searchAssets,
} from "../controllers/asset.controller";
import { downloadAsset } from "../controllers/ai.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get("/", getAssets);
router.get("/search", searchAssets);
router.get("/download/:id", downloadAsset);
router.get("/:id", getAsset);
router.post("/", createAsset);
router.patch("/:id", updateAsset);
router.delete("/:id", deleteAsset);

export default router;
