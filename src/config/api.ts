// src/config/api.ts
export const API_BASE_URL = 'https://bikehub-production-2468.up.railway.app';

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh`,
  GET_MY_INFO: `${API_BASE_URL}/user/my-info`,
  SEND_OTP: `${API_BASE_URL}/auth/send-otp`,
  VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,
  REGISTRATION: `${API_BASE_URL}/auth/registration`,
};