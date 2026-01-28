import { Request, Response } from "express";
import { AssetModel } from "../models/asset.model";
import { asyncHandler } from "../utils/asyncHandler";
import { responseHandler } from "../utils/responseHandler";

// Get all assets for current user
export const getAssets = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || (req as any).user?.id || (req as any).user?._id;
    const { type, folderId, projectId, limit = 50, page = 1 } = req.query;

    const filter: any = { userId };
    console.log(`[AssetController] Fetching for userId: ${userId}`);
    if (type) filter.type = type;
    if (folderId) filter.folderId = folderId;
    if (projectId) filter.projectId = projectId;
    console.log(`[AssetController] Filter:`, filter);

    const assets = await AssetModel.find(filter)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

    const total = await AssetModel.countDocuments(filter);

    return responseHandler(res, 200, "Assets retrieved successfully", {
        assets,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
        },
    });
});

// Get single asset
export const getAsset = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user?.userId || (req as any).user?.id || (req as any).user?._id;

    const asset = await AssetModel.findOne({ _id: id, userId });

    if (!asset) {
        return responseHandler(res, 404, "Asset not found");
    }

    return responseHandler(res, 200, "Asset retrieved successfully", asset);
});

// Create/Upload asset
export const createAsset = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || (req as any).user?.id || (req as any).user?._id;
    const { name, type, url, thumbnailUrl, projectId, folderId, metadata, tags } = req.body;

    const asset = await AssetModel.create({
        name,
        type,
        url,
        thumbnailUrl,
        projectId,
        folderId,
        metadata,
        tags,
        userId,
    });

    return responseHandler(res, 201, "Asset created successfully", asset);
});

// Update asset
export const updateAsset = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user?.userId || (req as any).user?.id || (req as any).user?._id;
    const updates = req.body;

    const asset = await AssetModel.findOneAndUpdate(
        { _id: id, userId },
        updates,
        { new: true }
    );

    if (!asset) {
        return responseHandler(res, 404, "Asset not found");
    }

    return responseHandler(res, 200, "Asset updated successfully", asset);
});

// Delete asset
export const deleteAsset = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user?.userId || (req as any).user?.id || (req as any).user?._id;

    const asset = await AssetModel.findOneAndDelete({ _id: id, userId });

    if (!asset) {
        return responseHandler(res, 404, "Asset not found");
    }

    return responseHandler(res, 200, "Asset deleted successfully");
});

// Search assets
export const searchAssets = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || (req as any).user?.id || (req as any).user?._id;
    const { q, type } = req.query;

    const filter: any = { userId };
    if (type) filter.type = type;
    if (q) {
        filter.$or = [
            { name: { $regex: q, $options: "i" } },
            { tags: { $in: [new RegExp(q as string, "i")] } },
        ];
    }

    const assets = await AssetModel.find(filter)
        .sort({ createdAt: -1 })
        .limit(50);

    return responseHandler(res, 200, "Assets found", assets);
});
