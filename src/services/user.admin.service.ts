// src/services/user.admin.service.ts
// Admin-only: manage users and create inspectors
import api from '../api/axiosConfig';
import { API_ENDPOINTS } from '../config/api';

export interface UserResponse {
  id: string;
  username: string;
  name: string;
  roles: { name: string; description: string }[];
  hasAddress: boolean;
  kyc: boolean;
}

export const userAdminService = {
  getAllUsers: async (): Promise<UserResponse[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.USER_LIST);
      if (response.data?.code === 1000) return response.data.result ?? [];
      return [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  deleteUser: async (id: string): Promise<boolean> => {
    try {
      const response = await api.delete(API_ENDPOINTS.USER_DETAIL(id));
      return response.data?.code === 1000;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  },

  createInspector: async (payload: { email: string; password: string; name: string }): Promise<UserResponse | null> => {
    try {
      const response = await api.post(API_ENDPOINTS.USER_CREATE_INSPECTOR, payload);
      if (response.data?.code === 1000) return response.data.result;
      throw new Error(response.data?.message || 'Failed to create inspector');
    } catch (error: any) {
      console.error('Error creating inspector:', error);
      throw new Error(error.response?.data?.message || error.message || 'Lỗi từ máy chủ khi tạo kiểm định viên');
    }
  },
};
