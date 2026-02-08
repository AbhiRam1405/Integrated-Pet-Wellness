import api from './axiosConfig';
import type { PetRequest, PetResponse, HealthRecordRequest, HealthRecordResponse } from '../types/pet';

export const petApi = {
    // Pet operations
    registerPet: async (data: PetRequest) => {
        const response = await api.post<PetResponse>('/pets', data);
        return response.data;
    },

    getAllPets: async () => {
        const response = await api.get<PetResponse[]>('/pets');
        return response.data;
    },

    getPetById: async (id: string) => {
        const response = await api.get<PetResponse>(`/pets/${id}`);
        return response.data;
    },

    updatePet: async (id: string, data: Partial<PetRequest>) => {
        const response = await api.put<PetResponse>(`/pets/${id}`, data);
        return response.data;
    },

    deletePet: async (id: string) => {
        await api.delete(`/pets/${id}`);
    },

    // Health Record operations
    addHealthRecord: async (petId: string, data: HealthRecordRequest) => {
        const response = await api.post<HealthRecordResponse>(`/pets/${petId}/health-records`, data);
        return response.data;
    },

    getHealthRecords: async (petId: string) => {
        const response = await api.get<HealthRecordResponse[]>(`/pets/${petId}/health-records`);
        return response.data;
    },

    updateHealthRecord: async (petId: string, recordId: string, data: Partial<HealthRecordRequest>) => {
        const response = await api.put<HealthRecordResponse>(`/pets/${petId}/health-records/${recordId}`, data);
        return response.data;
    },

    deleteHealthRecord: async (petId: string, recordId: string) => {
        await api.delete(`/pets/${petId}/health-records/${recordId}`);
    },
};
