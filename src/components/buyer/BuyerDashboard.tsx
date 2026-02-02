import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ShoppingCart, Package, MapPin, Star, LogOut } from 'lucide-react';
import '../../styles/BuyerDashboardPage.css';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const BuyerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  const tabs: Tab[] = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'cart', label: 'Cart', icon: <ShoppingCart size={20} /> },
    { id: 'orders', label: 'Orders', icon: <Package size={20} /> },
    { id: 'addresses', label: 'Addresses', icon: <MapPin size={20} /> },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="buyer-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome, {user?.name}!</h1>
          <p className="email">{user?.email}</p>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          <LogOut size={20} />
          Logout
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="dashboard-content">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'cart' && <CartTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'addresses' && <AddressesTab />}
        {activeTab === 'profile' && <ProfileTab user={user} />}
      </div>
    </div>
  );
};

// Home Tab Component
const HomeTab: React.FC = () => {
  return (
    <div className="tab-content">
      <h2>Dashboard Overview</h2>
      <div className="overview-grid">
        <div className="overview-card">
          <div className="card-icon">🛒</div>
          <h3>Items in Cart</h3>
          <p className="card-value">0</p>
        </div>
        <div className="overview-card">
          <div className="card-icon">📦</div>
          <h3>Active Orders</h3>
          <p className="card-value">0</p>
        </div>
        <div className="overview-card">
          <div className="card-icon">✅</div>
          <h3>Completed Orders</h3>
          <p className="card-value">0</p>
        </div>
        <div className="overview-card">
          <div className="card-icon">⭐</div>
          <h3>Reviews Left</h3>
          <p className="card-value">0</p>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Quick Links</h3>
        <div className="links-grid">
          <a href="/marketplace" className="quick-link">
            🔍 Browse Bikes
          </a>
          <a href="#" className="quick-link">
            🛒 View Cart
          </a>
          <a href="#" className="quick-link">
            📦 Track Orders
          </a>
          <a href="#" className="quick-link">
            📍 Manage Addresses
          </a>
        </div>
      </div>
    </div>
  );
};

// Cart Tab Component
const CartTab: React.FC = () => {
  return (
    <div className="tab-content">
      <h2>Shopping Cart</h2>
      <div className="empty-state">
        <div className="empty-icon">🛒</div>
        <p>Your cart is empty</p>
        <a href="/marketplace" className="btn-primary">
          Continue Shopping
        </a>
      </div>
    </div>
  );
};

// Orders Tab Component
const OrdersTab: React.FC = () => {
  return (
    <div className="tab-content">
      <h2>Your Orders</h2>
      <div className="empty-state">
        <div className="empty-icon">📦</div>
        <p>No orders yet</p>
        <a href="/marketplace" className="btn-primary">
          Start Shopping
        </a>
      </div>
    </div>
  );
};

// Addresses Tab Component
const AddressesTab: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Saved Addresses</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Address'}
        </button>
      </div>

      {showForm && (
        <div className="address-form">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="Enter your full name" />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" placeholder="Enter phone number" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Province/City</label>
              <select>
                <option>Select province</option>
              </select>
            </div>
            <div className="form-group">
              <label>District</label>
              <select>
                <option>Select district</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Ward</label>
              <select>
                <option>Select ward</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Detailed Address</label>
            <textarea
              placeholder="Street address, building number, etc."
              rows={2}
            ></textarea>
          </div>
          <div className="form-actions">
            <button className="btn-primary">Save Address</button>
            <button
              className="btn-secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="empty-state">
        <p>No addresses saved yet</p>
      </div>
    </div>
  );
};

// Profile Tab Component
interface ProfileTabProps {
  user: any;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ user }) => {
  return (
    <div className="tab-content">
      <h2>Profile Information</h2>
      <div className="profile-card">
        <div className="profile-section">
          <label>Full Name</label>
          <p>{user?.name || 'Not set'}</p>
        </div>
        <div className="profile-section">
          <label>Email</label>
          <p>{user?.email}</p>
        </div>
        <div className="profile-section">
          <label>Phone</label>
          <p>{user?.phone || 'Not set'}</p>
        </div>
        <div className="profile-section">
          <label>Member Since</label>
          <p>{new Date(user?.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="profile-section">
          <label>KYC Status</label>
          <p className={user?.isKYCVerified ? 'verified' : 'unverified'}>
            {user?.isKYCVerified ? '✓ Verified' : '⚠ Not Verified'}
          </p>
        </div>
      </div>
      <button className="btn-danger">Change Password</button>
    </div>
  );
};

export default BuyerDashboard;
