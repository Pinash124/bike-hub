// src/services/order.service.ts
// Role: BUYER — Create and track purchase orders
import api from '../api/axiosConfig';
import { API_ENDPOINTS } from '../config/api';

export interface OrderCreatePayload {
    listingId: string;
    description?: string; // Swagger: PlaceOrderRequest has listingId + description (no addressId)
}

export interface Order {
    id: string;
    listingId: string;
    buyerId: string;
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
    totalPrice: number;
    createdAt: string;
    note?: string;
}

export const orderService = {
    /**
     * [BUYER] Tạo đơn mua xe mới
     * POST /order/create  →  { listingId, description }
     */
    createOrder: async (payload: OrderCreatePayload): Promise<Order | null> => {
        try {
            const response = await api.post(API_ENDPOINTS.ORDER_CREATE, payload);
            if (response.data?.code === 1000) {
                return response.data.result;
            }
            throw new Error(response.data?.message || 'Tạo đơn hàng thất bại');
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },

    /**
     * [BUYER] Lấy danh sách đơn hàng của tôi
     * GET /order
     */
    getMyOrders: async (): Promise<Order[]> => {
        try {
            const response = await api.get(API_ENDPOINTS.ORDER);
            if (response.data?.code === 1000) {
                return response.data.result ?? [];
            }
            return [];
        } catch (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
    },

    /**
     * [ADMIN] Lấy tất cả đơn hàng trong hệ thống
     */
    getAllOrders: async (): Promise<Order[]> => {
        try {
            const response = await api.get(API_ENDPOINTS.ORDER);
            if (response.data?.code === 1000) {
                return Array.isArray(response.data.result) ? response.data.result : [];
            }
            return [];
        } catch (error) {
            console.error('Error fetching all orders:', error);
            return [];
        }
    },

    /**
     * [BUYER] Hủy đơn hàng
     * POST /order/{id}/cancel
     */
    cancelOrder: async (orderId: string): Promise<boolean> => {
        try {
            const response = await api.post(API_ENDPOINTS.ORDER_CANCEL(orderId));
            return response.data?.code === 1000;
        } catch (error) {
            console.error('Error cancelling order:', error);
            return false;
        }
    },
};
