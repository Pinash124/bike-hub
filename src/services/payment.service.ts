// src/services/payment.service.ts
// Role: BUYER — Initiate payment for an order
import api from '../api/axiosConfig';
import { API_ENDPOINTS } from '../config/api';

export interface PaymentCreatePayload {
    orderId: string;
    method?: 'STRIPE' | 'BANK_TRANSFER' | 'COD';
    returnUrl?: string;
}

export interface PaymentResult {
    paymentId: string;
    orderId: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
    amount: number;
    paymentUrl?: string; // Stripe redirect URL if applicable
    createdAt: string;
}

export const paymentService = {
    /**
     * [BUYER] Khởi tạo giao dịch thanh toán
     * POST /payment/create
     */
    createPayment: async (payload: PaymentCreatePayload): Promise<PaymentResult | null> => {
        try {
            const response = await api.post(API_ENDPOINTS.PAYMENT_CREATE, payload);
            if (response.data?.code === 1000) {
                return response.data.result;
            }
            throw new Error(response.data?.message || 'Khởi tạo thanh toán thất bại');
        } catch (error) {
            console.error('Error creating payment:', error);
            throw error;
        }
    },

    /**
     * [BUYER] Kiểm tra trạng thái thanh toán
     * GET /payment/{orderId}/status
     */
    getPaymentStatus: async (orderId: string): Promise<PaymentResult | null> => {
        try {
            const response = await api.get(API_ENDPOINTS.PAYMENT_STATUS(orderId));
            if (response.data?.code === 1000) {
                return response.data.result;
            }
            return null;
        } catch (error) {
            console.error('Error getting payment status:', error);
            return null;
        }
    },
};
