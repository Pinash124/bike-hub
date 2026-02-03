import axios from 'axios';

// Khởi tạo instance axios
const api = axios.create({
  baseURL: 'https://bikehub-production-2468.up.railway.app',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động thêm Token vào Header nếu có
api.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      const token = parsedUser.token; // Giả định backend trả về trường token
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Lỗi lấy token từ localStorage:', error);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor để xử lý lỗi hệ thống (ví dụ: Token hết hạn)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Xử lý khi token hết hạn: xóa user và redirect về login
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;