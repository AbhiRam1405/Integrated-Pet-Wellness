import api from './axiosConfig';
import type { MedicalHistoryResponse } from '../types/pet';

export const medicalHistoryApi = {
    addMedicalHistory: async (formData: FormData) => {
        const response = await api.post<string>('/medical-history/add', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getMedicalHistory: async (petId: string) => {
        const response = await api.get<MedicalHistoryResponse[]>(`/medical-history/${petId}`);
        return response.data;
    },
};
