import api from './axiosConfig';
import type {
    ProductResponse,
    CartResponse,
    OrderResponse,
    AddToCartRequest,
    UpdateCartItemRequest,
    PlaceOrderRequest
} from '../types/marketplace';
import type { MessageResponse } from '../types/auth';

export const marketplaceApi = {
    // Product Browse
    getAllProducts: async () => {
        const response = await api.get<ProductResponse[]>('/products');
        return response.data;
    },

    getProductsByCategory: async (category: string) => {
        const response = await api.get<ProductResponse[]>(`/products/category/${category}`);
        return response.data;
    },

    searchProducts: async (query: string) => {
        const response = await api.get<ProductResponse[]>(`/products/search?query=${query}`);
        return response.data;
    },

    getProductById: async (id: string) => {
        const response = await api.get<ProductResponse>(`/products/${id}`);
        return response.data;
    },

    // Cart Management
    getCart: async () => {
        const response = await api.get<CartResponse>('/cart');
        return response.data;
    },

    addToCart: async (data: AddToCartRequest) => {
        const response = await api.post<CartResponse>('/cart/add', data);
        return response.data;
    },

    updateCartItem: async (itemId: string, data: UpdateCartItemRequest) => {
        const response = await api.put<CartResponse>(`/cart/update/${itemId}`, data);
        return response.data;
    },

    removeFromCart: async (itemId: string) => {
        const response = await api.delete<CartResponse>(`/cart/remove/${itemId}`);
        return response.data;
    },

    clearCart: async () => {
        await api.delete('/cart/clear');
    },

    // Order Management
    placeOrder: async (data: PlaceOrderRequest) => {
        const response = await api.post<OrderResponse>('/orders/place', data);
        return response.data;
    },

    getMyOrders: async () => {
        const response = await api.get<OrderResponse[]>('/orders/my-orders');
        return response.data;
    },

    getOrderById: async (id: string) => {
        const response = await api.get<OrderResponse>(`/orders/${id}`);
        return response.data;
    },

    cancelOrder: async (id: string) => {
        await api.put<MessageResponse>(`/orders/${id}/cancel`);
    },

    // Admin Order Management
    getAllOrders: async () => {
        const response = await api.get<OrderResponse[]>('/admin/orders');
        return response.data;
    },

    getAdminOrderById: async (id: string) => {
        const response = await api.get<OrderResponse>(`/admin/orders/${id}`);
        return response.data;
    },

    updateOrderStatus: async (id: string, status: string) => {
        const response = await api.put<OrderResponse>(`/admin/orders/${id}/status`, { status });
        return response.data;
    },
};
