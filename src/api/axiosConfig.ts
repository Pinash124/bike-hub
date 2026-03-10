import axios, { type AxiosError } from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

// Khởi tạo instance axios với base URL chính xác
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const clearAuthStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('role');
};

const isAuthEndpoint = (url?: string) => {
  if (!url) return false;
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/send-otp') ||
    url.includes('/auth/verify-otp') ||
    url.includes('/auth/registration')
  );
};

// Interceptor: Tự động thêm Bearer token vào mỗi request nếu có
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If sending FormData, remove Content-Type so browser auto-sets it with the correct multipart boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: Xử lý lỗi response
// QUAN TRỌNG: KHÔNG dùng window.location.href = '/login' ở đây vì sẽ
// gây reload cả trang và tạo vòng lặp redirect vô tận.
// Thay vào đó, chỉ xóa token và để React Router tự xử lý.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as (typeof error.config & {
      _retry?: boolean;
    });

    if (status === 401 && originalRequest && !originalRequest._retry) {
      // Skip refresh for auth endpoints to avoid loops
      if (isAuthEndpoint(originalRequest.url)) {
        clearAuthStorage();
        return Promise.reject(error);
      }

      const token = localStorage.getItem('token');
      if (!token) {
        clearAuthStorage();
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(API_ENDPOINTS.REFRESH_TOKEN, {
          token,
        });
        const { code, result } = refreshResponse.data || {};
        if (code === 1000 && result?.token) {
          localStorage.setItem('token', result.token);
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${result.token}`;
          return api.request(originalRequest);
        }
      } catch (refreshError) {
        // Fall through to clear auth
      }

      clearAuthStorage();
    }

    return Promise.reject(error);
  }
);

export default api;


