import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

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
const Login = lazy(() => import("./components/auth/Login"));
const Register = lazy(() => import("./components/auth/Register"));
const KYC = lazy(() => import("./components/auth/KYC"));

// --- Dashboards & Pages ---
const SellerDashboard = lazy(
  () => import("./components/dashboards/SellerDashboard"),
);
const AdminDashboard = lazy(
  () => import("./components/dashboards/AdminDashboard"),
);
const InspectorDashboard = lazy(
  () => import("./components/dashboards/InspectorDashboard"),
);
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrderTrackingPage = lazy(() => import("./pages/OrderTrackingPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage.tsx"));
const CreateListingPage = lazy(() => import("./pages/CreateListingPage"));
const ScheduleInspectionPage = lazy(
  () => import("./pages/ScheduleInspectionPage"),
);
const DebugPage = lazy(() => import("./pages/DebugPage"));
const ChoosePlanPage = lazy(() => import("./pages/seller/ChoosePlanPage"));
const PaymentResultPage = lazy(
  () => import("./pages/seller/PaymentResultPage"),
);
const EditListingPage = lazy(() => import("./pages/EditListingPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));

// --- Contexts & Protection ---
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
const GuestMarketplace = lazy(() =>
  import("./components/guest/GuestMarketplace").then((m) => ({
    default: m.GuestMarketplace,
  })),
);

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

import { useAuth } from "./contexts/AuthContext";

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
        <p className="text-slate-500">Đang tải trang...</p>
      </div>
    </div>
  );
}

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
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const hasPaymentCallbackParams =
    query.has("code") ||
    query.has("status") ||
    query.has("orderCode") ||
    query.has("cancel") ||
    query.has("id");

  if (hasPaymentCallbackParams) {
    return <Navigate to={`/payment/result${location.search}`} replace />;
  }

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
          <Suspense fallback={<PageFallback />}>
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
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              {/* Payment Return Callback */}
              <Route
                path="/payment/result"
                element={
                  <AppLayout>
                    <PaymentResultPage />
                  </AppLayout>
                }
              />
              <Route
                path="/seller/payment/result"
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
                path="/seller/new-bike" //crea
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
                path="/seller/edit/:id"
                element={
                  <ProtectedRoute requiredRole="seller">
                    <AppLayout>
                      <EditListingPage />
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
              <Route
                path="/buyer/favorites"
                element={
                  <ProtectedRoute requiredRole="buyer">
                    <AppLayout>
                      <FavoritesPage />
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
          </Suspense>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
export default App;
