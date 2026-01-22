import axiosInstance from './axiosInstance';

export const userApi = {
    // Get full profile with stats
    getProfile: async () => {
        return axiosInstance.get('/users/profile');
    },

    // Update profile info
    updateProfile: async (data: { firstName?: string; lastName?: string; email?: string }) => {
        return axiosInstance.put('/users/profile', data);
    },

    // Change password
    changePassword: async (data: { oldPassword: string; newPassword: string }) => {
        return axiosInstance.post('/users/change-password', data);
    },

    // Get activity log
    getActivityLog: async (limit = 20) => {
        return axiosInstance.get(`/users/activity-log?limit=${limit}`);
    }
};
