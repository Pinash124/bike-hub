// src/config/api.ts
// Dev local: relative path → Vite proxy forward đến Railway (tránh CORS)
// Production: full Railway URL
const isProd = import.meta.env.PROD

export const API_BASE_URL = isProd
  ? 'https://bikehub-production-1c50.up.railway.app'
  : ''

export const API_ENDPOINTS = {
  // ─── Auth ──────────────────────────────────────────────────────────────
  LOGIN:                API_BASE_URL + '/auth/login',
  LOGOUT:               API_BASE_URL + '/auth/logout',
  REFRESH_TOKEN:        API_BASE_URL + '/auth/refresh',
  SEND_OTP:             API_BASE_URL + '/auth/send-otp',
  VERIFY_OTP:           API_BASE_URL + '/auth/verify-otp',
  REGISTRATION:         API_BASE_URL + '/auth/registration',
  SEND_FORGOT_OTP:      API_BASE_URL + '/auth/send-forgot-otp',  // POST: gửi OTP quên mật khẩu
  FORGOT_PASSWORD:      API_BASE_URL + '/auth/forgot-password',  // PUT: đặt lại mật khẩu

  // ─── User ──────────────────────────────────────────────────────────────
  GET_MY_INFO:           API_BASE_URL + '/user/my-info',          // GET
  USER_LIST:             API_BASE_URL + '/user',                  // GET (admin)
  USER_CHANGE_PASSWORD:  API_BASE_URL + '/user/password',         // PUT
  USER_CREATE_INSPECTOR: API_BASE_URL + '/user/create-inspector', // POST
  USER_DELETE:           (id: string) => `${API_BASE_URL}/user/${id}`, // DELETE (admin)

  // ─── KYC ───────────────────────────────────────────────────────────────
  UPLOAD_KYC:  API_BASE_URL + '/kyc/upload',   // POST multipart
  KYC_VERIFY:  API_BASE_URL + '/kyc/verify',   // POST {id, approved}
  KYC_DELETE:  API_BASE_URL + '/kyc/delete',   // POST {id}
  CONFIRM_KYC: API_BASE_URL + '/kyc/confirm',  // POST {draftId}
  KYC_GET_ALL: API_BASE_URL + '/kyc/getall',   // GET (admin)

  // ─── Brand ─────────────────────────────────────────────────────────────
  BRAND:        API_BASE_URL + '/brand',                           // GET / POST / PUT
  BRAND_DETAIL: (id: string | number) => `${API_BASE_URL}/brand/${id}`, // DELETE

  // ─── Listing ───────────────────────────────────────────────────────────
  LISTING:               API_BASE_URL + '/listing',               // GET (public paginated) / POST (seller)
  LISTING_ALL:           API_BASE_URL + '/listing/all',           // GET (admin)
  MY_LISTING:            API_BASE_URL + '/listing/my-list',       // GET (seller)
  LISTING_DETAIL:        (id: string) => `${API_BASE_URL}/listing/${id}`,         // GET (public) / DELETE (admin)
  LISTING_SELLER_DETAIL: (id: string) => `${API_BASE_URL}/listing/seller/${id}`,  // GET (seller — full detail)

  // ─── Address ───────────────────────────────────────────────────────────
  ADDRESS:      API_BASE_URL + '/address',                        // POST
  ADDRESS_MY:   API_BASE_URL + '/address/my-address',             // GET
  ADDRESS_BY_ID:(id: string | number) => `${API_BASE_URL}/address/${id}`, // PUT

  // ─── Inspection ────────────────────────────────────────────────────────
  INSPECTION:                   API_BASE_URL + '/inspection',                     // GET (admin) / POST (seller)
  INSPECTION_PENDING:           API_BASE_URL + '/inspection/pending',             // GET (admin)
  INSPECTION_MY:                API_BASE_URL + '/inspection/my-inspection',       // GET (seller)
  INSPECTION_MY_ASSIGN:         API_BASE_URL + '/inspection/my-assign',           // GET (inspector)
  INSPECTION_ASSIGN_INSPECTOR:  API_BASE_URL + '/inspection/assign-inspector',    // PUT
  INSPECTION_BY_LISTING:        (listingId: string) => `${API_BASE_URL}/inspection/${listingId}`, // GET by listing
  INSPECTION_BY_ID:             (id: string) => `${API_BASE_URL}/inspection/${id}`,              // GET by id
  INSPECTION_SCORES:            (id: string) => `${API_BASE_URL}/inspection/${id}/scores`,       // POST multipart
  INSPECTION_AVAILABLE_INSPECTOR: API_BASE_URL + '/inspection/available-inspector', // GET ?scheduleAt=

  // ─── Plan ──────────────────────────────────────────────────────────────
  PLAN:        API_BASE_URL + '/plan',                            // GET / POST
  PLAN_DETAIL: (id: string | number) => `${API_BASE_URL}/plan/${id}`, // PUT / DELETE

  // ─── Subscription ──────────────────────────────────────────────────────
  SUBSCRIPTION:            API_BASE_URL + '/subscription',        // POST {planId, listingId}
  SUBSCRIPTION_BY_LISTING: (listingId: string) => `${API_BASE_URL}/subscription/${listingId}`, // GET

  // ─── Location ──────────────────────────────────────────────────────────
  LOCATION:         API_BASE_URL + '/location',                   // GET / POST
  LOCATION_COMPANY: API_BASE_URL + '/location/company',           // GET (inspector company)
  LOCATION_BY_ID:   (id: string | number) => `${API_BASE_URL}/location/${id}`, // GET / PUT / DELETE

  // ─── Order ─────────────────────────────────────────────────────────────
  ORDER_MY:        API_BASE_URL + '/order/my-order',              // GET — buyer xem đơn của mình
  ORDER_ALL:       API_BASE_URL + '/order',                       // GET — admin/seller xem tất cả
  ORDER_DETAIL:    (id: string) => `${API_BASE_URL}/order/${id}`, // GET
  ORDER_ACCEPT:    (id: string) => `${API_BASE_URL}/order/${id}/accept`,    // PUT — seller chấp nhận
  ORDER_REJECT:    (id: string) => `${API_BASE_URL}/order/${id}/reject`,    // PUT — seller từ chối
  ORDER_DELIVERED: (id: string) => `${API_BASE_URL}/order/${id}/delivered`, // PUT multipart — seller đã giao
  ORDER_CLAIM:     (id: string) => `${API_BASE_URL}/order/${id}/claim`,     // PUT — buyer xác nhận nhận xe

  // ─── Order Log ─────────────────────────────────────────────────────────
  ORDER_LOG_BY_ORDER: (orderId: string) => `${API_BASE_URL}/order-log/order/${orderId}`, // GET
  ORDER_LOG_BY_ID:    (logId: string | number) => `${API_BASE_URL}/order-log/${logId}`,  // GET

  // ─── Payment ───────────────────────────────────────────────────────────
  PAYMENT_CREATE_ORDER:        API_BASE_URL + '/payment/order',        // POST {listingId} → {paymentUrl}
  PAYMENT_CREATE_SUBSCRIPTION: API_BASE_URL + '/payment/subscription', // POST {subscriptionId} → {paymentUrl}
  PAYMENT_ALL:                 API_BASE_URL + '/payment/all',          // GET (admin)
  PAYMENT_MY:                  API_BASE_URL + '/payment/my-payment',   // GET (buyer/seller)

  // ─── Favorite ──────────────────────────────────────────────────────────
  FAVORITE:        API_BASE_URL + '/favorite',               // POST {listingId}
  FAVORITE_MY:     API_BASE_URL + '/favorite/my-favorite',  // GET
  FAVORITE_DELETE: (listingId: string) => `${API_BASE_URL}/favorite/${listingId}`, // DELETE

  // ─── Component (legacy admin module) ──────────────────────────────────
  COMPONENT:       API_BASE_URL + '/component',
  COMPONENT_DETAIL:(id: string) => `${API_BASE_URL}/component/${id}`,
}
