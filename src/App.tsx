import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import UserInfo from './pages/UserInfo'
import Login from './components/auth/Login'
import SignUp from './components/auth/SignUp'
import Header from './components/Header'
import Footer from './components/Footer'
import './App.css'

// Placeholder components for dashboards not yet fully implemented in the file tree
const SellerDashboard = () => <div className="p-8">Seller Dashboard Component</div>
const BuyerDashboard = () => <div className="p-8">Buyer Dashboard Component</div>
const AdminDashboard = () => <div className="p-8">Admin Dashboard Component</div>
const InspectorDashboard = () => <div className="p-8">Inspector Dashboard Component</div>

function App() {
  return (
    <>
      <Routes>
        {/* Main Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/user-info" element={<UserInfo />} />

        {/* Role-Based Dashboard Routes */}
        <Route 
          path="/seller/dashboard" 
          element={<><Header /><SellerDashboard /><Footer /></>} 
        />
        <Route 
          path="/buyer/dashboard" 
          element={<><Header /><BuyerDashboard /><Footer /></>} 
        />
        <Route 
          path="/admin/dashboard" 
          element={<><Header /><AdminDashboard /><Footer /></>} 
        />
        <Route 
          path="/inspector/dashboard" 
          element={<><Header /><InspectorDashboard /><Footer /></>} 
        />

        {/* Fallback for Register path if needed */}
        <Route path="/register" element={<SignUp />} />
      </Routes>
    </>
  )
}

export default App