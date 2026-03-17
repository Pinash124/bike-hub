// src/services/payment.service.ts
import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../config/api";

export interface PaymentCreationResponse {
  paymentUrl: string;
}

export interface PaymentResponse {
  paymentId: number;
  type: "PAYMENT" | "PAYOUT" | "REFUND";
  referenceId: string;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
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
  createOrderPayment: async (
    listingId: string,
  ): Promise<PaymentCreationResponse | null> => {
    try {
      const response = await api.post(API_ENDPOINTS.PAYMENT_CREATE_ORDER, {
        listingId,
      });
      if (response.data?.code === 1000) return response.data.result;
      throw new Error(
        response.data?.message || "Tạo liên kết thanh toán thất bại",
      );
    } catch (error: any) {
      console.error(
        "Error creating order payment:",
        error?.response?.data?.message || error.message,
      );
      throw error;
    }
  },

  // Kept for temporary compatibility with older call-sites.
  createPayment: async (
    payload: { listingId?: string } | string,
  ): Promise<PaymentCreationResponse | null> => {
    const listingId =
      typeof payload === "string" ? payload : payload?.listingId;
    if (!listingId) {
      throw new Error(
        "Thiếu listingId cho createPayment. Dùng createOrderPayment(listingId).",
      );
    }
    return paymentService.createOrderPayment(listingId);
  },

  createSubscriptionPayment: async (
    subscriptionId: string,
  ): Promise<PaymentCreationResponse | null> => {
    try {
      const response = await api.post(
        API_ENDPOINTS.PAYMENT_CREATE_SUBSCRIPTION,
        { subscriptionId },
      );
      if (response.data?.code === 1000) return response.data.result;
      throw new Error(response.data?.message || "Tạo thanh toán gói thất bại");
    } catch (error: any) {
      console.error(
        "Error creating subscription payment:",
        error?.response?.data?.message || error.message,
      );
      throw error;
    }
  },

  getAllPayments: async (): Promise<PaymentResponse[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.PAYMENT_ALL);
      if (response.data?.code === 1000) return response.data.result ?? [];
      return [];
    } catch (error) {
      console.error("Error fetching all payments:", error);
      return [];
    }
  },

  getMyPayments: async (): Promise<PaymentResponse[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.PAYMENT_MY);
      if (response.data?.code === 1000) return response.data.result ?? [];
      return [];
    } catch (error) {
      console.error("Error fetching my payments:", error);
      return [];
    }
  },
};
