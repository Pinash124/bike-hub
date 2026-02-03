// src/components/auth/Login.tsx
import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, X, Bike } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AuthOverlay, AuthCard } from './AuthLayout'

// Sửa Props thành Optional (?) để App.tsx gọi <Login /> không bị lỗi
interface LoginModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginModal({ 
  isOpen = true, // Mặc định mở nếu không truyền props (dùng cho standalone page)
  onClose, 
  onSwitchToRegister 
}: LoginModalProps) {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  if (!isOpen) return null;

  return (
    <AuthOverlay>
      <AuthCard>
        {/* Nút đóng: Chỉ hiển thị nếu có hàm onClose (khi dùng làm Modal) */}
        {onClose && (
          <button 
            onClick={onClose} 
            className="absolute top-5 right-5 p-1.5 text-slate-300 hover:text-red-500 transition-all z-10"
          >
            <X size={18} />
          </button>
        )}

        <div className="flex flex-col items-center w-full antialiased">
          {/* HEADER: Font chữ mềm mại, màu Slate sang trọng */}
          <div className="text-center mb-6">
            <div className="inline-flex bg-green-600 p-2.5 rounded-xl shadow-lg shadow-green-100 mb-3">
              <Bike size={22} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight leading-tight">
              Đăng nhập <br/><span className="text-green-600 font-extrabold text-2xl">BikeHub</span>
            </h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 opacity-100">
              Chào mừng bạn trở lại
            </p>
          </div>

          {/* FORM: Khoảng cách space-y-4 giúp trải đều form mà không cần scroll */}
          <form className="w-full space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-5">
                Email Address
              </label>
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-5 py-3.5 rounded-full focus-within:bg-white focus-within:border-green-500 focus-within:shadow-xl focus-within:shadow-green-500/5 transition-all group">
                <Mail size={16} className="text-slate-300 group-focus-within:text-green-600" />
                <input 
                  className="flex-1 bg-transparent outline-none text-xs font-medium placeholder:text-slate-300" 
                  type="email" 
                  placeholder="email@domain.com" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-5">
                Password
              </label>
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-5 py-3.5 rounded-full focus-within:bg-white focus-within:border-green-500 focus-within:shadow-xl focus-within:shadow-green-500/5 transition-all group">
                <Lock size={16} className="text-slate-300 group-focus-within:text-green-600" />
                <input 
                  className="flex-1 bg-transparent outline-none text-xs font-medium placeholder:text-slate-300" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-300 hover:text-green-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-5 pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-3.5 h-3.5 accent-green-600 rounded-sm border-slate-200" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight group-hover:text-slate-600 transition-colors">
                  Ghi nhớ
                </span>
              </label>
              <a href="#" className="text-[10px] font-bold text-green-600 uppercase hover:underline underline-offset-2 transition-all">
                Quên?
              </a>
            </div>

            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-green-900/10 transition-all active:scale-95 mt-2">
              Xác nhận đăng nhập
            </button>
          </form>

          {/* FOOTER: Gọn nhẹ, trải đều */}
          <div className="mt-8 w-full text-center">
            <div className="relative flex items-center justify-center mb-6">
              <div className="w-full border-t border-slate-100"></div>
              <span className="absolute bg-white px-3 text-[9px] font-bold text-slate-300 uppercase tracking-widest">Hoặc</span>
            </div>

            <div className="flex gap-3 mb-6">
              <button className="flex-1 py-2.5 rounded-full border border-slate-100 font-bold text-[9px] uppercase hover:bg-slate-50 transition-all text-slate-400 tracking-widest">
                Google
              </button>
              <button className="flex-1 py-2.5 rounded-full border border-slate-100 font-bold text-[9px] uppercase hover:bg-slate-50 transition-all text-slate-400 tracking-widest">
                Facebook
              </button>
            </div>
            
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
              Chưa có tài khoản? 
              <button 
                type="button"
                onClick={() => onSwitchToRegister ? onSwitchToRegister() : navigate('/register')} 
                className="text-green-600 ml-1.5 hover:underline font-extrabold cursor-pointer"
              >
                Đăng ký ngay
              </button>
            </p>
          </div>
        </div>
      </AuthCard>
    </AuthOverlay>
  );
}