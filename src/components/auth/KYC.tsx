// src/pages/KYC.tsx
import { useState } from 'react'
import { 
  FileText, MapPin, Calendar, Hash, User, Phone, 
  ArrowLeft, Upload, CheckCircle, Bike, ShieldCheck, ChevronRight 
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AuthCard } from '../auth/AuthLayout'

export default function KYC() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: '', idType: 'passport', idNumber: '', 
    dateOfBirth: '', address: '', city: '', 
    country: 'Vietnam', phone: '', documentFile: null as File | null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const handleNext = () => currentStep < 4 && setCurrentStep(currentStep + 1)
  const handleBack = () => currentStep > 1 && setCurrentStep(currentStep - 1)

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <AuthCard>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 uppercase mb-2">Xác minh thành công!</h2>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-6">
              Thông tin của bạn đang được hệ thống BikeHub kiểm duyệt. <br/> 
              Vui lòng chờ trong 24h.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-slate-900 text-white py-3.5 rounded-full font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all"
            >
              Về trang chủ
            </button>
          </div>
        </AuthCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans antialiased">
      <button 
        onClick={() => navigate('/')}
        className="fixed top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-green-600 transition-all font-bold text-[10px] uppercase tracking-[0.3em] group"
      >
        <ArrowLeft size={16} /> Thoát
      </button>

      <AuthCard>
        <div className="flex flex-col w-full">
          {/* 1. MINI PROGRESS BAR: Rất mỏng để tiết kiệm diện tích */}
          <div className="flex items-center justify-between mb-8 px-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  step <= currentStep ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-slate-100 text-slate-400'
                }`}>
                  {step < currentStep ? '✓' : step}
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-[2px] mx-2 ${step < currentStep ? 'bg-green-600' : 'bg-slate-100'}`} />
                )}
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

          <form className="space-y-4">
            {/* STEP 1: PERSONAL */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-5">Họ và Tên</label>
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-5 py-3 rounded-full focus-within:bg-white focus-within:border-green-500 transition-all">
                    <User size={16} className="text-slate-300" />
                    <input className="flex-1 bg-transparent outline-none text-xs font-medium" placeholder="Nguyễn Văn A" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-5">Số điện thoại</label>
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-5 py-3 rounded-full focus-within:bg-white focus-within:border-green-500 transition-all">
                    <Phone size={16} className="text-slate-300" />
                    <input className="flex-1 bg-transparent outline-none text-xs font-medium" placeholder="09xx xxx xxx" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: DOCUMENTS */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-5">Loại giấy tờ</label>
                  <select className="w-full bg-slate-50 border border-slate-100 px-5 py-3 rounded-full outline-none text-xs font-medium appearance-none">
                    <option>Hộ Chiếu (Passport)</option>
                    <option>Căn cước công dân</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-5">Số giấy tờ</label>
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-5 py-3 rounded-full">
                    <Hash size={16} className="text-slate-300" />
                    <input className="flex-1 bg-transparent outline-none text-xs font-medium" placeholder="Nhập số..." />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-5">Ngày sinh</label>
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-5 py-3 rounded-full">
                    <Calendar size={16} className="text-slate-300" />
                    <input type="date" className="flex-1 bg-transparent outline-none text-xs font-medium text-slate-500" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: ADDRESS & UPLOAD */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-5">Địa chỉ</label>
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-5 py-3 rounded-full">
                    <MapPin size={16} className="text-slate-300" />
                    <input className="flex-1 bg-transparent outline-none text-xs font-medium" placeholder="Số nhà, tên đường..." />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input className="bg-slate-50 border border-slate-100 px-5 py-3 rounded-full outline-none text-[11px] font-medium" placeholder="Thành phố" />
                  <input className="bg-slate-50 border border-slate-100 px-5 py-3 rounded-full outline-none text-[11px] font-medium" placeholder="Quốc gia" />
                </div>
                <div className="pt-2">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem] p-4 hover:bg-slate-50 transition-all cursor-pointer group">
                    <Upload size={20} className="text-slate-300 group-hover:text-green-600 mb-2" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Tải ảnh mặt trước</span>
                    <input type="file" className="hidden" />
                  </label>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW */}
            {currentStep === 4 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-slate-50/50 rounded-3xl p-5 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Họ tên</span>
                    <span className="text-[11px] font-bold text-slate-800">{formData.fullName || 'Nguyễn Văn A'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Số ID</span>
                    <span className="text-[11px] font-bold text-slate-800">03829xxx...</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Địa chỉ</span>
                    <span className="text-[11px] font-bold text-slate-800 text-right max-w-[150px] truncate">Hồ Chí Minh, VN</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 px-2 pt-2">
                  <ShieldCheck size={14} className="text-green-600 shrink-0" />
                  <p className="text-[9px] text-slate-400 font-medium leading-tight">Dữ liệu được bảo mật bởi hệ thống mã hóa BikeHub 256-bit.</p>
                </div>
              </div>
            )}

            {/* NAVIGATION BUTTONS */}
            <div className="flex gap-3 pt-4">
              {currentStep > 1 && (
                <button 
                  type="button" onClick={handleBack}
                  className="px-6 py-3.5 rounded-full border border-slate-100 font-bold text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50"
                >
                  Quay lại
                </button>
              )}
              <button 
                type="button" 
                onClick={currentStep === 4 ? () => setIsCompleted(true) : handleNext}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-green-100 active:scale-95 transition-all flex items-center justify-center gap-2"
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