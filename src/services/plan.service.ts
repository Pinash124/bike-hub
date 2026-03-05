// src/services/plan.service.ts
import api from '../api/axiosConfig';
import { API_ENDPOINTS } from '../config/api';

export interface Plan {
    id: number;
    name: string;
    description: string;
    price: number;
    durationDays: number;
    isActive: boolean;
}

export const planService = {
    /**
     * [SELLER/ADMIN] Lấy tất cả các gói dịch vụ
     * GET /plan
     */
    getAllPlans: async (): Promise<Plan[]> => {
        try {
            const response = await api.get(API_ENDPOINTS.PLAN);
            if (response.data?.code === 1000) {
                const result = response.data.result;
                if (!result) return [];
                if (Array.isArray(result)) return result;
                if (Array.isArray(result.data)) return result.data;
                if (Array.isArray(result.content)) return result.content;
                return [];
            }
            throw new Error(response.data?.message || 'Không thể lấy danh sách gói cước');
        } catch (error) {
            console.error('Error fetching plans:', error);
            throw error;
        }
    },

    /**
     * [ADMIN] Tạo gói mới
     * POST /plan
     */
    createPlan: async (payload: Omit<Plan, 'id'>): Promise<Plan | null> => {
        try {
            const response = await api.post(API_ENDPOINTS.PLAN, payload);
            if (response.data?.code === 1000) return response.data.result;
            throw new Error(response.data?.message || 'Tạo gói thất bại');
        } catch (error) {
            console.error('Error creating plan:', error);
            throw error;
        }
    },

    /**
     * [ADMIN] Cập nhật gói
     * PUT /plan/{id}
     */
    updatePlan: async (id: number, payload: Partial<Plan>): Promise<Plan | null> => {
        try {
            const response = await api.put(`${API_ENDPOINTS.PLAN}/${id}`, payload);
            if (response.data?.code === 1000) return response.data.result;
            throw new Error(response.data?.message || 'Cập nhật gói thất bại');
        } catch (error) {
            console.error('Error updating plan:', error);
            throw error;
        }
    },

    /**
     * [ADMIN] Xóa gói
     * DELETE /plan/{id}
     */
    deletePlan: async (id: number): Promise<boolean> => {
        try {
            const response = await api.delete(`${API_ENDPOINTS.PLAN}/${id}`);
            return response.data?.code === 1000;
        } catch (error) {
            console.error('Error deleting plan:', error);
            throw error;
        }
    },
};
