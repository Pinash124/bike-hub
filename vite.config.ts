import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const RAILWAY_API =
    env.VITE_API_PROXY_TARGET?.trim() ||
    env.VITE_API_BASE_URL?.trim() ||
    "https://bikehub-production-731a.up.railway.app";

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Proxy mọi request /auth, /user, /listing, /brand, /inspection, /kyc
        // qua Railway backend để tránh lỗi CORS khi chạy local
        "/auth": {
          target: RAILWAY_API,
          changeOrigin: true,
          secure: true,
        },
        "/user": {
          target: RAILWAY_API,
          changeOrigin: true,
          secure: true,
        },
        "/listing": {
          target: RAILWAY_API,
          changeOrigin: true,
          secure: true,
        },
        "/brand": {
          target: RAILWAY_API,
          changeOrigin: true,
          secure: true,
        },
        "/inspection": {
          target: RAILWAY_API,
          changeOrigin: true,
          secure: true,
        },
        "/kyc": {
          target: RAILWAY_API,
          changeOrigin: true,
          secure: true,
        },
        "/component": {
          target: RAILWAY_API,
          changeOrigin: true,
          secure: true,
        },
        "/location": {
          target: RAILWAY_API,
          changeOrigin: true,
          secure: true,
        },
        "/order": {
          target: RAILWAY_API,
          changeOrigin: true,
          secure: true,
        },
        // Proxy only payment API endpoints so SPA callback routes are never forwarded.
        "^/payment/(order|subscription|all|my-payment|history)(?:$|/)": {
          target: RAILWAY_API,
          changeOrigin: true,
          secure: true,
        },
        "^/payment/.+/(status|refund)$": {
          target: RAILWAY_API,
          changeOrigin: true,
          secure: true,
        },
        "/address": {
          target: RAILWAY_API,
          changeOrigin: true,
          secure: true,
        },
        "/plan": {
          target: RAILWAY_API,
          changeOrigin: true,
          secure: true,
        },
        "/subscription": {
          target: RAILWAY_API,
          changeOrigin: true,
          secure: true,
        },
        "/favorite": {
          target: RAILWAY_API,
          changeOrigin: true,
          secure: true,
        },
        "/order-log": {
          target: RAILWAY_API,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
