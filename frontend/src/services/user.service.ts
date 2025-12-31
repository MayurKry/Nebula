import axiosInstance from "@/api/axiosInstance";

export interface Activity {
    _id: string;
    type: "generation" | "login" | "profile_update" | "settings_change" | "security_alert";
    action: string;
    description: string;
    metadata?: Record<string, any>;
    status: "success" | "failure" | "warning";
    createdAt: string;
}

export interface ActivityLogResponse {
    activities: Activity[];
    total: number;
    limit: number;
    skip: number;
}

class UserService {
    async getActivityLog(limit: number = 20, skip: number = 0): Promise<ActivityLogResponse> {
        const response = await axiosInstance.get<{
            success: boolean;
            message: string;
            data: ActivityLogResponse;
        }>(`/users/activity-log?limit=${limit}&skip=${skip}`);

        return response.data.data;
    }
}

export const userService = new UserService();
export default userService;
