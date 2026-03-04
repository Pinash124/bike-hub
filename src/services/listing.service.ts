// src/services/listing.service.ts
import api from '../api/axiosConfig';
import { API_ENDPOINTS } from '../config/api';
import type { Brand } from './brand.service';

export interface ListingImage {
    id: string;
    imageOrder: number;
    secureUrl: string;
}

export interface Listing {
    id: string;
    title: string;
    description: string;
    price: number;
    usageDuration: number;
    frameNumber: string;
    status: 'DRAFT' | 'PENDING' | 'RESERVED' | 'REJECTED' | 'APPROVED' | 'LIVE' | 'SOLD';
    brand: Brand;
    images: ListingImage[];
    createdAt: string;
    bikeType?: string;
    location?: string;
    condition?: string;
}

export const listingService = {
    createListing: async (formData: FormData): Promise<Listing | null> => {
        try {
            // NOTE: Do NOT manually set Content-Type for multipart/form-data.
            // Axios/XMLHttpRequest must auto-generate the boundary parameter.
            // We delete the default 'application/json' header to allow this.
            const response = await api.post(API_ENDPOINTS.LISTING, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                transformRequest: (data, headers) => {
                    // Remove Content-Type so browser/axios sets it with correct boundary
                    if (headers) delete headers['Content-Type'];
                    return data;
                },
            });
            if (response.data?.code === 1000) return response.data.result;
            throw new Error(response.data?.message || 'Create listing failed');
        } catch (error: any) {
            const msg = error?.response?.data?.message;
            console.error('Error creating listing:', msg || error);
            throw error;
        }
    },

    getMyListings: async (): Promise<Listing[]> => {
        try {
            const response = await api.get(API_ENDPOINTS.MY_LISTING);
            if (response.data?.code === 1000) return response.data.result ?? [];
            return [];
        } catch (error) {
            console.error('Error fetching my listings:', error);
            return [];
        }
    },

    /** Admin & public: GET /listing — all listings */
    getListings: async (page = 1, size = 1000): Promise<Listing[]> => {
        try {
            const response = await api.get(API_ENDPOINTS.LISTING, { params: { page, size } });
            if (response.data?.code === 1000) {
                const result = response.data.result;
                if (result) {
                    if (Array.isArray(result.data)) return result.data;
                    if (Array.isArray(result)) return result;
                }
            }
            return [];
        } catch (error) {
            console.error('Error fetching listings:', error);
            return [];
        }
    },

    /** Alias used by admin listing tab */
    getAllListings: async (): Promise<Listing[]> => listingService.getListings(),

    /** [ADMIN] POST /listing/{id}/approve */
    approveListing: async (id: string): Promise<boolean> => {
        try {
            const response = await api.post(API_ENDPOINTS.LISTING_APPROVE(id));
            return response.data?.code === 1000;
        } catch (error) {
            console.error('Error approving listing:', error);
            return false;
        }
    },

    /** [ADMIN/PUBLIC] GET /listing/{id} */
    getListingById: async (id: string): Promise<Listing | null> => {
        try {
            const response = await api.get(API_ENDPOINTS.LISTING_DETAIL(id));
            if (response.data?.code === 1000) return response.data.result;
            return null;
        } catch (error) {
            console.error(`Error fetching listing ${id}:`, error);
            return null;
        }
    },

    /** [ADMIN] POST /listing/{id}/reject */
    rejectListing: async (id: string): Promise<boolean> => {
        try {
            const response = await api.post(API_ENDPOINTS.LISTING_REJECT(id));
            return response.data?.code === 1000;
        } catch (error) {
            console.error('Error rejecting listing:', error);
            return false;
        }
    },
};
