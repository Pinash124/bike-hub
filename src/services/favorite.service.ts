import api from '../api/axiosConfig';
import { API_ENDPOINTS } from '../config/api';
import type { Listing } from './listing.service';

export interface Favorite {
  id: number;
  listing: Listing;
  createdAt: string;
}

export const favoriteService = {
  /** POST /favorite -> { listingId } */
  addFavorite: async (listingId: string): Promise<Favorite | null> => {
    try {
      const response = await api.post(API_ENDPOINTS.FAVORITE, { listingId });
      if (response.data?.code === 1000) return response.data.result;
      throw new Error(response.data?.message || 'Thêm yêu thích thất bại');
    } catch (error: any) {
      console.error('Error adding favorite:', error?.response?.data?.message || error?.message || error);
      throw error;
    }
  },

  /** DELETE /favorite/{listingId} */
  removeFavorite: async (listingId: string): Promise<boolean> => {
    try {
      const response = await api.delete(API_ENDPOINTS.FAVORITE_DELETE(listingId));
      return response.data?.code === 1000;
    } catch (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
  },

  /** GET /favorite/my-favorite */
  getMyFavorites: async (): Promise<Favorite[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.FAVORITE_MY);
      if (response.data?.code === 1000) return response.data.result ?? [];
      return [];
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }
  },
};
