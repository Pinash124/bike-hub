// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'

// --- Layout & Common Components ---
import Header from './components/common/Header'
import Footer from './components/common/Footer'

// --- Sections (Homepage) ---
import Banner from './components/sections/Banner'
import FilterSection from './components/sections/FilterSection'
import FeaturedBikes from './components/sections/FeaturedBikes'
import Categories from './components/sections/Categories'
import Features from './components/sections/Features'

// --- Auth Components ---
import Login from './components/auth/Login'
import Register from './components/auth/Register' 

// --- Dashboards & Pages ---
import SellerDashboard from './components/dashboards/SellerDashboard'
import BuyerDashboardPage from './components/buyer/BuyerDashboard'
import AdminDashboard from './components/dashboards/AdminDashboard'
import InspectorDashboard from './components/dashboards/InspectorDashboard'
import SearchPage from './pages/SearchPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderTrackingPage from './pages/OrderTrackingPage'

// --- Contexts & Protection ---
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { GuestMarketplace } from './components/guest/GuestMarketplace'

/**
 * Component Home: Giao diện nền tảng
 * Được tái sử dụng làm "phông nền" cho các lớp phủ Auth
 */
function Home() {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')

  return (
    <div className="relative">
      <Header />
      <main>
        <Banner />
        <FilterSection />
        <FeaturedBikes />
        <Categories 
          onSelectCategory={setSelectedCategory} 
          selectedCategory={selectedCategory} 
        />
        <Features />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<Home />} />
            
            <Route path="/marketplace" element={
              <><Header /><GuestMarketplace /><Footer /></>
            } />

            {/* AUTH ROUTES CÓ HIỆU ỨNG NỀN MỜ:
              Chúng ta render <Home /> trước, sau đó là <Login /> hoặc <Register />.
              Vì Auth component sử dụng 'fixed inset-0', nó sẽ phủ lên trên Home.
            */}
            <Route path="/login" element={
              <>
                <Home /> 
                <Login />
              </>
            } />
            
            <Route path="/register" element={
              <>
                <Home />
                <Register />
              </>
            } /> 
            
            {/* --- Product Discovery --- */}
            <Route path="/search" element={<><Header /><SearchPage /><Footer /></>} />
            <Route path="/product/:id" element={<><Header /><ProductDetailPage /><Footer /></>} />
            
            {/* --- Protected Routes - Seller --- */}
            <Route path="/seller/dashboard" element={
              <ProtectedRoute requiredRole="seller">
                <><Header /><SellerDashboard /><Footer /></>
              </ProtectedRoute>
            } />
            
            {/* --- Protected Routes - Buyer --- */}
            <Route path="/buyer/dashboard" element={
              <ProtectedRoute requiredRole="buyer">
                <><Header /><BuyerDashboardPage /><Footer /></>
              </ProtectedRoute>
            } />
            
            <Route path="/buyer/checkout" element={
              <ProtectedRoute requiredRole="buyer">
                <><Header /><CheckoutPage /><Footer /></>
              </ProtectedRoute>
            } />
            
            <Route path="/buyer/orders" element={
              <ProtectedRoute requiredRole="buyer">
                <><Header /><OrderTrackingPage /><Footer /></>
              </ProtectedRoute>
            } />
            
            {/* --- Protected Routes - Admin --- */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredRole="admin">
                <><Header /><AdminDashboard /><Footer /></>
              </ProtectedRoute>
            } />
            
            {/* --- Protected Routes - Inspector --- */}
            <Route path="/inspector/dashboard" element={
              <ProtectedRoute requiredRole="inspector">
                <><Header /><InspectorDashboard /><Footer /></>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App