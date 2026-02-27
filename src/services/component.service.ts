// src/services/component.service.ts
// Role: INSPECTOR (read), ADMIN (full CRUD)
// Manages bike inspection checklist components (e.g., Engine, Tires, Frame)
import api from '../api/axiosConfig';
import { API_ENDPOINTS } from '../config/api';

export interface InspectionComponent {
    id: number;
    name: string;
    description?: string;
    maxScore?: number;
    isActive?: boolean;
}

export interface ComponentPayload {
    name: string;
    description?: string;
    maxScore?: number;
}

export const componentService = {
    /**
     * [INSPECTOR/ADMIN] Lấy tất cả hạng mục kiểm tra
     * GET /component
     */
    getAllComponents: async (): Promise<InspectionComponent[]> => {
        try {
            const response = await api.get(API_ENDPOINTS.COMPONENT);
            if (response.data?.code === 1000) {
                return response.data.result ?? [];
            }
            return [];
        } catch (error) {
            console.error('Error fetching components:', error);
            return [];
        }
    },

    /**
     * [ADMIN] Tạo hạng mục kiểm tra mới
     * POST /component
     */
    createComponent: async (payload: ComponentPayload): Promise<InspectionComponent | null> => {
        try {
            const response = await api.post(API_ENDPOINTS.COMPONENT, payload);
            if (response.data?.code === 1000) {
                return response.data.result;
            }
            throw new Error(response.data?.message || 'Tạo hạng mục thất bại');
        } catch (error) {
            console.error('Error creating component:', error);
            throw error;
        }
    },

    /**
     * [ADMIN] Cập nhật hạng mục kiểm tra
     * PUT /component/{id}
     */
    updateComponent: async (id: number, payload: Partial<ComponentPayload>): Promise<InspectionComponent | null> => {
        try {
            const response = await api.put(API_ENDPOINTS.COMPONENT_DETAIL(String(id)), payload);
            if (response.data?.code === 1000) {
                return response.data.result;
            }
            throw new Error(response.data?.message || 'Cập nhật hạng mục thất bại');
        } catch (error) {
            console.error('Error updating component:', error);
            throw error;
        }
    },

    /**
     * [ADMIN] Xóa hạng mục kiểm tra
     * DELETE /component/{id}
     */
    deleteComponent: async (id: number): Promise<boolean> => {
        try {
            const response = await api.delete(API_ENDPOINTS.COMPONENT_DETAIL(String(id)));
            return response.data?.code === 1000;
        } catch (error) {
            console.error('Error deleting component:', error);
            return false;
        }
    },
};
