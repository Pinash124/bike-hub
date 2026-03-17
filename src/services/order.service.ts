// src/services/order.service.ts
import api from '../api/axiosConfig';
import { API_ENDPOINTS } from '../config/api';
import type { Listing } from './listing.service';

export type OrderStatus =
  | 'PENDING'
  | 'EXPIRED'
  | 'PAID'
  | 'REFUND'
  | 'IN_TRANSIT'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CONFIRMED'
  | 'COMPLETE'
  | 'COMPLETED'
  | 'CANCELLED';

export type SellerStatus = 'PENDING' | 'ACCEPTED' | 'CANCELLED' | 'REJECTED' | 'PAID';

export interface OrderUser {
  id: string;
  username: string;
  name: string;
}

export interface Order {
  id: string;
  buyer: OrderUser;
  seller: OrderUser;
  listing: Listing | null;
  orderStatus: OrderStatus;
  sellerStatus: SellerStatus;
  createdAt: string;
  expiresAt: string;
  // Backward-compatible aliases for legacy UI screens.
  status: OrderStatus;
  buyerId: string;
  listingId: string;
  totalPrice: number;
}

export interface OrderLog {
  id: number;
  status: OrderStatus;
  createdAt: string;
  image?: string;
}

function normaliseOrder(raw: any): Order {
  const listing = raw?.listing ?? null;
  const rawStatus = String(raw?.orderStatus ?? raw?.status ?? 'PENDING').toUpperCase();
  const statusMap: Record<string, OrderStatus> = {
    SHIPPING: 'IN_TRANSIT',
    COMPLETED: 'COMPLETE',
  };
  const orderStatus = (statusMap[rawStatus] ?? rawStatus) as OrderStatus;

  return {
    ...raw,
    listing,
    orderStatus,
    status: orderStatus,
    buyerId: raw?.buyer?.id ?? '',
    listingId: listing?.id ?? '',
    totalPrice: typeof listing?.price === 'number' ? listing.price : 0,
  };
}

export const orderService = {
  getMyOrders: async (): Promise<Order[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.ORDER_MY);
      if (response.data?.code === 1000) {
        const rows = Array.isArray(response.data.result) ? response.data.result : [];
        return rows.map(normaliseOrder);
      }
      return [];
    } catch (error) {
      console.error('Error fetching my orders:', error);
      return [];
    }
  },

  getAllOrders: async (): Promise<Order[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.ORDER_ALL);
      if (response.data?.code === 1000) {
        const rows = Array.isArray(response.data.result) ? response.data.result : [];
        return rows.map(normaliseOrder);
      }
      return [];
    } catch (error) {
      console.error('Error fetching all orders:', error);
      return [];
    }
  },

  getOrderById: async (id: string): Promise<Order | null> => {
    try {
      const response = await api.get(API_ENDPOINTS.ORDER_DETAIL(id));
      if (response.data?.code === 1000) return normaliseOrder(response.data.result);
      return null;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  },

  acceptOrder: async (id: string): Promise<boolean> => {
    try {
      const response = await api.put(API_ENDPOINTS.ORDER_ACCEPT(id));
      return response.data?.code === 1000;
    } catch (error) {
      console.error('Error accepting order:', error);
      return false;
    }
  },

  rejectOrder: async (id: string): Promise<boolean> => {
    try {
      const response = await api.put(API_ENDPOINTS.ORDER_REJECT(id));
      return response.data?.code === 1000;
    } catch (error) {
      console.error('Error rejecting order:', error);
      return false;
    }
  },

  deliverOrder: async (id: string, imageFile: File): Promise<Order | null> => {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      const response = await api.put(API_ENDPOINTS.ORDER_DELIVERED(id), formData);
      if (response.data?.code === 1000) return normaliseOrder(response.data.result);
      return null;
    } catch (error) {
      console.error('Error delivering order:', error);
      throw error;
    }
  },

  claimOrder: async (id: string): Promise<Order | null> => {
    try {
      const response = await api.put(API_ENDPOINTS.ORDER_CLAIM(id));
      if (response.data?.code === 1000) return normaliseOrder(response.data.result);
      return null;
    } catch (error) {
      console.error('Error claiming order:', error);
      throw error;
    }
  },

  getOrderLog: async (orderId: string): Promise<OrderLog[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.ORDER_LOG_BY_ORDER(orderId));
      if (response.data?.code === 1000) return response.data.result ?? [];
      return [];
    } catch (error) {
      console.error('Error fetching order log:', error);
      return [];
    }
  },

  // Legacy compatibility shim.
  createOrder: async (_payload: { listingId: string; description?: string }): Promise<Order | null> => {
    throw new Error('createOrder đã bị BE loại bỏ. Hãy dùng paymentService.createOrderPayment(listingId).');
  },

  // Legacy compatibility shim.
  cancelOrder: async (_orderId: string): Promise<boolean> => {
    throw new Error('cancelOrder không còn được hỗ trợ trong flow mới.');
  },
};
