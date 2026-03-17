// src/services/payment.service.ts
import api from '../api/axiosConfig';
import { API_ENDPOINTS } from '../config/api';

/** Response từ POST /payment/order hoặc POST /payment/subscription */
export interface PaymentCreationResponse {
  paymentUrl: string;
}

/** Response từ GET /payment/all hoặc GET /payment/my-payment */
export interface PaymentResponse {
  paymentId: number;
  type: 'PAYMENT' | 'PAYOUT' | 'REFUND';
  referenceId: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  transactionRef: string;
  payosOrderCode: number;
  paidAt: string;
  createAt: string;
  // Legacy/alternate fields for existing UI compatibility.
  id?: string | number;
  orderId?: string | number;
  subscriptionId?: string | number;
  description?: string;
  createdAt?: string;
}

export type PaymentResult = PaymentResponse;

export const paymentService = {
  /**
   * [BUYER] Tạo payment link để đặt cọc mua xe
   * POST /payment/order  →  { listingId: uuid }  →  { paymentUrl }
   * BE tự tạo Order — FE KHÔNG cần tạo order trước
   */
  createOrderPayment: async (listingId: string): Promise<PaymentCreationResponse | null> => {
    try {
      const response = await api.post(API_ENDPOINTS.PAYMENT_CREATE_ORDER, { listingId });
      if (response.data?.code === 1000) return response.data.result;
      throw new Error(response.data?.message || 'Tạo liên kết thanh toán thất bại');
    } catch (error: any) {
      console.error('Error creating order payment:', error?.response?.data?.message || error.message);
      throw error;
    }
  },

  /** @deprecated Use createOrderPayment(listingId). Kept for temporary compatibility. */
  createPayment: async (payload: { listingId?: string } | string): Promise<PaymentCreationResponse | null> => {
    const listingId = typeof payload === 'string' ? payload : payload?.listingId;
    if (!listingId) {
      throw new Error('Thiếu listingId cho createPayment. Dùng createOrderPayment(listingId).');
    }
    return paymentService.createOrderPayment(listingId);
  },

  /**
   * [SELLER] Tạo payment link trả phí đăng bán (subscription)
   * POST /payment/subscription  →  { subscriptionId: uuid }  →  { paymentUrl }
   */
  createSubscriptionPayment: async (subscriptionId: string): Promise<PaymentCreationResponse | null> => {
    try {
      const response = await api.post(API_ENDPOINTS.PAYMENT_CREATE_SUBSCRIPTION, { subscriptionId });
      if (response.data?.code === 1000) return response.data.result;
      throw new Error(response.data?.message || 'Tạo thanh toán gói thất bại');
    } catch (error: any) {
      console.error('Error creating subscription payment:', error?.response?.data?.message || error.message);
      throw error;
    }
  },

  /** [ADMIN] Tất cả lịch sử thanh toán — GET /payment/all */
  getAllPayments: async (): Promise<PaymentResponse[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.PAYMENT_ALL);
      if (response.data?.code === 1000) return response.data.result ?? [];
      return [];
    } catch (error) {
      console.error('Error fetching all payments:', error);
      return [];
    }
  },

  /** [BUYER/SELLER] Lịch sử thanh toán của mình — GET /payment/my-payment */
  getMyPayments: async (): Promise<PaymentResponse[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.PAYMENT_MY);
      if (response.data?.code === 1000) return response.data.result ?? [];
      return [];
    } catch (error) {
      console.error('Error fetching my payments:', error);
      return [];
    }
  },
};
