import React, { useState } from 'react';
import { Upload, Send, X, FileText } from 'lucide-react';
import '../../../styles/ReturnManagement.css';

export type ReturnReason = 'damaged' | 'wrong_item' | 'quality_issue' | 'not_received' | 'other';

export interface ReturnRequest {
  orderId: string;
  reason: ReturnReason;
  description: string;
  evidence: File[];
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  createdAt: string;
  adminNotes?: string;
}

interface ReturnManagementProps {
  orderId: string;
  orderAmount: number;
  onSubmitReturn: (returnRequest: Omit<ReturnRequest, 'status' | 'createdAt'>) => void;
  existingReturn?: ReturnRequest;
}

const RETURN_REASONS: Record<ReturnReason, string> = {
  damaged: 'Sản phẩm bị hư hỏng',
  wrong_item: 'Nhận nhầm sản phẩm',
  quality_issue: 'Chất lượng không như mô tả',
  not_received: 'Không nhận được hàng',
  other: 'Lý do khác'
};

export const ReturnManagement: React.FC<ReturnManagementProps> = ({
  orderId,
  orderAmount,
  onSubmitReturn,
  existingReturn
}) => {
  const [selectedReason, setSelectedReason] = useState<ReturnReason>('damaged');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setEvidence([...evidence, ...files].slice(0, 5));
  };

  const removeFile = (index: number) => {
    setEvidence(evidence.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedReason || !description.trim()) {
      alert('Vui lòng cung cấp lý do và mô tả chi tiết');
      return;
    }

    if (evidence.length === 0) {
      alert('Vui lòng tải lên ít nhất một ảnh chứng minh');
      return;
    }

    setIsSubmitting(true);
    try {
      onSubmitReturn({
        orderId,
        reason: selectedReason,
        description: description.trim(),
        evidence
      });
      // Reset form
      setDescription('');
      setEvidence([]);
      setSelectedReason('damaged');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (existingReturn) {
    return (
      <div className="return-status-card">
        <div className="return-header">
          <h3>Trạng thái yêu cầu trả hàng</h3>
          <span className={`return-badge ${existingReturn.status}`}>
            {existingReturn.status === 'pending' && 'Đang xử lý'}
            {existingReturn.status === 'approved' && 'Được phê duyệt'}
            {existingReturn.status === 'rejected' && 'Bị từ chối'}
            {existingReturn.status === 'refunded' && 'Đã hoàn tiền'}
          </span>
        </div>
        <div className="return-details">
          <p><strong>Lý do:</strong> {RETURN_REASONS[existingReturn.reason]}</p>
          <p><strong>Mô tả:</strong> {existingReturn.description}</p>
          <p><strong>Ngày yêu cầu:</strong> {new Date(existingReturn.createdAt).toLocaleDateString('vi-VN')}</p>
          {existingReturn.adminNotes && (
            <p><strong>Ghi chú:</strong> {existingReturn.adminNotes}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="return-management-container">
      <div className="return-form">
        <h3>Yêu cầu trả hàng & Hoàn tiền</h3>
        
        <div className="form-section">
          <label>Lý do trả hàng *</label>
          <div className="reason-options">
            {Object.entries(RETURN_REASONS).map(([key, label]) => (
              <label key={key} className="reason-option">
                <input
                  type="radio"
                  value={key}
                  checked={selectedReason === key}
                  onChange={(e) => setSelectedReason(e.target.value as ReturnReason)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <label>Mô tả chi tiết *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Vui lòng mô tả chi tiết vấn đề, ví dụ: Sản phẩm bị lỗi ở phần nào, tình trạng hư hỏng..."
            maxLength={500}
            rows={5}
          />
          <p className="char-count">{description.length}/500</p>
        </div>

        <div className="form-section">
          <label>Tải lên chứng minh (Tối đa 5 ảnh) *</label>
          <div className="file-upload">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={evidence.length >= 5}
            />
            <div className="upload-hint">
              <Upload size={20} />
              <p>Nhấp để tải lên hoặc kéo thả ảnh</p>
              <small>JPG, PNG - Tối đa 5MB mỗi file</small>
            </div>
          </div>

          {evidence.length > 0 && (
            <div className="evidence-preview">
              <p className="preview-title">Ảnh đã tải lên ({evidence.length}/5):</p>
              <div className="evidence-grid">
                {evidence.map((file, index) => (
                  <div key={index} className="evidence-item">
                    <FileText size={32} />
                    <p className="file-name">{file.name}</p>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeFile(index)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="refund-info">
          <h4>Thông tin hoàn tiền</h4>
          <p>Số tiền sẽ được hoàn lại:</p>
          <p className="refund-amount">{orderAmount.toLocaleString('vi-VN')} đ</p>
          <p className="info-note">
            Hoàn tiền sẽ được xử lý vào tài khoản ngân hàng của bạn trong 5-7 ngày làm việc sau khi được phê duyệt.
          </p>
        </div>

        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          <Send size={18} />
          {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
        </button>
      </div>
    </div>
  );
};
