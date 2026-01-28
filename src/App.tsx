import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Banner from './components/Banner'
import FilterSection from './components/FilterSection'
import FeaturedBikes from './components/FeaturedBikes'
import Categories from './components/Categories'
import Features from './components/Features'
import Footer from './components/Footer'
import Login from './components/Login'
import Register from './components/Register'
import SellerDashboard from './components/SellerDashboard'
import BuyerDashboard from './components/BuyerDashboard'
import AdminDashboard from './components/AdminDashboard'
import InspectorDashboard from './components/InspectorDashboard'
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
