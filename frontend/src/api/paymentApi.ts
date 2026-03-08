import api from './axiosConfig';
import type {
    CreatePaymentOrderRequest,
    VerifyPaymentRequest,
    PaymentResponse,
    OrderResponse
} from '../types/marketplace';

export const paymentApi = {
    createOrder: async (data: CreatePaymentOrderRequest) => {
        const response = await api.post<PaymentResponse>('/payments/create-order', data);
        return response.data;
    },

    verifyPayment: async (data: VerifyPaymentRequest) => {
        const response = await api.post<OrderResponse>('/payments/verify', data);
        return response.data;
    }
};
