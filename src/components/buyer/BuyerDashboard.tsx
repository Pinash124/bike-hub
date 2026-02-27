import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ShoppingCart, Package, MapPin, LogOut, Trash2, Bike, ChevronRight } from 'lucide-react';
import { addressService } from '../../services/address.service';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';


interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const BuyerDashboard: React.FC = () => {
  const { user, logout, isLoggingOut } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();

  // Đọc tham số tab từ URL khi load trang
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['home', 'cart', 'orders', 'addresses', 'profile'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    navigate(`/buyer/dashboard?tab=${tabId}`, { replace: true });
  };

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
    <div className={`mx-auto ${activeTab === 'cart' ? 'max-w-7xl' : 'max-w-[1200px] p-6'}`}>
      {/* Ẩn Header & Tabs nếu đang xem giỏ hàng */}
      {activeTab !== 'cart' && (
        <>
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
              <button key={tab.id} className={`flex items-center gap-2 px-3 py-2 rounded ${activeTab === tab.id ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => handleTabChange(tab.id)}>
                {tab.icon}
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

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
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto py-8">
      {/* Premium Header */}
      <div className="flex flex-col items-center justify-center text-center space-y-3 mb-10 pb-8 border-b border-green-100">
        <span className="text-green-600 bg-green-50 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm inset-0">
          BikeHub Premium
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter">
          Giỏ Hàng <span className="text-green-600">Của Bạn</span>
        </h2>
        <p className="text-slate-500 text-sm font-medium tracking-wide">
          Sở hữu ngay mẫu xe đạp mơ ước của bạn.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100/50 flex flex-col items-center max-w-2xl mx-auto">
          <div className="w-32 h-32 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full flex items-center justify-center mb-8 shadow-inner">
            <ShoppingCart size={48} className="text-green-400" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Chưa có sản phẩm nào!</h3>
          <p className="text-slate-500 mb-10 max-w-sm text-center leading-relaxed">
            Giỏ hàng của bạn đang trống rỗng. Hãy khám phá những mẫu xe đạp thể thao tuyệt đẹp trên BikeHub ngay hôm nay.
          </p>
          <button
            onClick={() => navigate('/search')}
            className="px-10 py-4 bg-slate-900 hover:bg-black text-white font-bold uppercase tracking-widest text-xs rounded-full shadow-2xl shadow-slate-900/30 transition-all active:scale-95"
          >
            Khám phá bộ sưu tập
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column - Form */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="font-bold text-slate-800 uppercase tracking-widest text-xs">Sản phẩm</span>
              <span className="font-bold text-slate-800 uppercase tracking-widest text-xs hidden sm:block">Số lượng</span>
            </div>

            {items.map((item) => (
              <div key={item.productId} className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] ring-1 ring-slate-100/50 flex flex-col sm:flex-row gap-6 items-center group hover:ring-green-200 transition-all duration-300">
                {/* Image */}
                <div className="w-full sm:w-36 h-36 rounded-2xl bg-green-50/50 overflow-hidden shrink-0 flex items-center justify-center relative shadow-inner">
                  {item.image ? (
                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                  ) : (
                    <Bike size={40} className="text-green-200" />
                  )}
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl pointer-events-none"></div>
                </div>

                {/* Info */}
                <div className="flex-1 w-full flex flex-col min-h-[144px] justify-between py-2">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-black text-xl text-slate-800 line-clamp-2 leading-tight group-hover:text-green-600 transition-colors">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-600">👤</span>
                        {item.sellerName}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 shrink-0"
                      title="Xóa sản phẩm"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    <span className="font-black text-green-600 text-xl tracking-tight">
                      {item.price.toLocaleString('vi-VN')} ₫
                    </span>

                    {/* Quantity Control */}
                    <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1.5 ring-1 ring-slate-200/50">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm hover:text-green-600 hover:border-green-200 font-medium transition-all"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-bold text-sm text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm hover:text-green-600 hover:border-green-200 font-medium transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Checkout Summary */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-slate-900/40 sticky top-28 overflow-hidden relative">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

              <h3 className="text-xl font-black mb-8 relative z-10">Tổng Quan Đơn Hàng</h3>

              <div className="space-y-5 mb-8 text-sm relative z-10">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Tạm tính ({items.reduce((acc, i) => acc + i.quantity, 0)} sản phẩm)</span>
                  <span className="font-bold text-white tracking-wide">{totalPrice.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Phí dịch vụ</span>
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 font-bold text-[10px] rounded-md uppercase tracking-widest">Miễn phí</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-700/50 mb-10 relative z-10">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-slate-300 font-medium">Tổng cộng</span>
                  <div className="text-right">
                    <span className="text-3xl font-black text-green-500 tracking-tighter">
                      {totalPrice.toLocaleString('vi-VN')}
                    </span>
                    <span className="text-green-500 ml-1 font-bold">₫</span>
                  </div>
                </div>
                <p className="text-right text-[11px] text-slate-500 mt-1 uppercase tracking-wider">Đã bao gồm thuế VAT</p>
              </div>

              <button
                onClick={() => navigate('/buyer/checkout')}
                className="w-full flex items-center justify-center gap-3 py-4.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-[0_0_40px_rgba(34,197,94,0.3)] active:scale-95 relative z-10 group overflow-hidden"
              >
                <span className="relative z-10">Thanh Toán Ngay</span>
                <ChevronRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
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
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    detail: '',
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setIsLoading(true);
    // Dynamic import to avoid circular dependencies if any, though here it's fine.
    // Importing addressService at top level is better. 
    // Assuming addressService is imported.
    try {
      const data = await addressService.getMyAddresses();
      setAddresses(data);
    } catch (error) {
      console.error('Failed to fetch addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await addressService.addAddress(formData as any);
      setShowForm(false);
      fetchAddresses(); // Refresh list
    } catch (error) {
      alert('Failed to add address');
    }
  };

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
              <input name="fullName" value={formData.fullName} onChange={handleInputChange} className="mt-1 w-full border rounded p-2" type="text" placeholder="Enter your full name" />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone Number</label>
              <input name="phone" value={formData.phone} onChange={handleInputChange} className="mt-1 w-full border rounded p-2" type="tel" placeholder="Enter phone number" />
            </div>
            <div>
              <label className="block text-sm font-medium">Province/City</label>
              <input name="province" value={formData.province} onChange={handleInputChange} className="mt-1 w-full border rounded p-2" type="text" placeholder="Province" />
            </div>
            <div>
              <label className="block text-sm font-medium">District</label>
              <input name="district" value={formData.district} onChange={handleInputChange} className="mt-1 w-full border rounded p-2" type="text" placeholder="District" />
            </div>
            <div>
              <label className="block text-sm font-medium">Ward</label>
              <input name="ward" value={formData.ward} onChange={handleInputChange} className="mt-1 w-full border rounded p-2" type="text" placeholder="Ward" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Detailed Address</label>
              <textarea name="detail" value={formData.detail} onChange={handleInputChange} className="mt-1 w-full border rounded p-2" placeholder="Street address, building number, etc." rows={2}></textarea>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded">Save Address</button>
            <button className="border px-4 py-2 rounded" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? <p>Loading addresses...</p> : addresses.length === 0 ? <p className="text-gray-600">No addresses saved yet</p> : (
          addresses.map((addr: any) => (
            <div key={addr.id} className="bg-white p-4 rounded shadow border border-gray-100 flex justify-between items-center">
              <div>
                <p className="font-bold">{addr.fullName} <span className="text-gray-500 font-normal">| {addr.phone}</span></p>
                <p className="text-sm text-gray-600">{addr.detail}, {addr.ward}</p>
                <p className="text-sm text-gray-600">{addr.district}, {addr.province}</p>
              </div>
              <button className="text-red-500 text-sm hover:underline">Delete</button>
            </div>
          ))
        )}
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
        {['seller', 'buyer'].includes(user?.role) && (
          <div className="bg-white p-4 rounded shadow md:col-span-2">
            <label className="block text-sm text-gray-500">KYC Status</label>
            <p className={`mt-2 ${user?.isKYCVerified ? 'text-green-600' : 'text-yellow-600'}`}>{user?.isKYCVerified ? '✓ Verified' : '⚠ Not Verified'}</p>
          </div>
        )}
      </div>
      <button className="bg-red-500 text-white px-4 py-2 rounded">Change Password</button>
    </div>
  );
};

export default BuyerDashboard;
