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
    // properties matching UI needs
    location?: string; // Additional field if available
    condition?: string;
}

export const listingService = {
    createListing: async (formData: FormData): Promise<Listing | null> => {
        try {
            // Content-Type header is set automatically by axios when data is FormData
            // but we need to ensure the token is attached (handled by interceptor)
            const response = await api.post(API_ENDPOINTS.LISTING, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.data?.code === 1000) {
                return response.data.result;
            }
            throw new Error(response.data?.message || 'Create listing failed');
        } catch (error) {
            console.error('Error creating listing:', error);
            throw error;
        }
    },

    getMyListings: async (): Promise<Listing[]> => {
        try {
            const response = await api.get(API_ENDPOINTS.MY_LISTING);
            if (response.data?.code === 1000) {
                return response.data.result;
            }
            return [];
        } catch (error) {
            console.error('Error fetching my listings:', error);
            return [];
        }
    },

    // Public/Search listings (Note: Endpoint path might need adjustment based on backend)
    // Currently guessing GET /listing or GET /listing/search
    getListings: async (): Promise<Listing[]> => {
        try {
            // FALLBACK: If there is no specific search endpoint document, 
            // we might try accessing the general listing endpoint if it exists.
            // For now, I'll use the base listing endpoint.
            // If this 404s, we will need to ask backend team.
            const response = await api.get(API_ENDPOINTS.LISTING); // Assuming GET /listing returns all?
            if (response.data?.code === 1000) {
                return response.data.result;
            }
            return [];
        } catch (error) {
            console.error('Error fetching listings:', error);
            return [];
        }
    }
};
