import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Khởi tạo instance axios với base URL chính xác
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Tự động thêm Bearer token vào mỗi request nếu có
api.interceptors.request.use(
  (config) => {
    // Lấy token trực tiếp từ localStorage (cách AuthContext lưu)
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
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
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn: xóa khỏi storage, để ProtectedRoute tự redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      // KHÔNG dùng window.location.href - sẽ gây reload loop!
    }
    return Promise.reject(error);
  }
);

export default api;