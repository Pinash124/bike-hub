// src/components/auth/KYC.tsx
import { useState, useEffect } from 'react'
import { 
  FileText, MapPin, Calendar, Hash, User, Phone, 
  ArrowLeft, Upload, CheckCircle, Bike, ShieldCheck, ChevronRight, Loader2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AuthCard } from './AuthLayout'
import axios from 'axios'
import { API_ENDPOINTS } from '../../config/api'

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
  user: {
    id: string;
    username: string;
    password: string;
    name: string;
    roles: Array<{
      name: string;
      description: string;
    }>;
    verificationToken: string;
    expiration: string;
    verified: boolean;
    kyc: string;
  };
  status: string;
  verifiedAt: string;
  submittedAt: string;
}

export default function KYC() {
  const navigate = useNavigate()
  const [kycList, setKycList] = useState<KYCData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchKYCData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('No authentication token found')
          return
        }

        const response = await axios.get(API_ENDPOINTS.GET_MY_INFO, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })  

        const { code, message, result } = response.data

        if (code !== 0) {
          throw new Error(message || 'Failed to fetch KYC data')
        }

        setKycList(result)
      } catch (err) {
        console.error('Error fetching KYC data:', err)
        setError('Failed to load KYC data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchKYCData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <AuthCard>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin h-8 w-8 text-slate-600" />
            <span className="ml-2 text-slate-600">Loading KYC data...</span>
          </div>
        </AuthCard>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <AuthCard>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-slate-900 text-white px-4 py-2 rounded-full font-bold text-sm"
            >
              Back to Home
            </button>
          </div>
        </AuthCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 font-sans antialiased">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-slate-600 hover:text-slate-900 mr-4"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">KYC Applications</h1>
        </div>

        <div className="space-y-4">
          {kycList.map((kyc) => (
            <AuthCard key={kyc.id}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{kyc.fullName}</h3>
                    <p className="text-sm text-slate-600">ID: {kyc.idNumber}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    kyc.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    kyc.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {kyc.status}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center">
                    <Calendar size={16} className="text-slate-400 mr-2" />
                    <span className="text-sm text-slate-600">DOB: {new Date(kyc.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <User size={16} className="text-slate-400 mr-2" />
                    <span className="text-sm text-slate-600">Gender: {kyc.gender}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin size={16} className="text-slate-400 mr-2" />
                    <span className="text-sm text-slate-600">Nationality: {kyc.nationality}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone size={16} className="text-slate-400 mr-2" />
                    <span className="text-sm text-slate-600">User: {kyc.user.username}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  Submitted: {new Date(kyc.submittedAt).toLocaleString()}
                  {kyc.verifiedAt && (
                    <span className="ml-4">Verified: {new Date(kyc.verifiedAt).toLocaleString()}</span>
                  )}
                </div>
              </div>
            </AuthCard>
          ))}
        </div>

        {kycList.length === 0 && (
          <AuthCard>
            <div className="text-center py-8">
              <p className="text-slate-600">No KYC applications found.</p>
            </div>
          </AuthCard>
        )}
      </div>
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