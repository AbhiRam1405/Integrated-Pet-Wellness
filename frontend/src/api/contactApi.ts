import api from './axiosConfig';

export interface ContactRequest {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export const contactApi = {
    submitContact: async (data: ContactRequest) => {
        const response = await api.post('/contact', data);
        return response.data;
    }
};
