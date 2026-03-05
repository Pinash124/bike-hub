// src/services/brand.service.ts
import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../config/api";

export interface Brand {
  id: number;
  name: string;
}

export const brandService = {
  getAllBrands: async (): Promise<Brand[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.BRAND);
      // Support multiple possible response shapes: { code, result }, { code, data }, or direct array
      const payload =
        response.data?.result ?? response.data?.data ?? response.data;
      if (Array.isArray(payload)) return payload;
      // some APIs wrap with { data: { data: [...] } }
      if (payload && Array.isArray((payload as any).data))
        return (payload as any).data;
      return [];
    } catch (error) {
      console.error("Error fetching brands:", error);
      return [];
    }
  },

  createBrand: async (name: string): Promise<Brand | null> => {
    try {
      const response = await api.post(API_ENDPOINTS.BRAND, { name });
      const payload =
        response.data?.result ?? response.data?.data ?? response.data;
      if (payload && !Array.isArray(payload)) return payload;
      if (Array.isArray(payload) && payload.length > 0) return payload[0];
      return null;
    } catch (error) {
      console.error("Error creating brand:", error);
      return null;
    }
  },

  /**
   * [ADMIN] Cập nhật thương hiệu
   * PUT /brand
   */
  updateBrand: async (id: number, name: string): Promise<Brand | null> => {
    try {
      const response = await api.put(API_ENDPOINTS.BRAND, { id, name });
      const payload =
        response.data?.result ?? response.data?.data ?? response.data;
      if (payload && !Array.isArray(payload)) return payload;
      if (Array.isArray(payload) && payload.length > 0) return payload[0];
      return null;
    } catch (error) {
      console.error("Error updating brand:", error);
      return null;
    }
  },

  /**
   * [ADMIN] Cập nhật danh sách brands (legacy - batch update)
   * PUT /brand
   */
  updateBrands: async (
    brands: { id: number; name: string }[],
  ): Promise<boolean> => {
    try {
      const response = await api.put(API_ENDPOINTS.BRAND, { brands });
      const payload = response.data?.code ?? response.data;
      // If code exists, treat 1000 as success; otherwise fallback to boolean check
      if (typeof response.data?.code === "number")
        return response.data.code === 1000;
      return !!payload;
    } catch (error) {
      console.error("Error updating brands:", error);
      return false;
    }
  },

  /**
   * [ADMIN] Xóa brand theo ID
   * DELETE /brand/{brandId}
   */
  deleteBrand: async (brandId: number): Promise<boolean> => {
    try {
      const response = await api.delete(
        API_ENDPOINTS.BRAND_DETAIL(String(brandId)),
      );
      if (typeof response.data?.code === "number")
        return response.data.code === 1000;
      return !!response.data;
    } catch (error) {
      console.error("Error deleting brand:", error);
      return false;
    }
  },
};
