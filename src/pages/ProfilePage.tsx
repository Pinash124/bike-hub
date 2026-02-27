// src/pages/ProfilePage.tsx
import { useAuth } from '../contexts/AuthContext';
import { Camera, Mail, Phone, Calendar, ShieldCheck, AlertCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header section */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
                    <div className="h-32 bg-gradient-to-r from-green-500 to-emerald-600"></div>

                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12 mb-6">
                            <div className="relative">
                                <div className="w-24 h-24 bg-white rounded-full p-1.5 shadow-lg">
                                    <div className="w-full h-full bg-slate-100 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center text-3xl font-black text-slate-400">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <button className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-green-700 transition">
                                    <Camera size={14} />
                                </button>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-full font-bold text-xs uppercase tracking-widest transition-colors mb-2"
                            >
                                <LogOut size={16} /> Đăng xuất
                            </button>
                        </div>

                        <div className="space-y-1">
                            <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                Vai trò: <span className="text-green-600 bg-green-50 px-2.5 py-1 rounded-md">{user.role}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Personal Info */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-4">
                            <span className="text-green-500">👤</span> Thông tin cá nhân
                        </h2>

                        <div className="space-y-5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                    <Mail size={18} className="text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</p>
                                    <p className="text-sm font-semibold text-slate-800">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                    <Phone size={18} className="text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Số điện thoại</p>
                                    <p className="text-sm font-semibold text-slate-800">{user.phone || 'Chưa cập nhật'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                    <Calendar size={18} className="text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ngày tham gia</p>
                                    <p className="text-sm font-semibold text-slate-800">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>
                        </div>

                        <button className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-widest rounded-xl transition-colors">
                            Chỉnh sửa thông tin
                        </button>
                    </div>

                    {/* Security & KYC */}
                    <div className="space-y-6">
                        {['seller', 'buyer'].includes(user.role) && (
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-4">
                                    <span className="text-green-500">🛡️</span> Trạng thái xác minh
                                </h2>

                                {user.isKYCVerified ? (
                                    <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                            <ShieldCheck size={24} className="text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-green-900">Đã xác minh (KYC)</h3>
                                            <p className="text-xs font-medium text-green-700 mt-0.5">Tài khoản an toàn và có đầy đủ quyền.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                                            <AlertCircle size={24} className="text-amber-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-amber-900">Chưa xác minh KYC</h3>
                                            <p className="text-xs font-medium text-amber-700 mt-0.5">Giới hạn quyền mua bán.</p>
                                        </div>
                                        <button
                                            onClick={() => navigate('/kyc')}
                                            className="px-4 py-2 bg-amber-500 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-amber-600 transition"
                                        >
                                            Xác minh
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
                                <span className="text-green-500">🔒</span> Bảo mật
                            </h2>
                            <button className="w-full py-3.5 border-2 border-slate-100 hover:border-green-200 hover:text-green-700 text-slate-700 font-bold text-xs uppercase tracking-widest rounded-xl transition-colors">
                                Đổi mật khẩu
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
