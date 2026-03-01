import axiosInstance from './axiosConfig';

export const reportApi = {
    getPetHealthReport: async (petId: string) => {
        const response = await axiosInstance.get(`/report/pet/${petId}`, {
            responseType: 'blob',
        });
        return response.data;
    },
};
