import api from './axiosConfig';
import type { UserProfileResponse, MessageResponse } from '../types/user';
import type { ProductResponse, ProductCategory } from '../types/marketplace';
import type { AppointmentSlotResponse, ConsultationType } from '../types/appointment';

export const adminApi = {
    // User Management
    getPendingUsers: async () => {
        const response = await api.get<UserProfileResponse[]>('/admin/users/pending');
        return response.data;
    },

    getAllUsers: async () => {
        const response = await api.get<UserProfileResponse[]>('/admin/users');
        return response.data;
    },

    approveUser: async (username: string) => {
        const response = await api.put<MessageResponse>(`/admin/users/${username}/approve`);
        return response.data;
    },

    rejectUser: async (username: string, reason: string) => {
        const response = await api.delete<MessageResponse>(`/admin/users/${username}`, {
            data: { reason }
        });
        return response.data;
    },

    // Product Management
    createProduct: async (data: {
        name: string;
        description: string;
        price: number;
        category: ProductCategory;
        stockQuantity: number;
        imageUrl?: string;
    }) => {
        const response = await api.post<ProductResponse>('/admin/products', data);
        return response.data;
    },

    updateProduct: async (id: string, data: any) => {
        const response = await api.put<ProductResponse>(`/admin/products/${id}`, data);
        return response.data;
    },

    deleteProduct: async (id: string) => {
        await api.delete(`/admin/products/${id}`);
    },

    // Slot Management
    createSlot: async (data: {
        date: string;
        time: string;
        consultationType: ConsultationType;
        veterinarianName: string;
        duration: number;
    }) => {
        const response = await api.post<AppointmentSlotResponse>('/admin/appointments/slots', data);
        return response.data;
    },

    updateSlot: async (id: string, data: any) => {
        const response = await api.put<AppointmentSlotResponse>(`/admin/appointments/slots/${id}`, data);
        return response.data;
    },

    deleteSlot: async (id: string) => {
        await api.delete(`/admin/appointments/slots/${id}`);
    },
};
