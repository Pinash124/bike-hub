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
import BuyerDashboard from './components/dashboards/BuyerDashboard'
import AdminDashboard from './components/dashboards/AdminDashboard'
import InspectorDashboard from './components/dashboards/InspectorDashboard'
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
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<><Header /><Login /><Footer /></>} />
        <Route path="/register" element={<><Header /><Register /><Footer /></>} />
        <Route path="/kyc" element={<KYC />} />
        
        {/* Seller Routes */}
        <Route path="/seller/dashboard" element={<><Header /><SellerDashboard /><Footer /></>} />
        
        {/* Buyer Routes */}
        <Route path="/buyer/dashboard" element={<><Header /><BuyerDashboard /><Footer /></>} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<><Header /><AdminDashboard /><Footer /></>} />
        
        {/* Inspector Routes */}
        <Route path="/inspector/dashboard" element={<><Header /><InspectorDashboard /><Footer /></>} />
      </Routes>
    </Router>
  )
}

export default App
