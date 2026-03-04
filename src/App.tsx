// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { brandService, type Brand } from "./services/brand.service";

// --- Layout & Common Components ---
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";

// --- Sections (Homepage) ---
import Banner from "./components/sections/Banner";
import FilterSection from "./components/sections/FilterSection";
import FeaturedBikes from "./components/sections/FeaturedBikes";
import Categories from "./components/sections/Categories";
import Features from "./components/sections/Features";

// --- Auth Components ---
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import KYC from "./components/auth/KYC"; // Bổ sung tệp KYC đã tạo

// --- Dashboards & Pages ---
import SellerDashboard from "./components/dashboards/SellerDashboard";
import BuyerDashboardPage from "./components/buyer/BuyerDashboard";
import AdminDashboard from "./components/dashboards/AdminDashboard";
import InspectorDashboard from "./components/dashboards/InspectorDashboard";
import ProfilePage from "./pages/ProfilePage"; // Bổ sung ProfilePage
import SearchPage from "./pages/SearchPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import CreateListingPage from "./pages/CreateListingPage";
import ScheduleInspectionPage from "./pages/ScheduleInspectionPage";
import DebugPage from "./pages/DebugPage";

// --- Contexts & Protection ---
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { GuestMarketplace } from "./components/guest/GuestMarketplace";

/**
 * Trang thông báo khi không có quyền truy cập
 */
function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-10">
      <h1 className="text-4xl font-black text-red-600 mb-4 uppercase">
        403 - Truy cập bị từ chối
      </h1>
      <p className="text-slate-500 mb-8">
        Bạn không có quyền hạn để truy cập vào trang này.
      </p>
      <a
        href="/"
        className="bg-green-600 text-white px-8 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-green-700 transition-all"
      >
        Quay lại trang chủ
      </a>
    </div>
  );
}

import { Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

// guard wrapper for profile route to prevent admins from accessing
function ProfileGuard() {
  const { role } = useAuth();
  const normalizedRole = (role || "guest").toLowerCase();
  if (normalizedRole === "admin") {
    return <Navigate to="/unauthorized" replace />;
  }
  return (
    <>
      <Header />
      <ProfilePage />
      <Footer />
    </>
  );
}

function Home() {
  const [selectedBrand, setSelectedBrand] = useState("Tất cả");
  const [brands, setBrands] = useState<Brand[]>([]);
  const { role, isLoading } = useAuth();

  useEffect(() => {
    brandService
      .getAllBrands()
      .then(setBrands)
      .catch(() => setBrands([]));
  }, []);

  // Wait for auth to fully load before rendering role-based redirects
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
          <p className="text-slate-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Role-based redirects only for admin and inspector
  const normalizedRole = (role || "guest").toLowerCase();

  if (normalizedRole === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (normalizedRole === "inspector") {
    return <Navigate to="/inspector/dashboard" replace />;
  }

  // For buyer, seller, and guest: show normal homepage
  return (
    <div className="relative">
      <Header />
      <main>
        <Banner />
        <FilterSection />
        <FeaturedBikes />
        <Categories
          brands={brands}
          onSelectBrand={setSelectedBrand}
          selectedBrand={selectedBrand}
        />
        <Features />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<Home />} />
            <Route
              path="/unauthorized"
              element={
                <>
                  <Header />
                  <Unauthorized />
                  <Footer />
                </>
              }
            />
            <Route path="/debug" element={<DebugPage />} />
            <Route
              path="/marketplace"
              element={
                <>
                  <Header />
                  <GuestMarketplace />
                  <Footer />
                </>
              }
            />
            {/* AUTH ROUTES */}
            <Route
              path="/login"
              element={
                <>
                  <Home />
                  <Login />
                </>
              }
            />
            <Route
              path="/register"
              element={
                <>
                  <Home />
                  <Register />
                </>
              }
            />
            {/* --- Product Discovery --- */}
            <Route
              path="/search"
              element={
                <>
                  <Header />
                  <SearchPage />
                  <Footer />
                </>
              }
            />
            <Route
              path="/product/:id"
              element={
                <>
                  <Header />
                  <ProductDetailPage />
                  <Footer />
                </>
              }
            />
            {/* --- KYC Route --- */}
            <Route
              path="/kyc"
              element={
                <ProtectedRoute>
                  <KYC />
                </ProtectedRoute>
              }
            />
            {/* --- Profile Route (All Authenticated Users) --- */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfileGuard />
                </ProtectedRoute>
              }
            />
            {/* --- Protected Routes - Seller --- */}
            // --- Route Section ---
            <Route
              path="/seller/dashboard"
              element={
                <ProtectedRoute requiredRole="seller">
                  <>
                    <Header />
                    <SellerDashboard />
                    <Footer />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/new-bike"
              element={
                <ProtectedRoute requiredRole="seller">
                  <>
                    <Header />
                    <CreateListingPage />
                    <Footer />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/schedule"
              element={
                <ProtectedRoute requiredRole="seller">
                  <>
                    <Header />
                    <ScheduleInspectionPage />
                    <Footer />
                  </>
                </ProtectedRoute>
              }
            />
            {/* --- Protected Routes - Buyer --- */}
            <Route
              path="/buyer/dashboard"
              element={
                <ProtectedRoute requiredRole="buyer">
                  <>
                    <Header />
                    <BuyerDashboardPage />
                    <Footer />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/checkout"
              element={
                <ProtectedRoute requiredRole="buyer">
                  <>
                    <Header />
                    <CheckoutPage />
                    <Footer />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/orders"
              element={
                <ProtectedRoute requiredRole="buyer">
                  <>
                    <Header />
                    <OrderTrackingPage />
                    <Footer />
                  </>
                </ProtectedRoute>
              }
            />
            {/* --- Protected Routes - Admin & Inspector --- */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inspector/dashboard"
              element={
                <ProtectedRoute requiredRole="inspector">
                  <>
                    <Header />
                    <InspectorDashboard />
                    <Footer />
                  </>
                </ProtectedRoute>
              }
            />
            {/* --- 404 Route --- */}
            <Route
              path="*"
              element={
                <>
                  <Header />
                  <div className="py-20 text-center font-bold text-slate-400">
                    404 - TRANG KHÔNG TỒN TẠI
                  </div>
                  <Footer />
                </>
              }
            />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
export default App;
