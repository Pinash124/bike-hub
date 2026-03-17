// src/services/orderLog.service.ts
import api from '../api/axiosConfig';
import { API_ENDPOINTS } from '../config/api';

export interface OrderLog {
  id: number;
  status: 'PENDING' | 'EXPIRED' | 'PAID' | 'REFUND' | 'IN_TRANSIT' | 'DELIVERED' | 'CONFIRMED' | 'COMPLETE' | 'CANCELLED';
  createdAt: string;
  image: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  EXPIRED: 'Hết hạn',
  PAID: 'Đã thanh toán',
  REFUND: 'Hoàn tiền',
  IN_TRANSIT: 'Đang giao xe',
  DELIVERED: 'Đã giao xe',
  CONFIRMED: 'Buyer xác nhận',
  COMPLETE: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'text-amber-600 bg-amber-50 border-amber-200',
  EXPIRED: 'text-slate-500 bg-slate-50 border-slate-200',
  PAID: 'text-blue-600 bg-blue-50 border-blue-200',
  REFUND: 'text-orange-600 bg-orange-50 border-orange-200',
  IN_TRANSIT: 'text-purple-600 bg-purple-50 border-purple-200',
  DELIVERED: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  CONFIRMED: 'text-green-600 bg-green-50 border-green-200',
  COMPLETE: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  CANCELLED: 'text-red-600 bg-red-50 border-red-200',
};

export const orderLogService = {
  getByOrderId: async (orderId: string): Promise<OrderLog[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.ORDER_LOG_BY_ORDER(orderId));
      if (response.data?.code === 1000) return response.data.result ?? [];
      return [];
    } catch (error) {
      console.error('Error fetching order logs:', error);
      return [];
    }
  },

  getById: async (id: string | number): Promise<OrderLog | null> => {
    try {
      const response = await api.get(API_ENDPOINTS.ORDER_LOG_BY_ID(id));
      if (response.data?.code === 1000) return response.data.result;
      return null;
    } catch (error) {
      console.error('Error fetching order log:', error);
      return null;
    }
  },

  getStatusLabel: (status: string): string => STATUS_LABEL[status] ?? status,
  getStatusColor: (status: string): string => STATUS_COLOR[status] ?? 'text-slate-600 bg-slate-50 border-slate-200',
};
