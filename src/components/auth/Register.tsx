// src/pages/UnifiedAuth.tsx
import { useState } from 'react'
import { 
  Mail, Lock, User, Eye, EyeOff, Phone, 
  ShieldCheck, ArrowLeft, ChevronRight, Hash, 
  Calendar, MapPin, Upload, CheckCircle, 
  ShoppingBag, Store 
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AuthCard, AuthOverlay } from '../auth/AuthLayout'

export default function UnifiedAuth() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Thêm state role vào formData
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer')

  const nextStep = () => setCurrentStep(prev => prev + 1)
  const prevStep = () => setCurrentStep(prev => prev - 1)

  return (
    <AuthOverlay>
      {currentStep < 5 && (
        <button 
          onClick={() => navigate('/')}
          className="fixed top-10 left-10 flex items-center gap-3 text-slate-400 hover:text-green-600 transition-all font-bold text-[9px] uppercase tracking-[0.3em]"
        >
          <ArrowLeft size={14} /> Back to home
        </button>
      )}

      <AuthCard>
        <div className="flex flex-col min-h-[560px] w-full antialiased justify-between">
          
          <div>
            {/* 1. PROGRESS BAR */}
            {currentStep < 5 && (
              <div className="flex items-center justify-between mb-10 px-4">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex items-center flex-1 last:flex-none">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500 ${
                      s <= currentStep ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'bg-slate-50 text-slate-300'
                    }`}>
                      {s < currentStep ? '✓' : s}
                    </div>
                    {s < 4 && (
                      <div className={`flex-1 h-[2px] mx-3 rounded-full ${s < currentStep ? 'bg-green-600' : 'bg-slate-50'}`} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 2. HEADER */}
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-1">
                {currentStep === 1 && 'Chọn vai trò của bạn'}
                {currentStep === 2 && 'Bảo mật mật khẩu'}
                {currentStep === 3 && 'Xác minh danh tính'}
                {currentStep === 4 && 'Địa chỉ & Giấy tờ'}
                {currentStep === 5 && 'Xác minh thành công'}
              </h2>
              <div className="flex justify-center items-center gap-2">
                <span className="h-px w-4 bg-green-200"></span>
                <p className="text-[10px] text-green-600 font-extrabold uppercase tracking-[0.2em]">Step 0{currentStep}</p>
                <span className="h-px w-4 bg-green-200"></span>
              </div>
            </div>

            {/* 3. FORM FIELDS */}
            <form className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-700">
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* ROLE SELECTION CARDS */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setRole('buyer')}
                      className={`flex flex-col items-center justify-center p-4 rounded-[2rem] border-2 transition-all duration-300 gap-2 ${
                        role === 'buyer' 
                        ? 'border-green-500 bg-green-50/50 shadow-lg shadow-green-100' 
                        : 'border-slate-100 bg-slate-50/50 opacity-60'
                      }`}
                    >
                      <div className={`p-2 rounded-full ${role === 'buyer' ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        <ShoppingBag size={18} />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${role === 'buyer' ? 'text-green-700' : 'text-slate-400'}`}>Người mua</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('seller')}
                      className={`flex flex-col items-center justify-center p-4 rounded-[2rem] border-2 transition-all duration-300 gap-2 ${
                        role === 'seller' 
                        ? 'border-green-500 bg-green-50/50 shadow-lg shadow-green-100' 
                        : 'border-slate-100 bg-slate-50/50 opacity-60'
                      }`}
                    >
                      <div className={`p-2 rounded-full ${role === 'seller' ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        <Store size={18} />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${role === 'seller' ? 'text-green-700' : 'text-slate-400'}`}>Người bán</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 px-6 py-4 rounded-full focus-within:bg-white focus-within:border-green-500 transition-all group">
                      <User size={16} className="text-slate-300 group-focus-within:text-green-500" />
                      <input className="flex-1 bg-transparent outline-none text-xs font-medium" placeholder="Họ và tên của bạn" />
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 px-6 py-4 rounded-full focus-within:bg-white focus-within:border-green-500 transition-all group">
                      <Mail size={16} className="text-slate-300 group-focus-within:text-green-500" />
                      <input className="flex-1 bg-transparent outline-none text-xs font-medium" placeholder="Địa chỉ Email" />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 px-6 py-4 rounded-full focus-within:bg-white focus-within:border-green-500 transition-all group">
                      <Lock size={16} className="text-slate-300 group-focus-within:text-green-500" />
                      <input className="flex-1 bg-transparent outline-none text-xs font-medium" type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu mới" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}><Eye size={16} className="text-slate-300" /></button>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 px-6 py-4 rounded-full focus-within:bg-white focus-within:border-green-500 transition-all group">
                      <ShieldCheck size={16} className="text-slate-300 group-focus-within:text-green-500" />
                      <input className="flex-1 bg-transparent outline-none text-xs font-medium" type={showPassword ? 'text' : 'password'} placeholder="Xác nhận mật khẩu" />
                    </div>
                  </div>
                  <p className="px-6 text-[9px] text-slate-400 font-medium leading-relaxed">
                    * Bạn đang đăng ký với vai trò <span className="text-green-600 font-bold uppercase">{role === 'buyer' ? 'Người mua' : 'Người bán'}</span>.
                  </p>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-6">Loại giấy tờ</label>
                    <select className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-full text-xs font-medium outline-none appearance-none cursor-pointer">
                      <option>Căn cước công dân (CCCD)</option>
                      <option>Hộ chiếu (Passport)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-full outline-none text-xs font-medium" placeholder="Số ID" />
                    <input type="date" className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-full outline-none text-xs font-medium text-slate-400" />
                  </div>
                </>
              )}

              {currentStep === 4 && (
                <>
                  <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 px-6 py-4 rounded-full group">
                    <MapPin size={16} className="text-slate-300 group-focus-within:text-green-500" />
                    <input className="flex-1 bg-transparent outline-none text-xs font-medium" placeholder="Địa chỉ cư trú" />
                  </div>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2.5rem] py-10 hover:bg-slate-50 cursor-pointer group transition-all">
                    <Upload size={24} className="text-slate-200 group-hover:text-green-600 mb-3 transition-colors" />
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Tải lên mặt trước ID</span>
                    <input type="file" className="hidden" />
                  </label>
                </>
              )}

              {currentStep === 5 && (
                <div className="text-center py-4">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <CheckCircle size={44} className="text-green-600" />
                  </div>
                  <p className="text-[12px] text-slate-500 font-medium leading-relaxed px-6">
                    Chào mừng <span className="font-bold text-slate-900">{role === 'buyer' ? 'Người mua' : 'Người bán'}</span>! Hồ sơ của bạn đang được BikeHub xác minh.
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* PHẦN DƯỚI: Nút điều hướng */}
          <div className="pt-8">
            <div className="flex gap-3">
              {currentStep > 1 && currentStep < 5 && (
                <button 
                  onClick={prevStep}
                  className="px-8 py-4 rounded-full border border-slate-100 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 hover:text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Back
                </button>
              )}
              
              {currentStep < 4 ? (
                <button 
                  onClick={nextStep}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-green-900/10 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  Tiếp theo <ChevronRight size={16} />
                </button>
              ) : currentStep === 4 ? (
                <button 
                  onClick={() => { setIsLoading(true); setTimeout(() => { setIsLoading(false); nextStep(); }, 1500); }}
                  className="flex-1 bg-slate-900 hover:bg-black text-white py-4 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all"
                >
                  {isLoading ? 'Đang xử lý...' : 'Hoàn tất đăng ký'}
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/')}
                  className="flex-1 bg-green-600 text-white py-4 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] active:scale-95 transition-all"
                >
                  Vào trang chủ
                </button>
              )}
            </div>
          </div>
        </div>
      </AuthCard>
    </AuthOverlay>
  )
}