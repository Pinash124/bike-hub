// src/services/payment.service.ts
import api from "../api/axiosConfig";
import { API_ENDPOINTS } from '../config/api';

export interface PaymentCreatePayload {
  order_id: number | string; // Swagger uses integer order_id
  description?: string;
}

export interface PaymentResult {
  paymentUrl?: string; // redirect URL if available
  paymentId?: string | number;
  id?: string | number;
  status?: string;
  amount?: number;
  type?: string;
  referenceId?: string;
  transactionRef?: string;
  payosOrderCode?: string | number;
  orderId?: string | number;
  subscriptionId?: string | number;
  description?: string;
  createdAt?: string | Date;
  paidAt?: string | Date;
  createAt?: string | Date;
}

export const paymentService = {
  /**
   * Tạo payment link cho Đơn Hàng (Order) PayOS
   * POST /payment/create/order
   */
  createPayment: async (payload: any): Promise<PaymentResult | null> => {
    try {
      // If payload is primitive id, wrap it. If it's already an object (like from Checkout.tsx), use it.
      const body = typeof payload === 'object' ? payload : { order_id: payload };
      const response = await api.post(API_ENDPOINTS.PAYMENT_CREATE_ORDER, body);
      if (response.data?.code === 1000) {
        return response.data.result;
      }
      throw new Error(response.data?.message || 'Tạo liên kết thanh toán thất bại');
    } catch (error: any) {
      const serverMsg = error.response?.data?.message;
      console.error('Error creating payment:', serverMsg || error.message || error);
      throw error;
    }
  },

  /**
   * Tạo payment link cho Đăng Ký Gói (Subscription) qua PayOS
   * POST /payment/subscription
   */
  createSubscriptionPayment: async (subscriptionId: string): Promise<PaymentResult | null> => {
    try {
      const response = await api.post(API_ENDPOINTS.PAYMENT_CREATE_SUBSCRIPTION, {
        subscriptionId,
      });
      if (response.data?.code === 1000) {
        return response.data.result;
      }
      throw new Error(response.data?.message || 'Tạo thanh toán gói thất bại');
    } catch (error: any) {
      const serverMsg = error.response?.data?.message;
      console.error('Error creating subscription payment:', serverMsg || error.message || error);
      throw error;
    }
  },

  /**
   * [ADMIN/BUYER] Lấy tất cả thanh toán
   * GET /payment/all
   */
  getAllPayments: async (): Promise<PaymentResult[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.PAYMENT_ALL);
      if (response.data?.code === 1000) {
        return Array.isArray(response.data.result) ? response.data.result : [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching all payments:", error);
      return [];
    }
  },

  /**
   * [SELLER/BUYER] Lấy lịch sử thanh toán của tôi
   * GET /payment/my-payment
   */
  getMyPayments: async (): Promise<PaymentResult[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.PAYMENT_MY);
      if (response.data?.code === 1000) {
        return Array.isArray(response.data.result) ? response.data.result : [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching my payments:", error);
      return [];
    }
  },
};
