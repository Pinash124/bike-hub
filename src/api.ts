export const API_BASE_URL = 'https://bikehub-production-2468.up.railway.app';

export const API_ENDPOINTS = {
  SEND_OTP: `${API_BASE_URL}/auth/send-otp`,
  VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,
  REGISTRATION: `${API_BASE_URL}/auth/registration`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  MY_INFO: `${API_BASE_URL}/user/my-info`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  REFRESH: `${API_BASE_URL}/auth/refresh`,
};

/**
 * Hàm hỗ trợ thực hiện gọi API kèm theo Token từ localStorage
 */
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(endpoint, { ...options, headers });

  // Nếu token hết hạn (401), thử làm mới token một lần
  if (response.status === 401 && token) {
    const newToken = await refreshToken();
    if (newToken) {
      // Thử lại yêu cầu cũ với token mới
      headers['Authorization'] = `Bearer ${newToken}`;
      return fetch(endpoint, { ...options, headers });
    }
  }

  return response;
}

/**
 * Hàm làm mới Token khi hết hạn
 */
export async function refreshToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const response = await fetch(API_ENDPOINTS.REFRESH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (response.ok) {
      const data = await response.json();
      const newToken = data.result?.token;
      if (newToken) {
        localStorage.setItem('token', newToken);
        return newToken;
      }
    }
  } catch (err) {
    console.error('Refresh token failed', err);
  }
  
  // Nếu refresh thất bại, xóa token cũ và yêu cầu đăng nhập lại
  localStorage.removeItem('token');
  return null;
}