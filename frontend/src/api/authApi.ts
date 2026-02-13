import api from './axiosConfig';
import type { RegisterRequest, LoginRequest, AuthResponse, MessageResponse } from '../types/auth';

export const authApi = {
    register: async (data: RegisterRequest) => {
        const response = await api.post<MessageResponse>('/auth/register', data);
        return response.data;
    },

    login: async (data: LoginRequest) => {
        const response = await api.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    verifyEmail: async (token: string) => {
        const response = await api.get<MessageResponse>(`/auth/verify-email?token=${token}`);
        return response.data;
    },

    forgotPassword: async (email: string) => {
        const response = await api.post<MessageResponse>('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (data: any) => {
        const response = await api.post<MessageResponse>('/auth/reset-password', data);
        return response.data;
    },

    verifyOtp: async (email: string, otp: string) => {
        const response = await api.post<MessageResponse>('/auth/verify-otp', { email, otp });
        return response.data;
    },

    resendOtp: async (email: string) => {
        const response = await api.post<MessageResponse>('/auth/resend-otp', { email });
        return response.data;
    },
};
