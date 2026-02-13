import api from './axiosConfig';
import type { UserProfileResponse, UpdateProfileRequest, ChangePasswordRequest, MessageResponse } from '../types/user';

export const userApi = {
    getProfile: async () => {
        const response = await api.get<UserProfileResponse>('/users/profile');
        return response.data;
    },

    updateProfile: async (data: UpdateProfileRequest) => {
        const response = await api.put<UserProfileResponse>('/users/profile', data);
        return response.data;
    },

    changePassword: async (data: ChangePasswordRequest) => {
        const response = await api.put<MessageResponse>('/users/change-password', data);
        return response.data;
    },
};
