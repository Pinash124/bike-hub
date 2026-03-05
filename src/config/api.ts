// src/config/api.ts
// Khi dev local: dùng relative path để Vite proxy chuyển tiếp → tránh CORS
// Khi build production: dùng full Railway URL
const isProd = import.meta.env.PROD

export const API_BASE_URL = isProd
  ? 'https://bikehub-production-c470.up.railway.app'
  : '' // Relative path → Vite proxy sẽ forward đến Railway

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh`,
  SEND_OTP: `${API_BASE_URL}/auth/send-otp`,
  VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,
  REGISTRATION: `${API_BASE_URL}/auth/registration`,

  // User
  GET_MY_INFO: `${API_BASE_URL}/user/my-info`,
  USER_PROFILE: `${API_BASE_URL}/user/profile`,
  USER_CHANGE_PASSWORD: `${API_BASE_URL}/user/change-password`,
  USER_FORGOT_PASSWORD: `${API_BASE_URL}/user/forgot-password`,
  USER_RESET_PASSWORD: `${API_BASE_URL}/user/reset-password`,
  USER_LIST: `${API_BASE_URL}/user`, // Admin only
  USER_DETAIL: (id: string) => `${API_BASE_URL}/user/${id}`, // Admin only

  // KYC (per Swagger: kyc-controller)
  UPLOAD_KYC: `${API_BASE_URL}/kyc/upload`,      // POST — Seller uploads documents
  KYC_VERIFY: `${API_BASE_URL}/kyc/verify`,      // POST — Trigger KYC verification
  KYC_DELETE: `${API_BASE_URL}/kyc/delete`,      // POST — Delete KYC documents
  CONFIRM_KYC: `${API_BASE_URL}/kyc/confirm`,    // POST — Admin confirms KYC
  KYC_GET_ALL: `${API_BASE_URL}/kyc/getall`,     // GET  — Admin: list all KYC requests

  // Brand
  BRAND: `${API_BASE_URL}/brand`,
  BRAND_DETAIL: (id: string) => `${API_BASE_URL}/brand/${id}`,

  // Listing
  LISTING: `${API_BASE_URL}/listing`,
  LISTING_ALL: `${API_BASE_URL}/listing/all`, // Admin only
  MY_LISTING: `${API_BASE_URL}/listing/my-list`,
  LISTING_DETAIL: (id: string) => `${API_BASE_URL}/listing/${id}`,
  LISTING_ACTIVATE: (id: string) => `${API_BASE_URL}/listing/${id}/activate`,
  LISTING_DEACTIVATE: (id: string) => `${API_BASE_URL}/listing/${id}/deactivate`,
  LISTING_APPROVE: (id: string) => `${API_BASE_URL}/listing/${id}/approve`, // Admin only
  LISTING_REJECT: (id: string) => `${API_BASE_URL}/listing/${id}/reject`, // Admin only

  // Address (Buyer/Seller — per Swagger)
  ADDRESS: `${API_BASE_URL}/address`,           // POST: add new address
  ADDRESS_MY: `${API_BASE_URL}/address/my-address`, // GET: my addresses
  ADDRESS_BY_ID: (id: string | number) => `${API_BASE_URL}/address/${id}`, // PUT: update address

  // Inspection (per Swagger)
  INSPECTION: `${API_BASE_URL}/inspection`,                         // GET all | POST create
  INSPECTION_PENDING: `${API_BASE_URL}/inspection/pending`,          // GET inspector pending queue
  INSPECTION_MY_ASSIGN: `${API_BASE_URL}/inspection/my-assign`,      // GET inspector's assigned tasks
  INSPECTION_ASSIGN_INSPECTOR: `${API_BASE_URL}/inspection/assign-inspector`, // PUT assign inspector (Admin)
  INSPECTION_BY_LISTING: (listingId: string) => `${API_BASE_URL}/inspection/${listingId}`, // GET result by listing
  INSPECTION_SCORES: (inspectionId: string) => `${API_BASE_URL}/inspection/${inspectionId}/scores`, // POST submit scores
  INSPECTION_AVAILABLE_INSPECTOR: `${API_BASE_URL}/inspection/available-inspector`, // GET available inspector

  // Plan (Subscription pricing tiers)
  PLAN: `${API_BASE_URL}/plan`,

  // Subscription
  SUBSCRIPTION: `${API_BASE_URL}/subscription`,
  SUBSCRIPTION_BY_LISTING: (listingId: string) => `${API_BASE_URL}/subscription/${listingId}`,

  // Inspection Location (per Swagger — inspection company locations)
  LOCATION: `${API_BASE_URL}/location`,                          // GET all | POST create (Admin)
  LOCATION_BY_ID: (id: string | number) => `${API_BASE_URL}/location/${id}`, // GET | PUT | DELETE (Admin)
  LOCATION_COMPANY: `${API_BASE_URL}/location/company`,           // GET current user's company location

  // Component (Bike parts, e.g., Frame, Engine)
  COMPONENT: `${API_BASE_URL}/component`,
  COMPONENT_DETAIL: (id: string) => `${API_BASE_URL}/component/${id}`,

  // Order
  ORDER: `${API_BASE_URL}/order`,
  ORDER_DETAIL: (id: string) => `${API_BASE_URL}/order/${id}`,
  ORDER_CREATE: `${API_BASE_URL}/order/create`,
  ORDER_CONFIRM: (id: string) => `${API_BASE_URL}/order/${id}/confirm`,
  ORDER_CANCEL: (id: string) => `${API_BASE_URL}/order/${id}/cancel`,
  ORDER_HISTORY: `${API_BASE_URL}/order/history`,
  ORDER_ADMIN_LIST: `${API_BASE_URL}/order/admin`, // Admin only

  // Payment
  PAYMENT_CREATE_ORDER: `${API_BASE_URL}/payment/create/order`, // Link payment for bike order
  PAYMENT_CREATE_SUBSCRIPTION: `${API_BASE_URL}/payment/create/subscription`, // Sub payment via PayOS
  PAYMENT_ALL: `${API_BASE_URL}/payment/all`, // Get all payments
  PAYMENT_STATUS: (orderId: string) => `${API_BASE_URL}/payment/${orderId}/status`,
  PAYMENT_HISTORY: `${API_BASE_URL}/payment/history`,
  PAYMENT_REFUND: (paymentId: string) => `${API_BASE_URL}/payment/${paymentId}/refund`, // Admin only
};