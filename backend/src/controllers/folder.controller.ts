import { Request, Response } from "express";
import { FolderModel } from "../models/folder.model";
import { asyncHandler } from "../utils/asyncHandler";
import { responseHandler } from "../utils/responseHandler";

// Get all folders for current user
export const getFolders = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { parentId } = req.query;

    const filter: any = { userId };
    if (parentId) {
        filter.parentId = parentId;
    } else {
        filter.parentId = { $exists: false };
    }

    const folders = await FolderModel.find(filter).sort({ name: 1 });

    return responseHandler(res, 200, "Folders retrieved successfully", folders);
});

// Get folder tree
export const getFolderTree = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const folders = await FolderModel.find({ userId }).sort({ name: 1 });

    // Build tree structure
    const buildTree = (parentId: string | null): any[] => {
        return folders
            .filter((f) =>
                parentId === null
                    ? !f.parentId
                    : f.parentId?.toString() === parentId
            )
            .map((folder) => ({
                ...folder.toObject(),
                children: buildTree(folder._id.toString()),
            }));
    };

    const tree = buildTree(null);

    return responseHandler(res, 200, "Folder tree retrieved", tree);
});

// Create folder
export const createFolder = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { name, parentId, color, icon } = req.body;

    const folder = await FolderModel.create({
        name,
        parentId,
        color,
        icon,
        userId,
    });

    return responseHandler(res, 201, "Folder created successfully", folder);
});

// Update folder
export const updateFolder = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?._id;
    const updates = req.body;

    const folder = await FolderModel.findOneAndUpdate(
        { _id: id, userId },
        updates,
        { new: true }
    );

    if (!folder) {
        return responseHandler(res, 404, "Folder not found");
    }

    return responseHandler(res, 200, "Folder updated successfully", folder);
});

// Delete folder
export const deleteFolder = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?._id;

    // Check if folder has children
    const hasChildren = await FolderModel.exists({ parentId: id, userId });
    if (hasChildren) {
        return responseHandler(res, 400, "Cannot delete folder with subfolders");
    }

    const folder = await FolderModel.findOneAndDelete({ _id: id, userId });

    if (!folder) {
        return responseHandler(res, 404, "Folder not found");
    }

    return responseHandler(res, 200, "Folder deleted successfully");
});
