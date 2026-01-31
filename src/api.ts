export const API_BASE_URL = 'https://bikehub-production-2468.up.railway.app'

export const API_ENDPOINTS = {
  SEND_OTP: `${API_BASE_URL}/auth/send-otp`,
  VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,
  REGISTRATION: `${API_BASE_URL}/auth/registration`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  MY_INFO: `${API_BASE_URL}/user/my-info`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  REFRESH: `${API_BASE_URL}/auth/refresh`,
}

export async function refreshToken() {
  const token = localStorage.getItem('token')
  if (!token) return null

  try {
    const response = await fetch(API_ENDPOINTS.REFRESH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })
    if (response.ok) {
      const data = await response.json()
      const newToken = data.result?.token 
      if (newToken) {
        localStorage.setItem('token', newToken)
        return newToken
      }
    }
  } catch (err) {
    console.error('Refresh token failed', err)
  }
  return null
}