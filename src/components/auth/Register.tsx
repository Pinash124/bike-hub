// src/components/auth/Register.tsx
import { useState } from 'react'
import { Mail, Lock, User, Eye, EyeOff, Phone, ChevronRight, Loader2, Bike } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AuthCard, AuthOverlay } from './AuthLayout'
import { useAuth } from '../../contexts/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
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
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      })
      alert('Đăng ký thành công! Vui lòng đăng nhập.')
      navigate('/login')
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
          <div className="text-center mb-8">
            <div className="inline-flex bg-green-600 p-3.5 rounded-2xl shadow-xl shadow-green-200 mb-4">
              <Bike size={26} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase">Tham gia <span className="text-green-600">BikeHub</span></h2>
          </div>

          {error && <div className="w-full mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold rounded-xl text-center uppercase">{error}</div>}

          <form className="w-full space-y-4" onSubmit={handleRegister}>
            <div className="flex items-center gap-4 bg-slate-50 border-2 border-transparent px-6 py-3.5 rounded-full focus-within:bg-white focus-within:border-green-500 transition-all group">
              <User size={18} className="text-slate-300 group-focus-within:text-green-500" />
              <input 
                className="flex-1 bg-transparent outline-none text-sm font-bold" 
                placeholder="Họ và tên"
                required
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="flex items-center gap-4 bg-slate-50 border-2 border-transparent px-6 py-3.5 rounded-full focus-within:bg-white focus-within:border-green-500 transition-all group">
              <Mail size={18} className="text-slate-300 group-focus-within:text-green-500" />
              <input 
                type="email"
                className="flex-1 bg-transparent outline-none text-sm font-bold" 
                placeholder="Email Address"
                required
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="flex items-center gap-4 bg-slate-50 border-2 border-transparent px-6 py-3.5 rounded-full focus-within:bg-white focus-within:border-green-500 transition-all group">
              <Lock size={18} className="text-slate-300 group-focus-within:text-green-500" />
              <input 
                type={showPassword ? 'text' : 'password'}
                className="flex-1 bg-transparent outline-none text-sm font-bold" 
                placeholder="Mật khẩu"
                required
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button 
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-4 rounded-full font-black text-[11px] uppercase tracking-widest shadow-lg active:scale-95 transition-all flex justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Tạo tài khoản'}
            </button>
          </form>
        </div>
      </AuthCard>
    </AuthOverlay>
  )
}