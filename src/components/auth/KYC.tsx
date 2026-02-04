// src/components/auth/KYC.tsx
import { useState, useEffect } from 'react'
import { 
  MapPin, Calendar, Hash, User, Phone, 
  ArrowLeft, Upload, ShieldCheck, ChevronRight, Loader2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AuthCard } from './AuthLayout'
import axios from 'axios'
import { API_ENDPOINTS } from '../../config/api'

// 1. Định nghĩa Interface cho dữ liệu KYC
interface KYCData {
  id: string;
  idNumber: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  placeOfOrigin: string;
  placeOfResidence: string;
  expiryDate: string;
  status: string;
  submittedAt: string;
  user: {
    username: string;
  };
}

export default function KYC() {
  const navigate = useNavigate()
  
  // States quản lý dữ liệu và trạng thái tải
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [isCompleted, setIsCompleted] = useState(false)

  // State quản lý dữ liệu form
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    idNumber: '',
    dob: '',
    address: ''
  })

  // 2. Kiểm tra trạng thái xác thực khi truy cập
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Vui lòng đăng nhập để thực hiện xác minh.')
          return
        }
        // Có thể gọi API GET_MY_INFO tại đây để kiểm tra token còn hạn không
      } catch (err) {
        setError('Không thể kết nối đến máy chủ.')
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  // 3. Xử lý logic điều hướng Form
  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 4))
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // 4. Render Loading/Error
  if (isLoading) return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <Loader2 className="animate-spin h-8 w-8 text-green-600" />
    </div>
  )

  if (isCompleted) return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <AuthCard>
        <div className="text-center py-12">
          <ShieldCheck size={48} className="text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold uppercase mb-2">Đã gửi yêu cầu</h2>
          <button onClick={() => navigate('/')} className="text-green-600 font-bold text-sm">Về trang chủ</button>
        </div>
      </AuthCard>
    </div>
  )

  // 5. Render Giao diện chính (Kết hợp tất cả logic vào một return duy nhất)
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans antialiased">
      <button 
        onClick={() => navigate('/')}
        className="fixed top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-green-600 transition-all font-bold text-[10px] uppercase tracking-[0.3em]"
      >
        <ArrowLeft size={16} /> Thoát
      </button>

      <AuthCard>
        <div className="flex flex-col w-full">
          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-8 px-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  step <= currentStep ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {step < currentStep ? '✓' : step}
                </div>
                {step < 4 && <div className={`flex-1 h-[2px] mx-2 ${step < currentStep ? 'bg-green-600' : 'bg-slate-100'}`} />}
              </div>
            ))}
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 uppercase">
              {currentStep === 1 && 'Thông tin cá nhân'}
              {currentStep === 2 && 'Giấy tờ tùy thân'}
              {currentStep === 3 && 'Địa chỉ cư trú'}
              {currentStep === 4 && 'Kiểm tra lại'}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Bước {currentStep} của 4</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-5">Họ và Tên</label>
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-5 py-3 rounded-full">
                    <User size={16} className="text-slate-300" />
                    <input 
                      name="fullName" 
                      value={formData.fullName} 
                      onChange={handleInputChange} 
                      className="flex-1 bg-transparent outline-none text-xs font-medium" 
                      placeholder="Nguyễn Văn A" 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Thêm các bước 2 và 3 tương tự tại đây... */}

            {currentStep === 4 && (
              <div className="bg-slate-50/50 rounded-3xl p-5 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Họ tên</span>
                  <span className="text-[11px] font-bold text-slate-800">{formData.fullName || 'Chưa nhập'}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {currentStep > 1 && (
                <button type="button" onClick={handleBack} className="px-6 py-3.5 rounded-full border border-slate-100 font-bold text-[10px] uppercase text-slate-400">
                  Quay lại
                </button>
              )}
              <button 
                type="button" 
                onClick={currentStep === 4 ? () => setIsCompleted(true) : handleNext}
                className="flex-1 bg-green-600 text-white py-3.5 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2"
              >
                {currentStep === 4 ? 'Hoàn tất xác minh' : 'Tiếp theo'}
                <ChevronRight size={14} />
              </button>
            </div>
          </form>
        </div>
      </AuthCard>
    </div>
  )
}