import { Request, Response } from "express";
import { ProjectModel } from "../models/project.model";
import { asyncHandler } from "../utils/asyncHandler";
import { responseHandler } from "../utils/responseHandler";

// Get all projects for current user
export const getProjects = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { status, type, limit = 20, page = 1 } = req.query;

    const filter: any = { userId };
    if (status) filter.status = status;
    if (type) filter.type = type;

    const projects = await ProjectModel.find(filter)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

    const total = await ProjectModel.countDocuments(filter);

    return responseHandler(res, 200, "Projects retrieved successfully", {
        projects,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
        },
    });
});

// Get single project
export const getProject = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?._id;

    const project = await ProjectModel.findOne({ _id: id, userId });

    if (!project) {
        return responseHandler(res, 404, "Project not found");
    }

    return responseHandler(res, 200, "Project retrieved successfully", project);
});

// Create project
export const createProject = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { name, description, type, prompt, style } = req.body;

    const project = await ProjectModel.create({
        name,
        description,
        type,
        prompt,
        style,
        userId,
        status: "draft",
    });

    return responseHandler(res, 201, "Project created successfully", project);
});

// Update project
export const updateProject = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?._id;
    const updates = req.body;

    const project = await ProjectModel.findOneAndUpdate(
        { _id: id, userId },
        updates,
        { new: true }
    );

    if (!project) {
        return responseHandler(res, 404, "Project not found");
    }

    return responseHandler(res, 200, "Project updated successfully", project);
});

// Delete project
export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?._id;

    const project = await ProjectModel.findOneAndDelete({ _id: id, userId });

    if (!project) {
        return responseHandler(res, 404, "Project not found");
    }

    return responseHandler(res, 200, "Project deleted successfully");
});

// Get recent projects (for dashboard)
export const getRecentProjects = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const projects = await ProjectModel.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(10);

    return responseHandler(res, 200, "Recent projects retrieved", projects);
});
