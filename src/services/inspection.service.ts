// src/services/inspection.service.ts
// Role: SELLER (create), INSPECTOR (work on tasks), BUYER (view results), ADMIN (overview)
import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../config/api";
import type { Listing } from "./listing.service";

export interface InspectionLocation {
  id: string;
  type: "SELLER" | "COMPANY";
  contactName?: string;
  contactPhone?: string;
  addressLine?: string;
}

export interface InspectionInspector {
  id: string;
  username?: string;
  name?: string;
  roles?: { name: string; description?: string }[];
  hasAddress?: boolean;
  kyc?: boolean;
}

export interface InspectionTask {
  inspectionId: string;
  listingId?: string; // Link to the bike listing
  listing?: Listing;
  inspectionType: "ONSITE" | "COMPANY";
  status:
    | "PENDING"
    | "PENDING_ASSIGNED"
    | "ASSIGNED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "REJECTED"
    | "EXPIRED";
  scheduledAt?: string;
  expiredAt?: string;
  createdAt?: string;
  inspector?: InspectionInspector;
  location?: InspectionLocation;
  inspectionResult?: "FAILED" | "PASSED" | "SUCCESS";
  score?: number;
  comment?: string;
  images?: {
    url: string;
    type: "LEFT_VIEW" | "RIGHT_VIEW" | "FRONT_VIEW" | "REAR_VIEW" | string;
  }[];
}

export interface InspectionScorePayload {
  comment?: string;
  score: number;
  files: File[];
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
      console.error("Error fetching all inspections:", error);
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
      console.error("Error fetching pending inspections:", error);
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
      console.error("Error fetching assigned inspections:", error);
      return [];
    }
  },

  /**
   * [BUYER/SELLER] Xem kết quả kiểm tra theo listingId
   * GET /inspection/listing/{listingId}
   */
  getInspectionByListing: async (
    listingId: string,
  ): Promise<InspectionTask | null> => {
    try {
      const response = await api.get(
        API_ENDPOINTS.INSPECTION_BY_LISTING(listingId),
      );
      if (response.data?.code === 1000) {
        return response.data.result;
      }
      return null;
    } catch (error) {
      console.error("Error fetching inspection by listing:", error);
      return null;
    }
  },

  /**
   * [SELLER] Yêu cầu kiểm tra xe của mình
   * POST /inspection
   */
  requestInspection: async (payload: {
    inspectionType: "ONSITE" | "COMPANY";
    inspectionLocationId?: string;
    listingId: string;
    scheduledAt: string;
  }): Promise<boolean> => {
    try {
      const response = await api.post(API_ENDPOINTS.INSPECTION, payload);
      return response.data?.code === 1000;
    } catch (error) {
      console.error("Error requesting inspection:", error);
      return false;
    }
  },

  /**
   * [INSPECTOR] Nộp kết quả kiểm tra (điểm + nhận xét + 4 ảnh)
   * POST /inspection/{inspectionId}/scores
   */
  submitScores: async (
    inspectionId: string,
    payload: InspectionScorePayload,
  ): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append("comment", payload.comment ?? "");
      formData.append("score", String(payload.score));
      payload.files.forEach((file) => formData.append("files", file));

      const response = await api.post(
        API_ENDPOINTS.INSPECTION_SCORES(inspectionId),
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return response.data?.code === 1000;
    } catch (error) {
      console.error("Error submitting inspection scores:", error);
      throw error;
    }
  },

  /**
   * [ADMIN] Gán inspector cho đơn kiểm tra
   * PUT /inspection/assign-inspector
   */
  assignInspector: async (payload: {
    inspectionId: string;
    inspectorId: string;
  }): Promise<boolean> => {
    try {
      const response = await api.put(
        API_ENDPOINTS.INSPECTION_ASSIGN_INSPECTOR,
        payload,
      );
      return response.data?.code === 1000;
    } catch (error) {
      console.error("Error assigning inspector:", error);
      return false;
    }
  },

  /**
   * [ADMIN] Lấy inspector rảnh vào thời gian schedule
   * GET /inspection/available-inspector?scheduleAt=...
   *
   * Forward the scheduledAt string from the backend directly.
   * Previously, re-parsing the ISO string via new Date() then rebuilding it
   * with local date methods (getMonth, getDate) while appending "Z" caused
   * a timezone mismatch — local values were sent as if they were UTC.
   *
   * The backend returns scheduledAt in the correct ISO format (YYYY-MM-DDThh:mm:ss.sssZ),
   * so we just send it as-is. If an array is passed, we build the ISO string
   * using the UTC-safe Date.UTC() to avoid any local-offset issues.
   */
  getAvailableInspectors: async (scheduleAt: any): Promise<any[]> => {
    try {
      let timeParam: string;

      if (Array.isArray(scheduleAt)) {
        const [y, m, d_num, h = 0, i = 0, s = 0] = scheduleAt;
        const pad = (n: number) => String(n).padStart(2, "0");
        timeParam = `${y}-${pad(m)}-${pad(d_num)}T${pad(h)}:${pad(i)}:${pad(s)}.000Z`;
      } else if (typeof scheduleAt === "string" && scheduleAt.length > 0) {
        // Backend may return scheduledAt in Vietnamese locale format: "DD-MM-YYYY HH:mm"
        // The API endpoint requires ISO 8601: "YYYY-MM-DDTHH:mm:ss.000Z"
        const ddMmYyyy = scheduleAt.match(
          /^(\d{2})-(\d{2})-(\d{4})[\sT](\d{2}):(\d{2})(?::(\d{2}))?/,
        );
        if (ddMmYyyy) {
          const [, dd, mm, yyyy, hh, mi, ss = "00"] = ddMmYyyy;
          timeParam = `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}.000Z`;
        } else {
          // Already ISO 8601 (e.g. "2026-04-13T10:57:00.000Z") — pass as-is
          timeParam = scheduleAt;
        }
      } else {
        console.warn(
          "[available-inspector] Invalid scheduleAt input:",
          scheduleAt,
        );
        return [];
      }

      console.log(
        "[available-inspector] raw input:",
        scheduleAt,
        "→ sending:",
        timeParam,
      );

      const response = await api.get(
        API_ENDPOINTS.INSPECTION_AVAILABLE_INSPECTOR,
        {
          params: { scheduleAt: timeParam },
        },
      );

      console.log("[available-inspector] Full response:", response.data);

      if (response.data?.code === 1000) {
        const result = response.data.result ?? [];
        console.log(
          "[available-inspector] Inspectors found:",
          result.length,
          result,
        );
        return result;
      }

      console.warn(
        "[available-inspector] Unexpected code:",
        response.data?.code,
        response.data?.message,
      );
      return [];
    } catch (error: any) {
      console.error(
        "[available-inspector] Error:",
        error?.response?.data ?? error,
      );
      return [];
    }
  },
};
