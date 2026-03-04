// src/services/component.service.ts
// Role: INSPECTOR (read), ADMIN (full CRUD)
// Manages bike inspection checklist components (e.g., Engine, Tires, Frame)
import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../config/api";

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
      const payload =
        response.data?.result ?? response.data?.data ?? response.data;
      if (Array.isArray(payload)) return payload;
      if (payload && Array.isArray((payload as any).data))
        return (payload as any).data;
      return [];
    } catch (error) {
      console.error("Error fetching components:", error);
      return [];
    }
  },

  /**
   * [ADMIN] Tạo hạng mục kiểm tra mới
   * POST /component
   */
  createComponent: async (
    payload: ComponentPayload,
  ): Promise<InspectionComponent | null> => {
    try {
      const response = await api.post(API_ENDPOINTS.COMPONENT, payload);
      const body =
        response.data?.result ?? response.data?.data ?? response.data;
      if (body && !Array.isArray(body)) return body;
      if (Array.isArray(body) && body.length > 0) return body[0];
      throw new Error(response.data?.message || "Tạo hạng mục thất bại");
    } catch (error) {
      console.error("Error creating component:", error);
      throw error;
    }
  },

  /**
   * [ADMIN] Cập nhật hạng mục kiểm tra
   * PUT /component/{id}
   */
  updateComponent: async (
    id: number,
    payload: Partial<ComponentPayload>,
  ): Promise<InspectionComponent | null> => {
    try {
      const response = await api.put(
        API_ENDPOINTS.COMPONENT_DETAIL(String(id)),
        payload,
      );
      const body =
        response.data?.result ?? response.data?.data ?? response.data;
      if (body && !Array.isArray(body)) return body;
      if (Array.isArray(body) && body.length > 0) return body[0];
      throw new Error(response.data?.message || "Cập nhật hạng mục thất bại");
    } catch (error) {
      console.error("Error updating component:", error);
      throw error;
    }
  },

  /**
   * [ADMIN] Xóa hạng mục kiểm tra
   * DELETE /component/{id}
   */
  deleteComponent: async (id: number): Promise<boolean> => {
    try {
      const response = await api.delete(
        API_ENDPOINTS.COMPONENT_DETAIL(String(id)),
      );
      if (typeof response.data?.code === "number")
        return response.data.code === 1000;
      return !!response.data;
    } catch (error) {
      console.error("Error deleting component:", error);
      return false;
    }
  },
};
