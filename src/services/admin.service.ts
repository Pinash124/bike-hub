// src/services/admin.service.ts
// Role: ADMIN only
// Manages users (GET /user) and KYC approvals (GET /kyc/getall, POST /kyc/confirm)
import api from '../api/axiosConfig';
import { API_ENDPOINTS } from '../config/api';

// Matches Swagger UserResponse exactly
export interface AdminUser {
    id: string;
    username: string;
    name?: string;          // Swagger: "name" not "fullName"
    roles: { name: string; description?: string }[]; // Swagger: roles[] array
    kyc: boolean;           // Swagger: "kyc" boolean (KYC verified)
    // helper — computed locally
    createdAt?: string;
    status?: 'ACTIVE' | 'BANNED';
}

/** Lấy vai trò ưu tiên cao nhất từ mảng roles */
export function getPrimaryRole(user: AdminUser): string {
    const priority = ['ADMIN', 'INSPECTOR', 'SELLER', 'BUYER']
    for (const p of priority) {
        if (user.roles?.some(r => r.name === p)) return p
    }
    return user.roles?.[0]?.name ?? 'UNKNOWN'
}

export interface KYCRequest {
    id: string;
    idNumber?: string;
    fullName?: string;
    dateOfBirth?: string;
    gender?: string;
    nationality?: string;
    placeOfOrigin?: string;
    placeOfResidence?: string;
    expiryDate?: string;
    // status theo Swagger: PENDING | VERIFIED | REJECTED
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    submittedAt?: string;
    verifiedAt?: string;
    // nested user info
    user?: {
        id: string;
        username: string;
        name?: string;
    };
}

export const adminService = {
    /**
     * [ADMIN] Lấy toàn bộ danh sách người dùng
     * GET /user
     */
    getAllUsers: async (): Promise<AdminUser[]> => {
        try {
            const response = await api.get(API_ENDPOINTS.USER_LIST);
            if (response.data?.code === 1000) {
                const raw: any[] = response.data.result ?? [];
                return raw.map(u => ({
                    ...u,
                    // ensure roles is always an array
                    roles: Array.isArray(u.roles) ? u.roles : [],
                } as AdminUser));
            }
            return [];
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    },

    /**
     * [ADMIN] Lấy tất cả yêu cầu KYC
     * GET /kyc/getall
     */
    getAllKYCRequests: async (): Promise<KYCRequest[]> => {
        try {
            const response = await api.get(API_ENDPOINTS.KYC_GET_ALL);
            if (response.data?.code === 1000) {
                const raw: any[] = response.data.result ?? [];
                // Backend trả về JSON có circular reference (user→kycProfile→user→...)
                // Chỉ lấy các fields cần thiết, tránh spread toàn bộ object
                const normalized: KYCRequest[] = raw.map(k => {
                    // Trích xuất user an toàn (tránh circular kycProfile)
                    const user = k.user ? {
                        id: k.user.id ?? '',
                        username: k.user.username ?? '',
                        name: k.user.name ?? '',
                    } : undefined;

                    // Nếu backend không trả status: dùng kycProfile.status nếu có,
                    // hoặc suy từ user.kyc boolean
                    const status: 'PENDING' | 'VERIFIED' | 'REJECTED' =
                        k.status
                        ?? k.kycProfile?.status
                        ?? (k.user?.kyc === true ? 'VERIFIED' : 'PENDING');

                    return {
                        id: k.id ?? '',
                        idNumber: k.idNumber,
                        fullName: k.fullName || user?.name || user?.username || '',
                        dateOfBirth: k.dateOfBirth,
                        gender: k.gender,
                        nationality: k.nationality,
                        placeOfOrigin: k.placeOfOrigin,
                        placeOfResidence: k.placeOfResidence,
                        expiryDate: k.expiryDate,
                        submittedAt: k.submittedAt,
                        verifiedAt: k.verifiedAt,
                        status,
                        user,
                    };
                });
                return normalized;
            }
            return [];
        } catch (error: any) {
            console.error('[KYC] Error fetching KYC requests:', error?.response?.status, error?.message);
            return [];
        }
    },

    /**
     * [ADMIN] Phê duyệt yêu cầu KYC
     * POST /kyc/confirm
     */
    confirmKYC: async (draftId: string): Promise<boolean> => {
        try {
            const response = await api.post(API_ENDPOINTS.CONFIRM_KYC, { draftId });
            return response.data?.code === 1000;
        } catch (error) {
            console.error('Error confirming KYC:', error);
            return false;
        }
    },

    /**
     * [ADMIN] Xác thực hoặc từ chối KYC
     * POST /kyc/verify  { id, approved: true/false }
     */
    verifyKYC: async (id: string, approved: boolean): Promise<boolean> => {
        try {
            const response = await api.post(API_ENDPOINTS.KYC_VERIFY, { id, approved });
            return response.data?.code === 1000;
        } catch (error) {
            console.error('Error verifying KYC:', error);
            return false;
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

    /**
     * [ADMIN] Quản lý brand — Cập nhật
     * PUT /brand
     */
    updateBrands: async (payload: { brands: { id: number; name: string }[] }): Promise<boolean> => {
        try {
            const response = await api.put(API_ENDPOINTS.BRAND, payload);
            return response.data?.code === 1000;
        } catch (error) {
            console.error('Error updating brands:', error);
            return false;
        }
    },

    /**
     * [ADMIN] Xóa brand
     * DELETE /brand/{brandId}
     */
    deleteBrand: async (brandId: number): Promise<boolean> => {
        try {
            const response = await api.delete(API_ENDPOINTS.BRAND_DETAIL(String(brandId)));
            return response.data?.code === 1000;
        } catch (error) {
            console.error('Error deleting brand:', error);
            return false;
        }
    },
};
