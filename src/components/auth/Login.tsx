import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface LoginErrors {
  [key: string]: string | undefined
}

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<LoginErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: LoginErrors = {}
    
    if (!email) {
      newErrors.email = 'Email không được để trống'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email không hợp lệ'
    }
    
    if (!password) {
      newErrors.password = 'Mật khẩu không được để trống'
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Store user session (in real app, this would be an API call)
      localStorage.setItem('user', JSON.stringify({ email, name: email.split('@')[0] }))
      navigate('/')
    }, 1000)
  }

  const clearError = (field: string) => {
    const newErrors = { ...errors }
    delete newErrors[field]
    setErrors(newErrors)
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 bg-gray-50">
      <div className="w-full max-w-md px-6 relative">
        <button 
          className="absolute top-4 left-0 p-2 text-gray-600 hover:text-gray-800"
          onClick={() => navigate('/')}
          title="Quay lại trang chủ"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Đăng Nhập</h2>
            <p className="text-sm text-gray-600">Đăng nhập để quản lý tài khoản và các giao dịch của bạn</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <div className={`mt-2 flex items-center gap-2 border rounded px-3 py-2 ${errors.email ? 'border-red-500' : 'border-gray-200'}`}>
                <Mail size={18} />
                <input
                  className="flex-1 outline-none text-sm"
                  type="email"
                  id="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) clearError('email')
                  }}
                />
              </div>
              {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật Khẩu</label>
              <div className={`mt-2 flex items-center gap-2 border rounded px-3 py-2 ${errors.password ? 'border-red-500' : 'border-gray-200'}`}>
                <Lock size={18} />
                <input
                  className="flex-1 outline-none text-sm"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) clearError('password')
                  }}
                />
                <button
                  type="button"
                  className="text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="text-red-500 text-sm">{errors.password}</span>}
            </div>

            <div className="flex items-center justify-between mb-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4" />
                <span>Ghi nhớ tôi</span>
              </label>
              <a href="#" className="text-sm text-green-600">Quên mật khẩu?</a>
            </div>

            <button 
              type="submit" 
              className="w-full bg-green-600 text-white py-2 rounded font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </button>
          </form>

          <div className="flex items-center justify-center gap-4 my-4 text-sm text-gray-500">
            <span>Hoặc</span>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 py-2 rounded border text-sm">🔵 Facebook</button>
            <button className="flex-1 py-2 rounded border text-sm">📧 Google</button>
          </div>

          <div className="text-center mt-4 text-sm text-gray-600">
            <p>Chưa có tài khoản? <a href="/register" className="text-green-600">Đăng ký ngay</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}
