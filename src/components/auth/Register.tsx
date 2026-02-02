import { useState } from 'react'
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Phone } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface FormData {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  [key: string]: string | undefined
}

export default function Register() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)

  const validateForm = () => {
    const newErrors: FormErrors = {}
    
    if (!formData.name) {
      newErrors.name = 'Tên không được để trống'
    } else if (formData.name.length < 3) {
      newErrors.name = 'Tên phải có ít nhất 3 ký tự'
    }
    
    if (!formData.email) {
      newErrors.email = 'Email không được để trống'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Số điện thoại không được để trống'
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ'
    }
    
    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu không được để trống'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp'
    }
    
    if (!agreeTerms) {
      newErrors.terms = 'Bạn phải đồng ý với điều khoản'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      const newErrors = { ...errors }
      delete newErrors[name]
      setErrors(newErrors)
    }
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
      // Store user session
      localStorage.setItem('user', JSON.stringify({ 
        email: formData.email, 
        name: formData.name,
        phone: formData.phone
      }))
      // Navigate to KYC instead of home
      navigate('/kyc')
    }, 1000)
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
            <h2 className="text-2xl font-bold">Đăng Ký Tài Khoản</h2>
            <p className="text-sm text-gray-600">Tạo tài khoản để bắt đầu mua bán xe đạp</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Họ và Tên</label>
              <div className={`mt-2 flex items-center gap-2 border rounded px-3 py-2 ${errors.name ? 'border-red-500' : 'border-gray-200'}`}>
                <User size={18} />
                <input className="flex-1 outline-none text-sm" type="text" id="name" name="name" placeholder="Nhập họ và tên" value={formData.name} onChange={handleChange} />
              </div>
              {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <div className={`mt-2 flex items-center gap-2 border rounded px-3 py-2 ${errors.email ? 'border-red-500' : 'border-gray-200'}`}>
                <Mail size={18} />
                <input className="flex-1 outline-none text-sm" type="email" id="email" name="email" placeholder="Nhập email của bạn" value={formData.email} onChange={handleChange} />
              </div>
              {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
            </div>

            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Số Điện Thoại</label>
              <div className={`mt-2 flex items-center gap-2 border rounded px-3 py-2 ${errors.phone ? 'border-red-500' : 'border-gray-200'}`}>
                <Phone size={18} />
                <input className="flex-1 outline-none text-sm" type="tel" id="phone" name="phone" placeholder="Nhập số điện thoại" value={formData.phone} onChange={handleChange} />
              </div>
              {errors.phone && <span className="text-red-500 text-sm">{errors.phone}</span>}
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật Khẩu</label>
              <div className={`mt-2 flex items-center gap-2 border rounded px-3 py-2 ${errors.password ? 'border-red-500' : 'border-gray-200'}`}>
                <Lock size={18} />
                <input className="flex-1 outline-none text-sm" type={showPassword ? 'text' : 'password'} id="password" name="password" placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)" value={formData.password} onChange={handleChange} />
                <button type="button" className="text-gray-600" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
              {errors.password && <span className="text-red-500 text-sm">{errors.password}</span>}
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Xác Nhận Mật Khẩu</label>
              <div className={`mt-2 flex items-center gap-2 border rounded px-3 py-2 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'}`}>
                <Lock size={18} />
                <input className="flex-1 outline-none text-sm" type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" placeholder="Xác nhận mật khẩu" value={formData.confirmPassword} onChange={handleChange} />
                <button type="button" className="text-gray-600" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
              {errors.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword}</span>}
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm">
                <input className="h-4 w-4" type="checkbox" checked={agreeTerms} onChange={(e) => { setAgreeTerms(e.target.checked); if (errors.terms) { const newErrors = { ...errors }; delete newErrors.terms; setErrors(newErrors); } }} />
                <span>Tôi đồng ý với <a href="#" className="text-green-600">Điều khoản sử dụng</a> và <a href="#" className="text-green-600">Chính sách bảo mật</a></span>
              </label>
              {errors.terms && <span className="text-red-500 text-sm">{errors.terms}</span>}
            </div>

            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded font-semibold" disabled={isLoading}>{isLoading ? 'Đang tạo tài khoản...' : 'Đăng Ký'}</button>
          </form>

          <div className="flex items-center justify-center gap-4 my-4 text-sm text-gray-500">
            <span>Hoặc</span>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 py-2 rounded border text-sm">🔵 Facebook</button>
            <button className="flex-1 py-2 rounded border text-sm">📧 Google</button>
          </div>

          <div className="text-center mt-4 text-sm text-gray-600">Đã có tài khoản? <a href="/login" className="text-green-600">Đăng nhập ngay</a></div>
        </div>
      </div>
    </div>
  )
}
