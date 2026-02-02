import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute'
import GuestMarketplace from './components/guest/GuestMarketplace'
import './App.css'

function Home() {
  return (
    <>
      <Header />
      <Banner />
      <FilterSection />
      <FeaturedBikes />
      <Categories />
      <Features />
      <Footer />
    </>
  )
}

function App() {
  return (
    <AuthProvider>
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
          
          {/* Protected Routes - Buyer */}
          <Route 
            path="/buyer/dashboard" 
            element={
              <ProtectedRoute requiredRole="buyer">
                <><Header /><BuyerDashboardPage /><Footer /></>
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
    </AuthProvider>
  )
}

export default App
