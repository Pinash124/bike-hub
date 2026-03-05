// src/services/location.service.ts
// Role: INSPECTOR (read), ADMIN (full CRUD)
// Manages inspection locations per Swagger (inspection-location-controller)
import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../config/api";

export interface InspectionLocation {
  id: number;
  type: "SELLER" | "COMPANY";
  contactName: string;
  contactPhone: string;
  addressLine: string;
}

export interface LocationCreatePayload {
  contactName: string;
  contactPhone: string;
  addressLine: string;
}

export const locationService = {
  /**
   * [INSPECTOR/ADMIN] Lấy tất cả địa điểm kiểm tra
   * GET /location
   */
  getAllLocations: async (): Promise<InspectionLocation[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.LOCATION);
      if (response.data?.code === 1000) {
        return response.data.result ?? [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching locations:", error);
      return [];
    }
  },

  /**
   * [INSPECTOR] Lấy địa điểm của công ty mình
   * GET /location/company
   */
  getMyCompanyLocation: async (): Promise<InspectionLocation[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.LOCATION_COMPANY);
      if (response.data?.code === 1000) {
        return response.data.result ?? [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching company location:", error);
      return [];
    }
  },

  /**
   * [INSPECTOR/ADMIN] Lấy địa điểm kiểm tra theo ID
   * GET /location/{id}
   */
  getLocationById: async (id: string): Promise<InspectionLocation | null> => {
    try {
      const response = await api.get(API_ENDPOINTS.LOCATION_BY_ID(id));
      if (response.data?.code === 0) {
        return response.data.result;
      }
      return null;
    } catch (error) {
      console.error("Error fetching location by id:", error);
      return null;
    }
  },

  /**
   * [ADMIN] Tạo địa điểm kiểm tra mới
   * POST /location
   */
  createLocation: async (
    payload: LocationCreatePayload,
  ): Promise<InspectionLocation | null> => {
    try {
      const response = await api.post(API_ENDPOINTS.LOCATION, payload);
      if (response.data?.code === 1000) {
        return response.data.result;
      }
      throw new Error(response.data?.message || "Tạo địa điểm thất bại");
    } catch (error) {
      console.error("Error creating location:", error);
      throw error;
    }
  },

  /**
   * [ADMIN] Cập nhật địa điểm kiểm tra
   * PUT /location/{id}
   */
  updateLocation: async (
    id: number,
    payload: Partial<LocationCreatePayload>,
  ): Promise<InspectionLocation | null> => {
    try {
      const response = await api.put(API_ENDPOINTS.LOCATION_BY_ID(id), payload);
      if (response.data?.code === 1000) {
        return response.data.result;
      }
      throw new Error(response.data?.message || "Cập nhật địa điểm thất bại");
    } catch (error) {
      console.error("Error updating location:", error);
      throw error;
    }
  },

  /**
   * [ADMIN] Xóa địa điểm kiểm tra
   * DELETE /location/{id}
   */
  deleteLocation: async (id: number): Promise<boolean> => {
    try {
      const response = await api.delete(API_ENDPOINTS.LOCATION_BY_ID(id));
      return response.data?.code === 1000;
    } catch (error) {
      console.error("Error deleting location:", error);
      return false;
    }
  },
};
