import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ShoppingCart, Package, MapPin, LogOut } from 'lucide-react';


interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const BuyerDashboard: React.FC = () => {
  const { user, logout, isLoggingOut } = useAuth();
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
  };

  return (
    <div className="max-w-[1200px] mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Welcome, {user?.name}!</h1>
          <p className="text-sm text-gray-600">{user?.email}</p>
        </div>
        <button 
          className="bg-red-500 text-white px-3 py-2 rounded flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Logging out...
            </>
          ) : (
            <>
              <LogOut size={18} /> Logout
            </>
          )}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button key={tab.id} className={`flex items-center gap-2 px-3 py-2 rounded ${activeTab === tab.id ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setActiveTab(tab.id)}>
            {tab.icon}
            <span className="text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div>
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
    <div>
      <h2 className="text-lg font-semibold mb-4">Dashboard Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded shadow text-center">
          <div className="text-3xl">🛒</div>
          <h3 className="mt-2 font-medium">Items in Cart</h3>
          <p className="text-xl font-bold">0</p>
        </div>
        <div className="p-4 bg-white rounded shadow text-center">
          <div className="text-3xl">📦</div>
          <h3 className="mt-2 font-medium">Active Orders</h3>
          <p className="text-xl font-bold">0</p>
        </div>
        <div className="p-4 bg-white rounded shadow text-center">
          <div className="text-3xl">✅</div>
          <h3 className="mt-2 font-medium">Completed Orders</h3>
          <p className="text-xl font-bold">0</p>
        </div>
        <div className="p-4 bg-white rounded shadow text-center">
          <div className="text-3xl">⭐</div>
          <h3 className="mt-2 font-medium">Reviews Left</h3>
          <p className="text-xl font-bold">0</p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
        <div className="grid grid-cols-2 gap-3">
          <a href="/marketplace" className="p-3 bg-gray-100 rounded text-center">🔍 Browse Bikes</a>
          <a href="#" className="p-3 bg-gray-100 rounded text-center">🛒 View Cart</a>
          <a href="#" className="p-3 bg-gray-100 rounded text-center">📦 Track Orders</a>
          <a href="#" className="p-3 bg-gray-100 rounded text-center">📍 Manage Addresses</a>
        </div>
      </div>
    </div>
  );
};

// Cart Tab Component
const CartTab: React.FC = () => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Shopping Cart</h2>
      <div className="flex flex-col items-center justify-center py-6 text-gray-600">
        <div className="text-4xl">🛒</div>
        <p className="mt-2">Your cart is empty</p>
        <a href="/marketplace" className="mt-3 bg-green-600 text-white px-4 py-2 rounded">Continue Shopping</a>
      </div>
    </div>
  );
};

// Orders Tab Component
const OrdersTab: React.FC = () => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Your Orders</h2>
      <div className="flex flex-col items-center justify-center py-6 text-gray-600">
        <div className="text-4xl">📦</div>
        <p className="mt-2">No orders yet</p>
        <a href="/marketplace" className="mt-3 bg-green-600 text-white px-4 py-2 rounded">Start Shopping</a>
      </div>
    </div>
  );
};

// Addresses Tab Component
const AddressesTab: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Saved Addresses</h2>
        <button className="bg-green-600 text-white px-3 py-2 rounded" onClick={() => setShowForm(!showForm)}>{showForm ? '✕ Cancel' : '+ Add Address'}</button>
      </div>

      {showForm && (
        <div className="bg-white p-4 rounded shadow mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Full Name</label>
              <input className="mt-1 w-full border rounded p-2" type="text" placeholder="Enter your full name" />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone Number</label>
              <input className="mt-1 w-full border rounded p-2" type="tel" placeholder="Enter phone number" />
            </div>
            <div>
              <label className="block text-sm font-medium">Province/City</label>
              <select className="mt-1 w-full border rounded p-2"><option>Select province</option></select>
            </div>
            <div>
              <label className="block text-sm font-medium">District</label>
              <select className="mt-1 w-full border rounded p-2"><option>Select district</option></select>
            </div>
            <div>
              <label className="block text-sm font-medium">Ward</label>
              <select className="mt-1 w-full border rounded p-2"><option>Select ward</option></select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Detailed Address</label>
              <textarea className="mt-1 w-full border rounded p-2" placeholder="Street address, building number, etc." rows={2}></textarea>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button className="bg-green-600 text-white px-4 py-2 rounded">Save Address</button>
            <button className="border px-4 py-2 rounded" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="text-gray-600">
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
    <div>
      <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-4 rounded shadow">
          <label className="block text-sm text-gray-500">Full Name</label>
          <p className="font-medium">{user?.name || 'Not set'}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <label className="block text-sm text-gray-500">Email</label>
          <p className="font-medium">{user?.email}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <label className="block text-sm text-gray-500">Phone</label>
          <p className="font-medium">{user?.phone || 'Not set'}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <label className="block text-sm text-gray-500">Member Since</label>
          <p className="font-medium">{new Date(user?.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="bg-white p-4 rounded shadow md:col-span-2">
          <label className="block text-sm text-gray-500">KYC Status</label>
          <p className={`mt-2 ${user?.isKYCVerified ? 'text-green-600' : 'text-yellow-600'}`}>{user?.isKYCVerified ? '✓ Verified' : '⚠ Not Verified'}</p>
        </div>
      </div>
      <button className="bg-red-500 text-white px-4 py-2 rounded">Change Password</button>
    </div>
  );
};

export default BuyerDashboard;
