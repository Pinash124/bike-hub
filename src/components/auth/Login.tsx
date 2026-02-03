// src/components/auth/Login.tsx
import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, X, Bike, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AuthOverlay, AuthCard } from './AuthLayout'
import { useAuth } from '../../contexts/AuthContext'

interface LoginModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginModal({ isOpen = true, onClose, onSwitchToRegister }: LoginModalProps) {
  const navigate = useNavigate()
  const { login } = useAuth()
  
  // Trạng thái form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null;

  // Xử lý đăng nhập và điều hướng theo vai trò
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu')
      return
    }

    try {
      setIsSubmitting(true)
      await login(email, password) 
      
      // Lấy thông tin user vừa lưu vào localStorage để điều hướng chính xác
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const user = JSON.parse(storedUser)
        
        // Điều hướng dựa trên vai trò (Role-based Navigation)
        if (user.role === 'seller') {
          navigate('/seller/dashboard')
        } else if (user.role === 'buyer') {
          navigate('/buyer/dashboard')
        } else if (user.role === 'admin') {
          navigate('/admin/dashboard')
        } else {
          navigate('/')
        }
      }

      if (onClose) onClose() 
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthOverlay>
      <AuthCard>
        {/* Nút đóng Modal */}
        {onClose && (
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-red-500 rounded-full transition-all z-10"
          >
            <X size={20} />
          </button>
        )}

        <div className="flex flex-col items-center w-full antialiased">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex bg-green-600 p-3.5 rounded-2xl shadow-xl shadow-green-200 mb-4">
              <Bike size={26} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              Đăng nhập <span className="text-green-600">BikeHub</span>
            </h2>
          </div>

          {/* Thông báo lỗi */}
          {error && (
            <div className="w-full mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold rounded-xl text-center uppercase tracking-wider">
              {error}
            </div>
          )}

          <form className="w-full space-y-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-6">Email Address</label>
              <div className="flex items-center gap-4 bg-slate-50 border-2 border-transparent px-6 py-4 rounded-full focus-within:bg-white focus-within:border-green-500 transition-all group">
                <Mail size={18} className="text-slate-400 group-focus-within:text-green-600" />
                <input 
                  className="flex-1 bg-transparent outline-none text-sm font-bold text-slate-800 placeholder:text-slate-300" 
                  type="email" 
                  placeholder="name@domain.com"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-6">Password</label>
              <div className="flex items-center gap-4 bg-slate-50 border-2 border-transparent px-6 py-4 rounded-full focus-within:bg-white focus-within:border-green-500 transition-all group">
                <Lock size={18} className="text-slate-400 group-focus-within:text-green-600" />
                <input 
                  className="flex-1 bg-transparent outline-none text-sm font-bold text-slate-800 placeholder:text-slate-300" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="text-slate-400 hover:text-green-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4.5 rounded-full font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-green-200 transition-all active:scale-95 mt-4 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" /> Đang xử lý...</>
              ) : (
                'Xác nhận đăng nhập'
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-10 w-full text-center">
             <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
              Chưa có tài khoản? 
              <button 
                onClick={() => onSwitchToRegister ? onSwitchToRegister() : navigate('/register')} 
                className="text-green-600 ml-2 hover:underline font-black"
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