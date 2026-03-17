// src/services/order.service.ts
// Role: BUYER/SELLER/ADMIN — manage purchase orders
import api from '../api/axiosConfig';
import { API_ENDPOINTS } from '../config/api';

export interface OrderCreatePayload {
    listingId: string;
    description?: string;
}

export interface Order {
    id: string;
    listingId: string;
    buyerId: string;
    status: string;
    totalPrice: number;
    createdAt: string;
    note?: string;
    buyer?: any;
    seller?: any;
    sellerStatus?: string;
    orderStatus?: string;
    listing?: any;
}

const normalizeOrder = (o: any): Order => ({
    ...o,
    status: o.orderStatus || o.status,
    totalPrice: o.listing?.price || o.totalPrice || 0,
    listingId: o.listing?.id || o.listingId,
});

export const orderService = {
    /**
     * [BUYER] Lấy danh sách đơn hàng của tôi
     * GET /order
     */
    getMyOrders: async (): Promise<Order[]> => {
        try {
            const response = await api.get(API_ENDPOINTS.ORDER_MY);
            if (response.data?.code === 1000) {
                const arr = response.data.result ?? [];
                return arr.map(normalizeOrder);
            }
            return [];
        } catch (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
    },

    /**
     * [ADMIN] Lấy tất cả đơn hàng trong hệ thống
     * GET /order
     */
    getAllOrders: async (): Promise<Order[]> => {
        try {
            const response = await api.get(API_ENDPOINTS.ORDER);
            if (response.data?.code === 1000) {
                const arr = Array.isArray(response.data.result) ? response.data.result : [];
                return arr.map(normalizeOrder);
            }
            return [];
        } catch (error) {
            console.error('Error fetching all orders:', error);
            return [];
        }
    },

    acceptOrder: async (orderId: string): Promise<boolean> => {
        try {
            const response = await api.put(API_ENDPOINTS.ORDER_ACCEPT(orderId));
            return response.data?.code === 1000;
        } catch (error) {
            console.error('Error accepting order:', error);
            return false;
        }
    },

    rejectOrder: async (orderId: string): Promise<boolean> => {
        try {
            const response = await api.put(API_ENDPOINTS.ORDER_REJECT(orderId));
            return response.data?.code === 1000;
        } catch (error) {
            console.error('Error rejecting order:', error);
            return false;
        }
    },

    deliverOrder: async (orderId: string, file: File): Promise<any> => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await api.put(API_ENDPOINTS.ORDER_DELIVERED(orderId), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data?.result;
        } catch (error) {
            console.error('Error reporting order delivery:', error);
            throw error;
        }
    },

    claimOrder: async (orderId: string): Promise<any> => {
        try {
            const response = await api.put(API_ENDPOINTS.ORDER_CLAIM(orderId));
            return response.data?.result;
        } catch (error) {
            console.error('Error claiming order:', error);
            throw error;
        }
    },
};
