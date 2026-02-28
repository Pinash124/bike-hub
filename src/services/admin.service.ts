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
    // id = user.id (backend KycResponse has no own id field)
    id: string;
    idNumber?: string;
    fullName?: string;
    dateOfBirth?: string;
    gender?: string;
    nationality?: string;
    placeOfOrigin?: string;
    placeOfResidence?: string;
    expiryDate?: string;
    // status: derived from user.kyc boolean since KycResponse has no status field
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    submittedAt?: string;
    verifiedAt?: string;
    // nested user info (from the parent user object that contains the kycProfile)
    user?: {
        id: string;
        username: string;
        name?: string;
        kyc?: boolean;
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
            // GET /kyc/getall — returns list of users that have a kycProfile.
            // Per Swagger, each item in the result is a UserResponse with nested kycProfile.
            // KycResponse itself has: idNumber, fullName, dateOfBirth, gender, nationality,
            // placeOfOrigin, placeOfResidence, expiryDate — NO id, NO status, NO user fields.
            const response = await api.get(API_ENDPOINTS.KYC_GET_ALL);
            if (response.data?.code === 1000) {
                const raw: any[] = response.data.result ?? [];
                const normalized: KYCRequest[] = raw.map((item: any) => {
                    // Backend may return either:
                    //  (a) UserResponse (with kycProfile nested) — user is the root
                    //  (b) KycResponse directly with nested user
                    // Detect which shape we have:
                    const isUserShape = !!item.username && !!item.kycProfile;
                    const isKycShape  = !!item.user || (item.idNumber !== undefined && !item.username);

                    let user: KYCRequest['user'];
                    let kyc: any;

                    if (isUserShape) {
                        // Shape (a): item IS the user, kyc data is in item.kycProfile
                        user = {
                            id: item.id ?? '',
                            username: item.username ?? '',
                            name: item.name ?? '',
                            kyc: item.kyc === true,
                        };
                        kyc = item.kycProfile ?? {};
                    } else {
                        // Shape (b): item IS the kyc record, user nested inside
                        user = item.user ? {
                            id: item.user.id ?? '',
                            username: item.user.username ?? '',
                            name: item.user.name ?? '',
                            kyc: item.user.kyc === true,
                        } : undefined;
                        kyc = item;
                    }

                    // Status: derive from user.kyc boolean (backend KycResponse has no status field)
                    const status: 'PENDING' | 'VERIFIED' | 'REJECTED' =
                        kyc.status
                        ?? item.status
                        ?? (user?.kyc === true ? 'VERIFIED' : 'PENDING');

                    // Use user.id as the record id (needed for POST /kyc/verify { id, approved })
                    const id = user?.id || item.id || '';

                    return {
                        id,
                        idNumber: kyc.idNumber,
                        fullName: kyc.fullName || user?.name || user?.username || '',
                        dateOfBirth: kyc.dateOfBirth,
                        gender: kyc.gender,
                        nationality: kyc.nationality,
                        placeOfOrigin: kyc.placeOfOrigin,
                        placeOfResidence: kyc.placeOfResidence,
                        expiryDate: kyc.expiryDate,
                        submittedAt: kyc.submittedAt,
                        verifiedAt: kyc.verifiedAt,
                        status,
                        user,
                    };
                });
                // Deduplicate by id (in case backend returns duplicates)
                const seen = new Set<string>();
                return normalized.filter(k => {
                    if (!k.id || seen.has(k.id)) return false;
                    seen.add(k.id);
                    return true;
                });
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

    /**
     * [ADMIN] Gửi OTP tới email để tạo tài khoản inspector
     * POST /auth/send-otp
     */
    sendInspectorOTP: async (email: string): Promise<boolean> => {
        try {
            const response = await api.post(API_ENDPOINTS.SEND_OTP, { email });
            return response.data?.code === 1000;
        } catch (error) {
            console.error('Error sending OTP for inspector:', error);
            return false;
        }
    },

    /**
     * [ADMIN] Xác thực OTP để lấy verification token cho tài khoản inspector
     * POST /auth/verify-otp
     */
    verifyInspectorOTP: async (email: string, otp: string): Promise<string> => {
        try {
            const response = await api.post(API_ENDPOINTS.VERIFY_OTP, { email, otp });
            if (response.data?.code === 1000) {
                return response.data.result?.verificationToken || '';
            }
            throw new Error(response.data?.message || 'OTP verification failed');
        } catch (error) {
            console.error('Error verifying OTP for inspector:', error);
            throw error;
        }
    },

    /**
     * [ADMIN] Tạo tài khoản inspector không yêu cầu KYC
     * POST /auth/registration
     */
    createInspectorAccount: async (payload: {
        fullName: string;
        email: string;
        password: string;
        verificationToken: string;
    }): Promise<boolean> => {
        try {
            const response = await api.post(API_ENDPOINTS.REGISTRATION, {
                fullName: payload.fullName,
                password: payload.password,
                verificationToken: payload.verificationToken,
                role: 'inspector',
            });
            return response.data?.code === 1000;
        } catch (error) {
            console.error('Error creating inspector account:', error);
            return false;
        }
    },
};
