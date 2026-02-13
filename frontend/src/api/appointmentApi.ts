import api from './axiosConfig';
import type {
    AppointmentSlotResponse,
    BookAppointmentRequest,
    AppointmentResponse
} from '../types/appointment';
import type { MessageResponse } from '../types/auth';

export const appointmentApi = {
    getAvailableSlots: async () => {
        const response = await api.get<AppointmentSlotResponse[]>('/appointments/slots/available');
        return response.data;
    },

    bookAppointment: async (data: BookAppointmentRequest) => {
        const response = await api.post<AppointmentResponse>('/appointments/book', data);
        return response.data;
    },

    getMyAppointments: async () => {
        const response = await api.get<AppointmentResponse[]>('/appointments/my-appointments');
        return response.data;
    },

    getAppointmentDetails: async (id: string) => {
        const response = await api.get<AppointmentResponse>(`/appointments/${id}`);
        return response.data;
    },

    cancelAppointment: async (id: string) => {
        const response = await api.put<MessageResponse>(`/appointments/${id}/cancel`);
        return response.data;
    },
};
