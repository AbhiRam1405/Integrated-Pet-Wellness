export const ProductCategory = {
    FOOD: 'FOOD',
    MEDICINE: 'MEDICINE',
    ACCESSORIES: 'ACCESSORIES',
    GROOMING: 'GROOMING',
    TOY: 'TOY',
    OTHER: 'OTHER',
} as const;

export type ProductCategory = (typeof ProductCategory)[keyof typeof ProductCategory];

export const OrderStatus = {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface ProductResponse {
    id: string;
    name: string;
    description: string;
    price: number;
    category: ProductCategory;
    stockQuantity: number;
    imageUrl: string;
    createdAt: string;
    updatedAt: string;
}

export interface CartItemResponse {
    id: string;
    productId: string;
    productName: string;
    productPrice: number;
    quantity: number;
    subtotal: number;
    productImageUrl: string;
}

export interface CartResponse {
    items: CartItemResponse[];
    totalAmount: number;
}

export interface OrderItemResponse {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    subtotal: number;
}

export interface TrackingEvent {
    status: string;
    location: string;
    message: string;
    timestamp: string;
}

export interface OrderResponse {
    id: string;
    userId: string;
    customerName: string;
    items: OrderItemResponse[];
    totalAmount: number;
    status: OrderStatus;
    shippingAddress: string;
    phoneNumber: string;
    trackingId?: string;
    carrier?: string;
    trackingHistory?: TrackingEvent[];
    createdAt: string;
    updatedAt: string;
}


export interface AddToCartRequest {
    productId: string;
    quantity: number;
}

export interface UpdateCartItemRequest {
    quantity: number;
}

export interface PlaceOrderRequest {
    shippingAddress: string;
    phoneNumber?: string;
    cartItemIds?: string[];
}

export interface CreatePaymentOrderRequest {
    amount: number;
}

export interface VerifyPaymentRequest {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    orderRequest: PlaceOrderRequest;
}

export interface PaymentResponse {
    id: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
    status: string;
}
