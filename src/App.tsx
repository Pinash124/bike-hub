import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// --- Layout & Common Components ---
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

// --- Sections (Homepage) ---

// --- Auth Components ---
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import KYC from "./components/auth/KYC"; // Bổ sung tệp KYC đã tạo

// --- Dashboards & Pages ---
import SellerDashboard from "./components/dashboards/SellerDashboard";

import AdminDashboard from "./components/dashboards/AdminDashboard";
import InspectorDashboard from "./components/dashboards/InspectorDashboard";
import ProfilePage from "./pages/ProfilePage"; // Bổ sung ProfilePage
import CartPage from "./pages/CartPage"; // Bổ sung CartPage
import SearchPage from "./pages/SearchPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import CreateListingPage from "./pages/CreateListingPage";
import ScheduleInspectionPage from "./pages/ScheduleInspectionPage";
import DebugPage from "./pages/DebugPage";
import ChoosePlanPage from "./pages/seller/ChoosePlanPage";
import PaymentResultPage from "./pages/seller/PaymentResultPage";

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
    <AppLayout>
      <ProfilePage />
    </AppLayout>
  );
}

function Home() {
  const { role, isLoading } = useAuth();

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

  // For buyer, seller, and guest: show marketplace
  return (
    <AppLayout>
      <GuestMarketplace />
    </AppLayout>
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
                <AppLayout>
                  <Unauthorized />
                </AppLayout>
              }
            />
            <Route path="/debug" element={<DebugPage />} />
            <Route
              path="/marketplace"
              element={
                <AppLayout>
                  <GuestMarketplace />
                </AppLayout>
              }
            />
            {/* AUTH ROUTES */}
            <Route
              path="/login"
              element={<Login />}
            />
            <Route
              path="/register"
              element={<Register />}
            />
            {/* Payment Return Callback */}
            <Route
              path="/payment/result"
              element={
                <AppLayout>
                  <PaymentResultPage />
                </AppLayout>
              }
            />
            {/* --- Product Discovery --- */}
            <Route
              path="/search"
              element={
                <AppLayout>
                  <SearchPage />
                </AppLayout>
              }
            />
            <Route
              path="/product/:id"
              element={
                <AppLayout>
                  <ProductDetailPage />
                </AppLayout>
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
                  <AppLayout>
                    <SellerDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/new-bike"
              element={
                <ProtectedRoute requiredRole="seller">
                  <AppLayout>
                    <CreateListingPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/schedule"
              element={
                <ProtectedRoute requiredRole="seller">
                  <AppLayout>
                    <ScheduleInspectionPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/choose-plan/:listingId"
              element={
                <ProtectedRoute requiredRole="seller">
                  <AppLayout>
                    <ChoosePlanPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/buyer/cart"
              element={
                <ProtectedRoute requiredRole="buyer">
                  <AppLayout>
                    <CartPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/checkout"
              element={
                <ProtectedRoute requiredRole="buyer">
                  <AppLayout>
                    <CheckoutPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/orders"
              element={
                <ProtectedRoute requiredRole="buyer">
                  <AppLayout>
                    <OrderTrackingPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            {/* --- Protected Routes - Admin & Inspector --- */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AppLayout>
                    <AdminDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inspector/dashboard"
              element={
                <ProtectedRoute requiredRole="inspector">
                  <AppLayout>
                    <InspectorDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            {/* --- 404 Route --- */}
            <Route
              path="*"
              element={
                <AppLayout>
                  <div className="py-20 text-center font-bold text-slate-400">
                    404 - TRANG KHÔNG TỒN TẠI
                  </div>
                </AppLayout>
              }
            />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
export default App;
