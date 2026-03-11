// src/services/subscription.service.ts
import api from '../api/axiosConfig';
import { API_ENDPOINTS } from '../config/api';

export interface SubscriptionCreatePayload {
    planId: number;
    listingId: string;
}

export interface Subscription {
    id: string;
    listingId: string;
    planId: number;
    startDate: string;
    endDate: string;
    userId: string;
    status: 'ACTIVE' | 'EXPIRED' | 'PENDING_PAYMENT' | 'PENDING';
}

export const subscriptionService = {
    /**
     * [SELLER] Tạo gói đăng ký cho xe
     * POST /subscription
     */
    createSubscription: async (payload: SubscriptionCreatePayload): Promise<Subscription | null> => {
        try {
            const response = await api.post(API_ENDPOINTS.SUBSCRIPTION, payload);
            if (response.data?.code === 1000) {
                return response.data.result;
            }
            throw new Error(response.data?.message || 'Tạo subscription thất bại');
        } catch (error: any) {
            const serverMsg = error.response?.data?.message;
            console.error('Error creating subscription:', serverMsg || error.message || error);
            throw error;
        }
    },

    /**
     * [SELLER] Lấy thông tin subscription theo mã xe
     * GET /subscription/{listingId}
     */
    getSubscriptionByListingId: async (listingId: string): Promise<Subscription | null> => {
        try {
            const response = await api.get(API_ENDPOINTS.SUBSCRIPTION_BY_LISTING(listingId));
            if (response.data?.code === 1000) {
                const result = response.data.result;
                if (Array.isArray(result)) return result[0] ?? null;
                return result ?? null;
            }
            return null;
        } catch (error) {
            // Optional: Handle 404 cleanly since some might not have subs yet
            // console.error(`Error fetching subscription for listing ${listingId}:`, error);
            return null;
        }
    },
};
