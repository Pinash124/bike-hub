import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Header from './components/common/Header'
import Banner from './components/sections/Banner'
import FilterSection from './components/sections/FilterSection'
import FeaturedBikes from './components/sections/FeaturedBikes'
import Categories from './components/sections/Categories'
import Features from './components/sections/Features'
import Footer from './components/common/Footer'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import KYC from './components/auth/KYC'
import SellerDashboard from './components/dashboards/SellerDashboard'
import BuyerDashboardPage from './components/buyer/BuyerDashboard'
import AdminDashboard from './components/dashboards/AdminDashboard'
import InspectorDashboard from './components/dashboards/InspectorDashboard'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { GuestMarketplace } from './components/guest/GuestMarketplace'
import SearchPage from './pages/SearchPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderTrackingPage from './pages/OrderTrackingPage'

function Home() {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')

  return (
    <>
      <Header />
      <Banner />
      <FilterSection />
      <FeaturedBikes />
      <Categories onSelectCategory={setSelectedCategory} selectedCategory={selectedCategory} />
      <Features />
      <Footer />
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<><Header /><GuestMarketplace /><Footer /></>} />
            <Route path="/login" element={<><Header /><Login /><Footer /></>} />
            <Route path="/register" element={<><Header /><Register /><Footer /></>} />
            <Route path="/kyc" element={<KYC />} />
            
            {/* Protected Routes - Seller */}
            <Route 
              path="/seller/dashboard" 
              element={
                <ProtectedRoute requiredRole="seller">
                  <><Header /><SellerDashboard /><Footer /></>
                </ProtectedRoute>
              } 
            />
            
            {/* Buyer Routes - Product Discovery */}
            <Route path="/search" element={<><Header /><SearchPage /><Footer /></>} />
            <Route path="/product/:id" element={<><Header /><ProductDetailPage /><Footer /></>} />
            
            {/* Protected Routes - Buyer */}
            <Route 
              path="/buyer/dashboard" 
              element={
                <ProtectedRoute requiredRole="buyer">
                  <><Header /><BuyerDashboardPage /><Footer /></>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/buyer/checkout" 
              element={
                <ProtectedRoute requiredRole="buyer">
                  <><Header /><CheckoutPage /><Footer /></>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/buyer/orders" 
              element={
                <ProtectedRoute requiredRole="buyer">
                  <><Header /><OrderTrackingPage /><Footer /></>
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Routes - Admin */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <><Header /><AdminDashboard /><Footer /></>
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Routes - Inspector */}
            <Route 
              path="/inspector/dashboard" 
              element={
                <ProtectedRoute requiredRole="inspector">
                  <><Header /><InspectorDashboard /><Footer /></>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
