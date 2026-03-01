import api from './axiosConfig';

export const medicalHistoryApi = {
    addMedicalHistory: async (formData: FormData) => {
        const response = await api.post<string>('/medical-history/add', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getMedicalHistory: async (petId: string, page: number = 0, size: number = 15) => {
        const response = await api.get<any>(`/medical-history/${petId}?page=${page}&size=${size}`);
        return response.data;
    },

};
