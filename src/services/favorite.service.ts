// src/services/favorite.service.ts
import api from '../api/axiosConfig';
import { API_ENDPOINTS } from '../config/api';
import { type Listing } from './listing.service';

export interface FavoriteResponse {
  id: number;
  listing: Listing;
  createdAt: string;
}

export const favoriteService = {
  /**
   * Cập nhật danh sách yêu thích
   */
  getMyFavorites: async (): Promise<FavoriteResponse[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.FAVORITE_MY);
      if (response.data?.code === 1000) {
        return response.data.result || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }
  },

  /**
   * Thêm vào danh sách yêu thích
   */
  addFavorite: async (listingId: string): Promise<FavoriteResponse | null> => {
    try {
      const response = await api.post(API_ENDPOINTS.FAVORITE, { listingId });
      if (response.data?.code === 1000) {
        return response.data.result;
      }
      return null;
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  },

  /**
   * Xóa khỏi danh sách yêu thích
   */
  deleteFavorite: async (listingId: string): Promise<boolean> => {
    try {
      const response = await api.delete(API_ENDPOINTS.FAVORITE_DELETE(listingId));
      return response.data?.code === 1000;
    } catch (error) {
      console.error('Error deleting favorite:', error);
      return false;
    }
  },
};
