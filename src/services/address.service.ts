// src/services/address.service.ts
// Role: BUYER, SELLER — manage delivery addresses
import api from '../api/axiosConfig';
import { API_ENDPOINTS } from '../config/api';

export interface Address {
    id: number;
    fullName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    detail: string;
    isDefault?: boolean;
}

export type AddressPayload = Omit<Address, 'id'>;

export const addressService = {
    /**
     * [BUYER/SELLER] Lấy danh sách địa chỉ của mình
     * GET /address/my-address
     */
    getMyAddresses: async (): Promise<Address[]> => {
        try {
            const response = await api.get(API_ENDPOINTS.ADDRESS_MY);
            if (response.data?.code === 1000) {
                return response.data.result ?? [];
            }
            return [];
        } catch (error) {
            console.error('Error fetching addresses:', error);
            return [];
        }
    },

    /**
     * [BUYER/SELLER] Thêm địa chỉ mới
     * POST /address
     */
    addAddress: async (data: AddressPayload): Promise<Address | null> => {
        try {
            const response = await api.post(API_ENDPOINTS.ADDRESS, data);
            if (response.data?.code === 1000) {
                return response.data.result;
            }
            return null;
        } catch (error) {
            console.error('Error adding address:', error);
            throw error;
        }
    },

    /**
     * [BUYER/SELLER] Cập nhật địa chỉ
     * PUT /address/{id}
     */
    updateAddress: async (id: number, data: Partial<AddressPayload>): Promise<Address | null> => {
        try {
            const response = await api.put(API_ENDPOINTS.ADDRESS_BY_ID(id), data);
            if (response.data?.code === 1000) {
                return response.data.result;
            }
            return null;
        } catch (error) {
            console.error('Error updating address:', error);
            throw error;
        }
    },

    /**
     * [BUYER/SELLER] Xóa địa chỉ
     * DELETE /address/{id}
     */
    deleteAddress: async (id: number): Promise<boolean> => {
        try {
            const response = await api.delete(API_ENDPOINTS.ADDRESS_BY_ID(id));
            return response.data?.code === 1000;
        } catch (error) {
            console.error('Error deleting address:', error);
            return false;
        }
    },
};
