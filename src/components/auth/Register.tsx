// src/components/auth/Register.tsx
import { useState } from 'react'
import { Mail, Lock, User, Eye, EyeOff, Phone, ShoppingBag, Store, Loader2, Bike } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AuthCard, AuthOverlay } from './AuthLayout'
import { useAuth } from '../../contexts/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // State mới cho việc chọn vai trò
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp')
    }

    try {
      setIsLoading(true)
      setError('')
      // Gửi cả thông tin role đã chọn lên API
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: role 
      })
      alert('Đăng ký thành công! Vui lòng đăng nhập.')
      navigate('/login') // Đẩy về trang login sau khi đăng ký xong
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthOverlay>
      <AuthCard>
        <div className="flex flex-col items-center w-full antialiased">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-slate-900 uppercase">Đăng ký tài khoản</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Chọn vai trò của bạn trên BikeHub</p>
          </div>

          {/* UI CHỌN VAI TRÒ */}
          <div className="grid grid-cols-2 gap-4 w-full mb-6">
            <button
              type="button"
              onClick={() => setRole('buyer')}
              className={`flex flex-col items-center p-4 rounded-3xl border-2 transition-all ${
                role === 'buyer' ? 'border-green-500 bg-green-50 shadow-lg' : 'border-slate-100 bg-slate-50 opacity-60'
              }`}
            >
              <ShoppingBag size={20} className={role === 'buyer' ? 'text-green-600' : 'text-slate-400'} />
              <span className={`text-[10px] font-bold uppercase mt-2 ${role === 'buyer' ? 'text-green-700' : 'text-slate-400'}`}>Người mua</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('seller')}
              className={`flex flex-col items-center p-4 rounded-3xl border-2 transition-all ${
                role === 'seller' ? 'border-green-500 bg-green-50 shadow-lg' : 'border-slate-100 bg-slate-50 opacity-60'
              }`}
            >
              <Store size={20} className={role === 'seller' ? 'text-green-600' : 'text-slate-400'} />
              <span className={`text-[10px] font-bold uppercase mt-2 ${role === 'seller' ? 'text-green-700' : 'text-slate-400'}`}>Người bán</span>
            </button>
          </div>

          {error && <div className="w-full mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold rounded-xl text-center uppercase">{error}</div>}

          <form className="w-full space-y-4" onSubmit={handleRegister}>
            {/* Các trường input như Tên, Email, Pass giữ nguyên... */}
            <div className="flex items-center gap-4 bg-slate-50 border-2 border-transparent px-6 py-3.5 rounded-full focus-within:bg-white focus-within:border-green-500 transition-all group">
              <User size={18} className="text-slate-300 group-focus-within:text-green-500" />
              <input className="flex-1 bg-transparent outline-none text-sm font-bold" placeholder="Họ và tên" required onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            
            <div className="flex items-center gap-4 bg-slate-50 border-2 border-transparent px-6 py-3.5 rounded-full focus-within:bg-white focus-within:border-green-500 transition-all group">
              <Mail size={18} className="text-slate-300 group-focus-within:text-green-500" />
              <input type="email" className="flex-1 bg-transparent outline-none text-sm font-bold" placeholder="Email" required onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>

            <div className="flex items-center gap-4 bg-slate-50 border-2 border-transparent px-6 py-3.5 rounded-full focus-within:bg-white focus-within:border-green-500 transition-all group">
              <Lock size={18} className="text-slate-300 group-focus-within:text-green-500" />
              <input type={showPassword ? 'text' : 'password'} className="flex-1 bg-transparent outline-none text-sm font-bold" placeholder="Mật khẩu" required onChange={e => setFormData({...formData, password: e.target.value})} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 border-2 border-transparent px-6 py-3.5 rounded-full focus-within:bg-white focus-within:border-green-500 transition-all group">
              <Lock size={18} className="text-slate-300 group-focus-within:text-green-500" />
              <input type="password" className="flex-1 bg-transparent outline-none text-sm font-bold" placeholder="Xác nhận mật khẩu" required onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
            </div>

            <button disabled={isLoading} className="w-full bg-green-600 text-white py-4 rounded-full font-black text-[11px] uppercase tracking-widest shadow-lg active:scale-95 transition-all flex justify-center gap-2">
              {isLoading ? <Loader2 className="animate-spin" /> : 'Hoàn tất đăng ký'}
            </button>
          </form>
        </div>
      </AuthCard>
    </AuthOverlay>
  )
}