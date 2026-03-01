import api from './axiosConfig';
import type { VaccinationResponse, VaccinationAudit } from '../types/pet';

export const vaccinationApi = {
    /**
     * Add a new vaccination record (multipart/form-data for optional file upload).
     */
    addVaccination: async (formData: FormData): Promise<VaccinationResponse> => {
        const response = await api.post<VaccinationResponse>('/vaccination/add', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Get all vaccinations for a pet, sorted by next due date with pagination.
     */
    getVaccinations: async (petId: string, page: number = 0, size: number = 15): Promise<any> => {
        const response = await api.get<any>(`/vaccination/${petId}?page=${page}&size=${size}`);
        return response.data;
    },


    /**
     * Update a vaccination record (mark as COMPLETED or update overdue dates).
     */
    updateVaccination: async (id: string, givenDate?: string, nextDueDate?: string, doctorName?: string): Promise<VaccinationResponse> => {
        const response = await api.put<VaccinationResponse>(`/vaccination/update/${id}`, null, {
            params: { givenDate, nextDueDate, doctorName },
        });
        return response.data;
    },

    /**
     * Add next dose for a vaccination record.
     */
    addNextDose: async (id: string, nextDueDate: string): Promise<VaccinationResponse> => {
        const response = await api.post<VaccinationResponse>(`/vaccination/${id}/next-dose`, null, {
            params: { nextDueDate },
        });
        return response.data;
    },

    /**
     * Get vaccination audit history.
     */
    getHistory: async (id: string): Promise<VaccinationAudit[]> => {
        const response = await api.get<VaccinationAudit[]>(`/vaccination/${id}/history`);
        return response.data;
    },
};
