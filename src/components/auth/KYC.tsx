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
import '../../styles/auth/KYC.css'

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
      <div className="kyc-container">
        <div className="kyc-wrapper">
          <div className="kyc-card kyc-success">
            <div className="success-icon">
              <CheckCircle size={64} />
            </div>
            <h2>Xác minh thành công!</h2>
            <p>Thông tin KYC của bạn đã được ghi nhận. Chúng tôi sẽ xem xét trong 24-48 giờ.</p>
            <div className="success-details">
              <div className="detail-item">
                <span>Họ và tên:</span>
                <strong>{formData.fullName}</strong>
              </div>
              <div className="detail-item">
                <span>Số {formData.idType === 'passport' ? 'Hộ chiếu' : 'CMND'}:</span>
                <strong>{formData.idNumber}</strong>
              </div>
              <div className="detail-item">
                <span>Địa chỉ:</span>
                <strong>{formData.address}, {formData.city}, {formData.country}</strong>
              </div>
            </div>
            <p className="redirect-text">Chuyển hướng trong 2 giây...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="kyc-container">
      <div className="kyc-wrapper">
        <button 
          className="btn-back"
          onClick={() => navigate('/')}
          title="Quay lại trang chủ"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="kyc-card">
          <div className="kyc-header">
            <h2>Xác Minh Danh Tính (KYC)</h2>
            <p>Để sử dụng toàn bộ tính năng, vui lòng hoàn thành xác minh danh tính</p>
          </div>

          {/* Progress Steps */}
          <div className="kyc-progress">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className={`progress-step ${step <= currentStep ? 'active' : ''} ${step < currentStep ? 'completed' : ''}`}>
                <div className="step-circle">{step < currentStep ? '✓' : step}</div>
                <div className="step-label">
                  {step === 1 && 'Thông tin cá nhân'}
                  {step === 2 && 'Giấy tờ tùy thân'}
                  {step === 3 && 'Địa chỉ'}
                  {step === 4 && 'Hoàn tất'}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="kyc-form">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="kyc-step">
                <h3>Thông tin cá nhân</h3>

                <div className="form-group">
                  <label htmlFor="fullName">Họ và Tên</label>
                  <div className={`input-wrapper ${errors.fullName ? 'error' : ''}`}>
                    <User size={18} />
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      placeholder="Nhập họ và tên đầy đủ"
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Số Điện Thoại</label>
                  <div className={`input-wrapper ${errors.phone ? 'error' : ''}`}>
                    <Phone size={18} />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="Nhập số điện thoại"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>
              </div>
            )}

            {/* Step 2: ID Information */}
            {currentStep === 2 && (
              <div className="kyc-step">
                <h3>Giấy tờ tùy thân</h3>

                <div className="form-group">
                  <label htmlFor="idType">Loại Giấy Tờ</label>
                  <div className={`input-wrapper ${errors.idType ? 'error' : ''}`}>
                    <Hash size={18} />
                    <select
                      id="idType"
                      name="idType"
                      value={formData.idType}
                      onChange={handleInputChange}
                    >
                      <option value="passport">Hộ Chiếu</option>
                      <option value="national_id">CMND/Thẻ Căn Cước</option>
                      <option value="driver_license">Giấy Phép Lái Xe</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="idNumber">Số Giấy Tờ</label>
                  <div className={`input-wrapper ${errors.idNumber ? 'error' : ''}`}>
                    <FileText size={18} />
                    <input
                      type="text"
                      id="idNumber"
                      name="idNumber"
                      placeholder="Nhập số giấy tờ"
                      value={formData.idNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.idNumber && <span className="error-message">{errors.idNumber}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="dateOfBirth">Ngày Sinh</label>
                  <div className={`input-wrapper ${errors.dateOfBirth ? 'error' : ''}`}>
                    <Calendar size={18} />
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
                </div>
              </div>
            )}

            {/* Step 3: Address & Document */}
            {currentStep === 3 && (
              <div className="kyc-step">
                <h3>Địa chỉ và Giấy Tờ</h3>

                <div className="form-group">
                  <label htmlFor="address">Địa Chỉ</label>
                  <div className={`input-wrapper ${errors.address ? 'error' : ''}`}>
                    <MapPin size={18} />
                    <input
                      type="text"
                      id="address"
                      name="address"
                      placeholder="Nhập địa chỉ chi tiết"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.address && <span className="error-message">{errors.address}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">Thành Phố/Tỉnh</label>
                    <div className={`input-wrapper ${errors.city ? 'error' : ''}`}>
                      <MapPin size={18} />
                      <input
                        type="text"
                        id="city"
                        name="city"
                        placeholder="Thành phố"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    {errors.city && <span className="error-message">{errors.city}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="country">Quốc Gia</label>
                    <div className={`input-wrapper ${errors.country ? 'error' : ''}`}>
                      <MapPin size={18} />
                      <input
                        type="text"
                        id="country"
                        name="country"
                        placeholder="Quốc gia"
                        value={formData.country}
                        onChange={handleInputChange}
                      />
                    </div>
                    {errors.country && <span className="error-message">{errors.country}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="documentFile">Tải Lên Giấy Tờ Tùy Thân</label>
                  <div className={`file-upload ${errors.documentFile ? 'error' : ''}`}>
                    <input
                      type="file"
                      id="documentFile"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <div className="file-upload-content">
                      <Upload size={32} />
                      <p>
                        {formData.documentFile 
                          ? formData.documentFile.name 
                          : 'Kéo và thả tệp hoặc nhấp để chọn'}
                      </p>
                      <small>PDF, JPG, PNG - Tối đa 5MB</small>
                    </div>
                  </div>
                  {errors.documentFile && <span className="error-message">{errors.documentFile}</span>}
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="kyc-step">
                <h3>Kiểm Tra Thông Tin</h3>
                <div className="review-section">
                  <div className="review-group">
                    <h4>Thông Tin Cá Nhân</h4>
                    <div className="review-item">
                      <span>Họ và tên:</span>
                      <strong>{formData.fullName}</strong>
                    </div>
                    <div className="review-item">
                      <span>Số điện thoại:</span>
                      <strong>{formData.phone}</strong>
                    </div>
                  </div>

                  <div className="review-group">
                    <h4>Giấy Tờ Tùy Thân</h4>
                    <div className="review-item">
                      <span>Loại giấy tờ:</span>
                      <strong>
                        {formData.idType === 'passport' ? 'Hộ Chiếu' : 
                         formData.idType === 'national_id' ? 'CMND/Thẻ Căn Cước' : 
                         'Giấy Phép Lái Xe'}
                      </strong>
                    </div>
                    <div className="review-item">
                      <span>Số giấy tờ:</span>
                      <strong>{formData.idNumber}</strong>
                    </div>
                    <div className="review-item">
                      <span>Ngày sinh:</span>
                      <strong>{new Date(formData.dateOfBirth).toLocaleDateString('vi-VN')}</strong>
                    </div>
                  </div>

                  <div className="review-group">
                    <h4>Địa Chỉ</h4>
                    <div className="review-item">
                      <span>Địa chỉ:</span>
                      <strong>{formData.address}</strong>
                    </div>
                    <div className="review-item">
                      <span>Thành phố:</span>
                      <strong>{formData.city}</strong>
                    </div>
                    <div className="review-item">
                      <span>Quốc gia:</span>
                      <strong>{formData.country}</strong>
                    </div>
                  </div>

                  <div className="review-group">
                    <h4>Tài Liệu</h4>
                    <div className="review-item">
                      <span>File:</span>
                      <strong>{formData.documentFile?.name || 'Chưa tải lên'}</strong>
                    </div>
                  </div>

                  <div className="kyc-note">
                    <p>✓ Vui lòng kiểm tra thông tin của bạn trước khi gửi</p>
                    <p>✓ Quá trình xác minh sẽ mất 24-48 giờ</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="form-actions">
              {currentStep > 1 && (
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={handleBack}
                >
                  Quay Lại
                </button>
              )}
              
              {currentStep < 4 && (
                <button 
                  type="button" 
                  className="btn-primary"
                  onClick={handleNext}
                >
                  Tiếp Tục
                </button>
              )}

              {currentStep === 4 && (
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={isLoading}
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
