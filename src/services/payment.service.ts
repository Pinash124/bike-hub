// src/services/payment.service.ts
// Role: BUYER — Initiate payment for an order
// Swagger: POST /payment/create/order  { order_id: number, description: string }
import api from "../api/axiosConfig";

export interface PaymentCreatePayload {
  order_id: number | string; // Swagger uses integer order_id
  description?: string;
}

export interface PaymentResult {
  paymentUrl?: string; // redirect URL if available
  paymentId?: string | number;
  status?: string;
  amount?: number;
  orderId?: string | number;
  createdAt?: string | Date;
}

export const paymentService = {
  /**
   * [BUYER] Khởi tạo giao dịch thanh toán cho đơn hàng
   * POST /payment/create/order  →  { order_id, description }
   */
  createPayment: async (
    payload: PaymentCreatePayload,
  ): Promise<PaymentResult | null> => {
    try {
      const response = await api.post("/payment/create/order", payload);
      if (response.data?.code === 1000) {
        return response.data.result;
      }
      throw new Error(response.data?.message || "Khởi tạo thanh toán thất bại");
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  },

  /**
   * [BUYER] Lấy tất cả thanh toán
   * GET /all
   */
  getAllPayments: async (): Promise<PaymentResult[]> => {
    try {
      const response = await api.get("/all");
      if (response.data?.code === 1000) {
        return Array.isArray(response.data.result) ? response.data.result : [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching all payments:", error);
      return [];
    }
  },
};
