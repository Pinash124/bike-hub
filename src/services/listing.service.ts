// src/services/listing.service.ts
import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../config/api";
import type { Brand } from "./brand.service";
import {
  buildScopedCacheKey,
  invalidateRequestCache,
  withRequestCache,
} from "./requestCache";

export interface ListingImage {
  id: string;
  imageOrder: number;
  secureUrl: string;
}

export interface ListingSubscription {
  plan?: {
    name: string;
    description?: string;
    price?: number;
    priority?: number;
    durationDays?: number;
  };
  status?: string;
  createdDate?: string;
  startDate?: string;
  expiredDate?: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  usageDuration: number;
  frameNumber: string;
  status:
    | "DRAFT"
    | "PAID"
    | "PENDING"
    | "RESERVED"
    | "REJECT"
    | "LIVE"
    | "SOLD"
    | "DELETED"
    | "EXPIRED"
    | "INSPECTED";
  brand: Brand;
  images: ListingImage[];
  createdAt: string;
  bikeType?: string;
  location?: string;
  condition?: string;
  subscription?: ListingSubscription;
}

export const listingService = {
  createListing: async (formData: FormData): Promise<Listing | null> => {
    try {
      const response = await api.post(API_ENDPOINTS.LISTING, formData);
      if (response.data?.code === 1000) {
        invalidateRequestCache("listings:");
        return response.data.result;
      }
      throw new Error(response.data?.message || "Create listing failed");
    } catch (error: any) {
      const serverData = error?.response?.data;
      const msg = serverData?.message || serverData?.error || "Unknown error";
      const details = serverData?.errors || serverData?.result || "";
      console.error(
        "Error creating listing:",
        msg,
        details,
        "| Full response:",
        serverData,
      );
      throw error;
    }
  },

  updateListing: async (
    id: string,
    formData: FormData,
  ): Promise<Listing | null> => {
    try {
      const response = await api.put(
        API_ENDPOINTS.LISTING_DETAIL(id),
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      if (response.data?.code === 1000) {
        invalidateRequestCache("listings:");
        return response.data.result;
      }
      throw new Error(response.data?.message || "Update listing failed");
    } catch (error) {
      console.error("Error updating listing:", error);
      throw error;
    }
  },

  getMyListings: async (): Promise<Listing[]> => {
    return withRequestCache(
      buildScopedCacheKey("listings", "my"),
      async () => {
        try {
          const response = await api.get(API_ENDPOINTS.MY_LISTING);
          if (response.data?.code === 1000) return response.data.result ?? [];
          return [];
        } catch (error) {
          console.error("Error fetching my listings:", error);
          return [];
        }
      },
      10_000,
    );
  },

  /** Homepage & public: GET /listing — approved listings */
  getListings: async (page = 1, size = 1000): Promise<Listing[]> => {
    return withRequestCache(
      `listings:public:${page}:${size}`,
      async () => {
        try {
          const response = await api.get(API_ENDPOINTS.LISTING, {
            params: { page, size },
          });
          if (response.data?.code === 1000) {
            const result = response.data.result;
            if (result) {
              if (Array.isArray(result.data)) return result.data;
              if (Array.isArray(result)) return result;
            }
          }
          return [];
        } catch (error) {
          console.error("Error fetching listings:", error);
          return [];
        }
      },
      10_000,
    );
  },

  /** Admin: GET /listing/all — all listings for moderation */
  getAllListings: async (): Promise<Listing[]> => {
    return withRequestCache(
      buildScopedCacheKey("listings", "all"),
      async () => {
        try {
          const response = await api.get(API_ENDPOINTS.LISTING_ALL);
          if (response.data?.code === 1000) {
            const result = response.data.result;
            if (Array.isArray(result)) return result;
          }
          return [];
        } catch (error) {
          console.error("Error fetching all listings:", error);
          return [];
        }
      },
      10_000,
    );
  },

  /** [ADMIN] POST /listing/{id}/approve */
  approveListing: async (id: string): Promise<boolean> => {
    try {
      const response = await api.post(API_ENDPOINTS.LISTING_APPROVE(id), {});
      const ok = response.data?.code === 1000;
      if (ok) invalidateRequestCache("listings:");
      return ok;
    } catch (error) {
      console.error("Error approving listing:", error);
      return false;
    }
  },

  /** [ADMIN/PUBLIC] GET /listing/{id} */
  getListingById: async (id: string): Promise<Listing | null> => {
    return withRequestCache(
      `listings:detail:${id}`,
      async () => {
        try {
          const response = await api.get(API_ENDPOINTS.LISTING_DETAIL(id));
          if (response.data?.code === 1000) return response.data.result;
          throw new Error(
            response.data?.message || "Không thể tải thông tin xe",
          );
        } catch (error: any) {
          const serverMsg = error.response?.data?.message;
          console.error(
            `Error fetching listing ${id}:`,
            serverMsg || error.message || error,
          );
          throw error;
        }
      },
      15_000,
    );
  },

  /** [SELLER] GET /listing/seller/{id} — includes draft/unpublished listing */
  getSellerListingById: async (id: string): Promise<Listing | null> => {
    return withRequestCache(
      buildScopedCacheKey("listings", "seller-detail", id),
      async () => {
        try {
          const response = await api.get(
            API_ENDPOINTS.LISTING_SELLER_DETAIL(id),
          );
          if (response.data?.code === 1000) return response.data.result;
          throw new Error(
            response.data?.message ||
              "Không thể tải thông tin xe của người bán",
          );
        } catch (error: any) {
          const serverMsg = error.response?.data?.message;
          console.error(
            `Error fetching seller listing ${id}:`,
            serverMsg || error.message || error,
          );
          throw error;
        }
      },
      15_000,
    );
  },

  /** [ADMIN] POST /listing/{id}/reject */
  rejectListing: async (id: string): Promise<boolean> => {
    try {
      const response = await api.post(API_ENDPOINTS.LISTING_REJECT(id), {});
      const ok = response.data?.code === 1000;
      if (ok) invalidateRequestCache("listings:");
      return ok;
    } catch (error) {
      console.error("Error rejecting listing:", error);
      return false;
    }
  },
};
