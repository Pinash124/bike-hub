// src/services/payment.service.ts
import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../config/api";

export interface PaymentCreationResponse {
  paymentUrl: string;
}

export interface PaymentResponse {
  paymentId: number;
  type: "PAYMENT" | "PAYOUT" | "REFUND";
  referenceType?: "ORDER" | "SUBSCRIPTION" | null;
  referenceId: string;
  amount: number;
  status:
    | "PENDING"
    | "SUCCESS"
    | "FAILED"
    | "REFUNDED"
    | "PAID"
    | "COMPLETED"
    | "EXPIRED"
    | "CANCELLED";
  transactionRef: string;
  payosOrderCode: number | null;
  paidAt: string | null;
  createAt: string;
  // Legacy/alternate fields for existing UI compatibility.
  id?: string | number;
  orderId?: string | number;
  subscriptionId?: string | number;
  description?: string;
  createdAt?: string;
}

export type PaymentResult = PaymentResponse;

const parsePaymentTime = (value?: string): number => {
  if (!value) return 0;
  const trimmed = value.trim();

  // BE format: DD-MM-YYYY HH:mm[:ss]
  const m = trimmed.match(
    /^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );
  if (m) {
    const [, dd, mm, yyyy, hh, min, ss] = m;
    const parsed = new Date(
      `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss ?? "00"}`,
    ).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const fallback = new Date(trimmed).getTime();
  return Number.isFinite(fallback) ? fallback : 0;
};

export const paymentService = {
  createOrderPayment: async (
    listingId: string,
  ): Promise<PaymentCreationResponse | null> => {
    // Tạo link thanh toán cho đơn hàng theo listingId
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
      if (response.data?.code === 1000 || response.data?.code === 0) {
        return response.data.result ?? [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching all payments:", error);
      return [];
    }
  },

  getMyPayments: async (): Promise<PaymentResponse[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.PAYMENT_MY);
      if (response.data?.code === 1000 || response.data?.code === 0) {
        const payments: PaymentResponse[] = response.data.result ?? [];
        return [...payments].sort((a, b) => {
          const aTime = parsePaymentTime(a.createAt || a.createdAt);
          const bTime = parsePaymentTime(b.createAt || b.createdAt);
          return bTime - aTime;
        });
      }
      return [];
    } catch (error) {
      console.error("Error fetching my payments:", error);
      return [];
    }
  },
};
