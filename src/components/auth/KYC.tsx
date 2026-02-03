// src/pages/KYC.tsx
import { useState } from 'react'
import { MapPin, Hash, User, Phone, Upload, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AuthCard, AuthOverlay } from '../auth/AuthLayout'
import { useAuth } from '../../contexts/AuthContext'

export default function KYC() {
  const navigate = useNavigate()
  const { submitKYC } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [documentFile, setDocumentFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    address: '',
    phone: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!documentFile) return alert('Vui lòng tải lên ảnh ID')

    try {
      setIsLoading(true)
      const data = new FormData()
      data.append('fullName', formData.fullName)
      data.append('idNumber', formData.idNumber)
      data.append('address', formData.address)
      data.append('phone', formData.phone)
      data.append('file', documentFile)

      await submitKYC(data)
      setIsCompleted(true)
    } catch (err) {
      alert('Gửi hồ sơ thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  if (isCompleted) {
    return (
      <AuthOverlay>
        <AuthCard>
          <div className="flex flex-col items-center text-center p-6">
            <CheckCircle size={60} className="text-green-600 mb-4" />
            <h2 className="text-xl font-black uppercase">Đã gửi hồ sơ!</h2>
            <p className="text-sm text-slate-500 my-4">BikeHub sẽ duyệt hồ sơ của bạn trong 24h.</p>
            <button onClick={() => navigate('/')} className="w-full bg-slate-900 text-white py-3 rounded-full font-bold uppercase text-[10px]">Quay lại trang chủ</button>
          </div>
        </AuthCard>
      </AuthOverlay>
    )
  }

  return (
    <AuthOverlay>
      <AuthCard>
        <div className="w-full">
          <h2 className="text-xl font-black uppercase mb-6 text-center">Xác minh danh tính</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Họ tên trên ID</label>
              <div className="flex items-center gap-3 bg-slate-50 border p-3.5 rounded-full">
                <User size={18} className="text-slate-300" />
                <input className="flex-1 bg-transparent outline-none text-sm font-bold" required onChange={e => setFormData({...formData, fullName: e.target.value})} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Số ID / CCCD</label>
              <div className="flex items-center gap-3 bg-slate-50 border p-3.5 rounded-full">
                <Hash size={18} className="text-slate-300" />
                <input className="flex-1 bg-transparent outline-none text-sm font-bold" required onChange={e => setFormData({...formData, idNumber: e.target.value})} />
              </div>
            </div>

            <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-6 hover:bg-slate-50 cursor-pointer transition-all">
              <Upload size={24} className="text-slate-300 mb-2" />
              <span className="text-[10px] font-black uppercase text-slate-400">{documentFile ? documentFile.name : 'Tải lên mặt trước ID'}</span>
              <input type="file" className="hidden" accept="image/*" onChange={e => setDocumentFile(e.target.files?.[0] || null)} />
            </label>

            <button 
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-4 rounded-full font-black text-[11px] uppercase tracking-widest flex justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Gửi xác minh'}
            </button>
          </form>
        </div>
      </AuthCard>
    </AuthOverlay>
  )
}