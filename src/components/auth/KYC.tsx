import { useState } from 'react'
import { 
  FileText, 
  MapPin, 
  Calendar, 
  Hash, 
  User, 
  Phone,
  ArrowLeft,
  Upload,
  CheckCircle
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface KYCFormData {
  fullName: string
  idType: string
  idNumber: string
  dateOfBirth: string
  address: string
  city: string
  country: string
  phone: string
  documentFile: File | null
}

interface KYCErrors {
  [key: string]: string | undefined
}

interface KYCProps {
  onKYCComplete?: (data: KYCFormData) => void
}

export default function KYC({ onKYCComplete }: KYCProps) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<KYCFormData>({
    fullName: '',
    idType: 'passport',
    idNumber: '',
    dateOfBirth: '',
    address: '',
    city: '',
    country: 'Vietnam',
    phone: '',
    documentFile: null
  })
  const [errors, setErrors] = useState<KYCErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const validateStep1 = () => {
    const newErrors: KYCErrors = {}

    if (!formData.fullName) {
      newErrors.fullName = 'Họ và tên không được để trống'
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = 'Họ và tên phải có ít nhất 3 ký tự'
    }

    if (!formData.phone) {
      newErrors.phone = 'Số điện thoại không được để trống'
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: KYCErrors = {}

    if (!formData.idNumber) {
      newErrors.idNumber = 'Số CMND/Hộ chiếu không được để trống'
    } else if (formData.idNumber.length < 9) {
      newErrors.idNumber = 'Số CMND/Hộ chiếu không hợp lệ'
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Ngày sinh không được để trống'
    } else {
      const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear()
      if (age < 18) {
        newErrors.dateOfBirth = 'Bạn phải đủ 18 tuổi'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors: KYCErrors = {}

    if (!formData.address) {
      newErrors.address = 'Địa chỉ không được để trống'
    }

    if (!formData.city) {
      newErrors.city = 'Thành phố/Tỉnh không được để trống'
    }

    if (!formData.country) {
      newErrors.country = 'Quốc gia không được để trống'
    }

    if (!formData.documentFile) {
      newErrors.documentFile = 'Vui lòng tải lên giấy tờ tùy thân'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    let isValid = false

    if (currentStep === 1) {
      isValid = validateStep1()
    } else if (currentStep === 2) {
      isValid = validateStep2()
    } else if (currentStep === 3) {
      isValid = validateStep3()
    }

    if (isValid) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setErrors({})
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          documentFile: 'File không được vượt quá 5MB'
        }))
        return
      }
      setFormData(prev => ({
        ...prev,
        documentFile: file
      }))
      if (errors.documentFile) {
        const newErrors = { ...errors }
        delete newErrors.documentFile
        setErrors(newErrors)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (currentStep === 3 && validateStep3()) {
      setIsLoading(true)
      // Simulate API call to submit KYC
      setTimeout(() => {
        setIsLoading(false)
        setIsCompleted(true)
        
        // Call callback if provided
        if (onKYCComplete) {
          onKYCComplete(formData)
        }

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/')
        }, 2000)
      }, 1500)
    }
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle size={64} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900">Xác minh thành công!</h2>
            <p className="text-gray-600 mb-6">Thông tin KYC của bạn đã được ghi nhận. Chúng tôi sẽ xem xét trong 24-48 giờ.</p>
            <div className="bg-gray-50 rounded p-4 space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Họ và tên:</span>
                <strong className="text-gray-900">{formData.fullName}</strong>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Số {formData.idType === 'passport' ? 'Hộ chiếu' : 'CMND'}:</span>
                <strong className="text-gray-900">{formData.idNumber}</strong>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Địa chỉ:</span>
                <strong className="text-gray-900">{formData.address}, {formData.city}, {formData.country}</strong>
              </div>
            </div>
            <p className="text-sm text-gray-500 animate-pulse">Chuyển hướng trong 2 giây...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4">
      <div className="w-full max-w-2xl">
        <button 
          onClick={() => navigate('/')}
          title="Quay lại trang chủ"
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Xác Minh Danh Tính (KYC)</h2>
            <p className="text-gray-600">Để sử dụng toàn bộ tính năng, vui lòng hoàn thành xác minh danh tính</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8 flex justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2 transition ${
                  step <= currentStep 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step < currentStep ? '✓' : step}
                </div>
                <div className="text-xs text-center text-gray-600 max-w-[80px]">
                  {step === 1 && 'Thông tin cá nhân'}
                  {step === 2 && 'Giấy tờ tùy thân'}
                  {step === 3 && 'Địa chỉ'}
                  {step === 4 && 'Hoàn tất'}
                </div>
                {step < 4 && <div className={`flex-1 h-1 mx-2 mt-3 ${step < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">Thông tin cá nhân</h3>

                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-900 mb-2">Họ và Tên</label>
                  <div className={`flex items-center gap-3 px-4 py-3 border rounded-lg transition ${
                    errors.fullName 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 bg-white focus-within:border-green-500'
                  }`}>
                    <User size={18} className="text-gray-500" />
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      placeholder="Nhập họ và tên đầy đủ"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="flex-1 outline-none bg-transparent text-gray-900"
                    />
                  </div>
                  {errors.fullName && <span className="text-red-500 text-sm mt-2 block">{errors.fullName}</span>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">Số Điện Thoại</label>
                  <div className={`flex items-center gap-3 px-4 py-3 border rounded-lg transition ${
                    errors.phone 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 bg-white focus-within:border-green-500'
                  }`}>
                    <Phone size={18} className="text-gray-500" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="Nhập số điện thoại"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="flex-1 outline-none bg-transparent text-gray-900"
                    />
                  </div>
                  {errors.phone && <span className="text-red-500 text-sm mt-2 block">{errors.phone}</span>}
                </div>
              </div>
            )}

            {/* Step 2: ID Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">Giấy tờ tùy thân</h3>

                <div>
                  <label htmlFor="idType" className="block text-sm font-medium text-gray-900 mb-2">Loại Giấy Tờ</label>
                  <div className={`flex items-center gap-3 px-4 py-3 border rounded-lg transition ${
                    errors.idType 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 bg-white focus-within:border-green-500'
                  }`}>
                    <Hash size={18} className="text-gray-500" />
                    <select
                      id="idType"
                      name="idType"
                      value={formData.idType}
                      onChange={handleInputChange}
                      className="flex-1 outline-none bg-transparent text-gray-900"
                    >
                      <option value="passport">Hộ Chiếu</option>
                      <option value="national_id">CMND/Thẻ Căn Cước</option>
                      <option value="driver_license">Giấy Phép Lái Xe</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="idNumber" className="block text-sm font-medium text-gray-900 mb-2">Số Giấy Tờ</label>
                  <div className={`flex items-center gap-3 px-4 py-3 border rounded-lg transition ${
                    errors.idNumber 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 bg-white focus-within:border-green-500'
                  }`}>
                    <FileText size={18} className="text-gray-500" />
                    <input
                      type="text"
                      id="idNumber"
                      name="idNumber"
                      placeholder="Nhập số giấy tờ"
                      value={formData.idNumber}
                      onChange={handleInputChange}
                      className="flex-1 outline-none bg-transparent text-gray-900"
                    />
                  </div>
                  {errors.idNumber && <span className="text-red-500 text-sm mt-2 block">{errors.idNumber}</span>}
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-900 mb-2">Ngày Sinh</label>
                  <div className={`flex items-center gap-3 px-4 py-3 border rounded-lg transition ${
                    errors.dateOfBirth 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 bg-white focus-within:border-green-500'
                  }`}>
                    <Calendar size={18} className="text-gray-500" />
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="flex-1 outline-none bg-transparent text-gray-900"
                    />
                  </div>
                  {errors.dateOfBirth && <span className="text-red-500 text-sm mt-2 block">{errors.dateOfBirth}</span>}
                </div>
              </div>
            )}

            {/* Step 3: Address & Document */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">Địa chỉ và Giấy Tờ</h3>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-900 mb-2">Địa Chỉ</label>
                  <div className={`flex items-center gap-3 px-4 py-3 border rounded-lg transition ${
                    errors.address 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 bg-white focus-within:border-green-500'
                  }`}>
                    <MapPin size={18} className="text-gray-500" />
                    <input
                      type="text"
                      id="address"
                      name="address"
                      placeholder="Nhập địa chỉ chi tiết"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="flex-1 outline-none bg-transparent text-gray-900"
                    />
                  </div>
                  {errors.address && <span className="text-red-500 text-sm mt-2 block">{errors.address}</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-900 mb-2">Thành Phố/Tỉnh</label>
                    <div className={`flex items-center gap-3 px-4 py-3 border rounded-lg transition ${
                      errors.city 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300 bg-white focus-within:border-green-500'
                    }`}>
                      <MapPin size={18} className="text-gray-500" />
                      <input
                        type="text"
                        id="city"
                        name="city"
                        placeholder="Thành phố"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="flex-1 outline-none bg-transparent text-gray-900"
                      />
                    </div>
                    {errors.city && <span className="text-red-500 text-sm mt-2 block">{errors.city}</span>}
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-900 mb-2">Quốc Gia</label>
                    <div className={`flex items-center gap-3 px-4 py-3 border rounded-lg transition ${
                      errors.country 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300 bg-white focus-within:border-green-500'
                    }`}>
                      <MapPin size={18} className="text-gray-500" />
                      <input
                        type="text"
                        id="country"
                        name="country"
                        placeholder="Quốc gia"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="flex-1 outline-none bg-transparent text-gray-900"
                      />
                    </div>
                    {errors.country && <span className="text-red-500 text-sm mt-2 block">{errors.country}</span>}
                  </div>
                </div>

                <div>
                  <label htmlFor="documentFile" className="block text-sm font-medium text-gray-900 mb-2">Tải Lên Giấy Tờ Tùy Thân</label>
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
                    errors.documentFile 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 hover:border-green-500 bg-gray-50'
                  }`}>
                    <input
                      type="file"
                      id="documentFile"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                    <label htmlFor="documentFile" className="cursor-pointer">
                      <Upload size={32} className="mx-auto mb-2 text-gray-500" />
                      <p className="text-gray-900 font-medium">
                        {formData.documentFile 
                          ? formData.documentFile.name 
                          : 'Kéo và thả tệp hoặc nhấp để chọn'}
                      </p>
                      <small className="text-gray-500">PDF, JPG, PNG - Tối đa 5MB</small>
                    </label>
                  </div>
                  {errors.documentFile && <span className="text-red-500 text-sm mt-2 block">{errors.documentFile}</span>}
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">Kiểm Tra Thông Tin</h3>
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Thông Tin Cá Nhân</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Họ và tên:</span>
                        <strong className="text-gray-900">{formData.fullName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Số điện thoại:</span>
                        <strong className="text-gray-900">{formData.phone}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Giấy Tờ Tùy Thân</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Loại giấy tờ:</span>
                        <strong className="text-gray-900">
                          {formData.idType === 'passport' ? 'Hộ Chiếu' : 
                           formData.idType === 'national_id' ? 'CMND/Thẻ Căn Cước' : 
                           'Giấy Phép Lái Xe'}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Số giấy tờ:</span>
                        <strong className="text-gray-900">{formData.idNumber}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày sinh:</span>
                        <strong className="text-gray-900">{new Date(formData.dateOfBirth).toLocaleDateString('vi-VN')}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Địa Chỉ</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Địa chỉ:</span>
                        <strong className="text-gray-900">{formData.address}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thành phố:</span>
                        <strong className="text-gray-900">{formData.city}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quốc gia:</span>
                        <strong className="text-gray-900">{formData.country}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Tài Liệu</h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">File:</span>
                      <strong className="text-gray-900">{formData.documentFile?.name || 'Chưa tải lên'}</strong>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg space-y-2 text-sm text-green-700">
                    <p>✓ Vui lòng kiểm tra thông tin của bạn trước khi gửi</p>
                    <p>✓ Quá trình xác minh sẽ mất 24-48 giờ</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8">
              {currentStep > 1 && (
                <button 
                  type="button" 
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Quay Lại
                </button>
              )}
              
              {currentStep < 4 && (
                <button 
                  type="button" 
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition"
                >
                  Tiếp Tục
                </button>
              )}

              {currentStep === 4 && (
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-400 transition"
                >
                  {isLoading ? 'Đang xử lý...' : 'Hoàn Thành'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
