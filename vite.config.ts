import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const RAILWAY_API = 'https://bikehub-production-c470.up.railway.app'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy mọi request /auth, /user, /listing, /brand, /inspection, /kyc
      // qua Railway backend để tránh lỗi CORS khi chạy local
      '/auth': {
        target: RAILWAY_API,
        changeOrigin: true,
        secure: true,
      },
      '/user': {
        target: RAILWAY_API,
        changeOrigin: true,
        secure: true,
      },
      '/listing': {
        target: RAILWAY_API,
        changeOrigin: true,
        secure: true,
      },
      '/brand': {
        target: RAILWAY_API,
        changeOrigin: true,
        secure: true,
      },
      '/inspection': {
        target: RAILWAY_API,
        changeOrigin: true,
        secure: true,
      },
      '/kyc': {
        target: RAILWAY_API,
        changeOrigin: true,
        secure: true,
      },
      '/component': {
        target: RAILWAY_API,
        changeOrigin: true,
        secure: true,
      },
      '/location': {
        target: RAILWAY_API,
        changeOrigin: true,
        secure: true,
      },
      '/order': {
        target: RAILWAY_API,
        changeOrigin: true,
        secure: true,
      },
      '/payment': {
        target: RAILWAY_API,
        changeOrigin: true,
        secure: true,
      },
      '/address': {
        target: RAILWAY_API,
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
