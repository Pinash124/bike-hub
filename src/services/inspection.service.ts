// src/services/inspection.service.ts
// Role: SELLER (create), INSPECTOR (work on tasks), BUYER (view results), ADMIN (overview)
import api from '../api/axiosConfig';
import { API_ENDPOINTS } from '../config/api';

export interface InspectionTask {
    inspectionId: string;
    inspectionType: 'ONSITE' | 'COMPANY';
    status: 'PENDING' | 'PENDING_ASSIGNED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
    scheduledAt?: string;
    inspector?: any;
    location?: any;
    scores?: any[];
}

export interface ComponentScore {
    componentId: number;
    score: number;
    note?: string;
}

export const inspectionService = {
    /**
     * [ADMIN] Lấy tất cả đơn kiểm tra
     * GET /inspection
     */
    getAllInspections: async (): Promise<InspectionTask[]> => {
        try {
            const response = await api.get(API_ENDPOINTS.INSPECTION);
            if (response.data?.code === 1000) {
                return response.data.result ?? [];
            }
            return [];
        } catch (error) {
            console.error('Error fetching all inspections:', error);
            return [];
        }
    },

    /**
     * [INSPECTOR] Lấy danh sách kiểm tra đang chờ (chưa gán inspector)
     * GET /inspection/pending
     */
    getPendingInspections: async (): Promise<InspectionTask[]> => {
        try {
            const response = await api.get(API_ENDPOINTS.INSPECTION_PENDING);
            if (response.data?.code === 1000) {
                return response.data.result ?? [];
            }
            return [];
        } catch (error) {
            console.error('Error fetching pending inspections:', error);
            return [];
        }
    },

    /**
     * [INSPECTOR] Lấy các đơn kiểm tra được phân công cho mình
     * GET /inspection/my-assign
     */
    getMyAssignedInspections: async (): Promise<InspectionTask[]> => {
        try {
            const response = await api.get(API_ENDPOINTS.INSPECTION_MY_ASSIGN);
            if (response.data?.code === 1000) {
                return response.data.result ?? [];
            }
            return [];
        } catch (error) {
            console.error('Error fetching assigned inspections:', error);
            return [];
        }
    },

    /**
     * [BUYER/SELLER] Xem kết quả kiểm tra theo listingId
     * GET /inspection/{listingId}
     */
    getInspectionByListing: async (listingId: string): Promise<InspectionTask | null> => {
        try {
            const response = await api.get(API_ENDPOINTS.INSPECTION_BY_LISTING(listingId));
            if (response.data?.code === 1000) {
                return response.data.result;
            }
            return null;
        } catch (error) {
            console.error('Error fetching inspection by listing:', error);
            return null;
        }
    },

    /**
     * [SELLER] Yêu cầu kiểm tra xe của mình
     * POST /inspection
     */
    requestInspection: async (payload: {
        inspectionType: 'ONSITE' | 'COMPANY';
        inspectionLocationId?: string;
        listingId: string;
        scheduledAt: string;
    }): Promise<boolean> => {
        try {
            const response = await api.post(API_ENDPOINTS.INSPECTION, payload);
            return response.data?.code === 1000;
        } catch (error) {
            console.error('Error requesting inspection:', error);
            return false;
        }
    },

    /**
     * [INSPECTOR] Nộp điểm kiểm tra từng hạng mục
     * POST /inspection/{inspectionId}/scores
     */
    submitScores: async (inspectionId: string, scores: ComponentScore[]): Promise<boolean> => {
        try {
            const response = await api.post(API_ENDPOINTS.INSPECTION_SCORES(inspectionId), scores);
            return response.data?.code === 1000;
        } catch (error) {
            console.error('Error submitting inspection scores:', error);
            throw error;
        }
    },

    /**
     * [ADMIN] Gán inspector cho đơn kiểm tra
     * PUT /inspection/assign-inspector
     */
    assignInspector: async (payload: { inspectionId: string; inspectorId: string }): Promise<boolean> => {
        try {
            const response = await api.put(API_ENDPOINTS.INSPECTION_ASSIGN_INSPECTOR, payload);
            return response.data?.code === 1000;
        } catch (error) {
            console.error('Error assigning inspector:', error);
            return false;
        }
    },
};
