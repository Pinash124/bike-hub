// src/services/brand.service.ts
import api from '../api/axiosConfig';
import { API_ENDPOINTS } from '../config/api';

export interface Brand {
    id: number;
    name: string;
}

export const brandService = {
    getAllBrands: async (): Promise<Brand[]> => {
        try {
            const response = await api.get(API_ENDPOINTS.BRAND);
            // Assuming response structure: { code: 1000, result: [...] }
            if (response.data?.code === 1000) {
                return response.data.result;
            }
            return [];
        } catch (error) {
            console.error('Error fetching brands:', error);
            return [];
        }
    },

    createBrand: async (name: string): Promise<Brand | null> => {
        try {
            const response = await api.post(API_ENDPOINTS.BRAND, { name });
            if (response.data?.code === 1000) {
                return response.data.result;
            }
            return null;
        } catch (error) {
            console.error('Error creating brand:', error);
            return null;
        }
    },

    /**
     * [ADMIN] Cập nhật danh sách brands
     * PUT /brand
     */
    updateBrands: async (brands: { id: number; name: string }[]): Promise<boolean> => {
        try {
            const response = await api.put(API_ENDPOINTS.BRAND, { brands });
            return response.data?.code === 1000;
        } catch (error) {
            console.error('Error updating brands:', error);
            return false;
        }
    },

    /**
     * [ADMIN] Xóa brand theo ID
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
