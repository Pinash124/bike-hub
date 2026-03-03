// src/components/auth/KYC.tsx
import { useState } from 'react'
import {
  ArrowLeft, Upload, ShieldCheck, Loader2, CheckCircle
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AuthCard } from './AuthLayout'
import { useAuth } from '../../contexts/AuthContext'

interface KYCData {
  idNumber: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  placeOfOrigin: string;
  placeOfResidence: string;
  expiryDate: string;
}

export default function KYC() {
  const navigate = useNavigate()
  const { uploadKYC, confirmKYC } = useAuth()

  // States
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [isCompleted, setIsCompleted] = useState(false)

  // File States
  const [frontImage, setFrontImage] = useState<File | null>(null)
  const [backImage, setBackImage] = useState<File | null>(null)

  // Draft Data States
  const [draftId, setDraftId] = useState<string | null>(null)
  const [kycData, setKycData] = useState<KYCData | null>(null)

  // Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
    if (e.target.files && e.target.files[0]) {
      if (type === 'front') setFrontImage(e.target.files[0])
      else setBackImage(e.target.files[0])
      setError('') // Clear error on new selection
    }
  }

  const handleUpload = async () => {
    if (!frontImage || !backImage) {
      setError('Vui lòng tải lên cả hai mặt của CMND/CCCD.')
      return
    }

    setIsLoading(true)
    setError('')
    try {
      const result = await uploadKYC(frontImage, backImage)
      setDraftId(result.draftId)
      setKycData(result.kyc as KYCData)
      setCurrentStep(2) // Move to review step
    } catch (err: any) {
      console.error('Upload failed:', err)
      setError(err.message || 'Tải lên thất bại. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!draftId) return

    setIsLoading(true)
    setError('')
    try {
      await confirmKYC(draftId)
      setIsCompleted(true)
    } catch (err: any) {
      console.error('Confirm failed:', err)
      setError(err.message || 'Xác nhận thất bại. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isCompleted) return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <AuthCard>
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <ShieldCheck size={44} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold uppercase mb-2 text-slate-800">Đã gửi yêu cầu</h2>
          <p className="text-sm text-slate-500 mb-6 px-8">Thông tin xác minh của bạn đã được gửi thành công và đang chờ duyệt.</p>
          <button onClick={() => navigate('/')} className="text-green-600 font-bold text-xs uppercase tracking-widest hover:text-green-700">Về trang chủ</button>
        </div>
      </AuthCard>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans antialiased">
      <button
        onClick={() => navigate('/')}
        className="fixed top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-green-600 transition-all font-bold text-[10px] uppercase tracking-[0.3em]"
      >
        <ArrowLeft size={16} /> Thoát
      </button>

      <AuthCard>
        <div className="flex flex-col w-full min-h-[500px]">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8 gap-3">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-green-600' : 'text-slate-300'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${currentStep >= 1 ? 'border-green-600 bg-green-50' : 'border-slate-200'}`}>1</div>
              <span className="text-[10px] font-bold uppercase">Tải ảnh</span>
            </div>
            <div className={`w-8 h-px ${currentStep >= 2 ? 'bg-green-600' : 'bg-slate-200'}`} />
            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-green-600' : 'text-slate-300'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${currentStep >= 2 ? 'border-green-600 bg-green-50' : 'border-slate-200'}`}>2</div>
              <span className="text-[10px] font-bold uppercase">Kiểm tra</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-1">
              {currentStep === 1 ? 'Xác thực định danh' : 'Kiểm tra thông tin'}
            </h2>
            <p className="text-xs text-slate-400">
              {currentStep === 1 ? 'Vui lòng tải lên ảnh CMND/CCCD rõ nét' : 'Vui lòng kiểm tra kỹ thông tin được trích xuất'}
            </p>
          </div>

          <div className="flex-1">
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-2 gap-4">
                  {/* Front Side */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Mặt trước</p>
                    <label className={`block border-2 border-dashed rounded-2xl h-40 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-slate-50 ${frontImage ? 'border-green-500 bg-green-50/10' : 'border-slate-200'}`}>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'front')} />
                      {frontImage ? (
                        <div className="flex flex-col items-center gap-2">
                          <CheckCircle size={32} className="text-green-500" />
                          <span className="text-[10px] text-green-600 font-bold truncate max-w-[120px]">{frontImage.name}</span>
                          <span className="text-[9px] text-slate-400 underline">Thay đổi</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-300">
                          <Upload size={32} />
                          <span className="text-[10px] font-bold">Tải ảnh lên</span>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Back Side */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Mặt sau</p>
                    <label className={`block border-2 border-dashed rounded-2xl h-40 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-slate-50 ${backImage ? 'border-green-500 bg-green-50/10' : 'border-slate-200'}`}>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'back')} />
                      {backImage ? (
                        <div className="flex flex-col items-center gap-2">
                          <CheckCircle size={32} className="text-green-500" />
                          <span className="text-[10px] text-green-600 font-bold truncate max-w-[120px]">{backImage.name}</span>
                          <span className="text-[9px] text-slate-400 underline">Thay đổi</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-300">
                          <Upload size={32} />
                          <span className="text-[10px] font-bold">Tải ảnh lên</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {error && <p className="text-red-500 text-xs text-center font-medium bg-red-50 py-2 rounded-lg">{error}</p>}

                <button
                  onClick={handleUpload}
                  disabled={isLoading || !frontImage || !backImage}
                  className="w-full bg-slate-900 text-white py-4 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={16} /> : <><Upload size={16} /> Trích xuất thông tin</>}
                </button>
              </div>
            )}

            {currentStep === 2 && kycData && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Họ tên</p>
                      <p className="text-sm font-bold text-slate-800">{kycData.fullName}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Số giấy tờ</p>
                      <p className="text-sm font-bold text-slate-800">{kycData.idNumber}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Ngày sinh</p>
                      <p className="text-sm font-bold text-slate-800">{kycData.dateOfBirth}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Giới tính</p>
                      <p className="text-sm font-bold text-slate-800">{kycData.gender}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Địa chỉ thường trú</p>
                      <p className="text-sm font-bold text-slate-800">{kycData.placeOfResidence}</p>
                    </div>
                  </div>
                </div>

                {error && <p className="text-red-500 text-xs text-center font-medium bg-red-50 py-2 rounded-lg">{error}</p>}

                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentStep(1)}
                    disabled={isLoading}
                    className="flex-1 py-4 rounded-full border border-slate-200 font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Chụp lại
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className="flex-1 bg-green-600 text-white py-4 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Xác nhận đúng'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </AuthCard>
    </div>
  )
}