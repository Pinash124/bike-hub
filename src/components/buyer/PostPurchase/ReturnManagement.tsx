import React, { useState } from 'react';
import { Upload, Send, X, FileText } from 'lucide-react';

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
      setDescription('');
      setEvidence([]);
      setSelectedReason('damaged');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (existingReturn) {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      refunded: 'bg-blue-100 text-blue-800'
    };

    return (
      <div className="bg-white border border-green-200 rounded-lg p-6 my-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="m-0 text-green-600 font-bold text-lg">Trạng thái yêu cầu trả hàng</h3>
          <span className={`px-4 py-2 rounded-full font-semibold text-xs ${statusColors[existingReturn.status]}`}>
            {existingReturn.status === 'pending' ? 'Đang xử lý' : 
             existingReturn.status === 'approved' ? 'Được phê duyệt' : 
             existingReturn.status === 'rejected' ? 'Bị từ chối' : 'Đã hoàn tiền'}
          </span>
        </div>
        <div className="bg-gray-50 p-4 rounded-md space-y-2">
          <p className="m-0 text-gray-600 text-sm"><strong className="text-gray-900">Lý do:</strong> {RETURN_REASONS[existingReturn.reason]}</p>
          <p className="m-0 text-gray-600 text-sm"><strong className="text-gray-900">Mô tả:</strong> {existingReturn.description}</p>
          <p className="m-0 text-gray-600 text-sm"><strong className="text-gray-900">Ngày yêu cầu:</strong> {new Date(existingReturn.createdAt).toLocaleDateString('vi-VN')}</p>
          {existingReturn.adminNotes && (
            <p className="m-0 text-gray-600 text-sm"><strong className="text-gray-900">Ghi chú:</strong> {existingReturn.adminNotes}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto my-8 px-4">
      <div className="bg-white border border-green-200 rounded-lg p-8 shadow-md">
        <h3 className="text-green-600 mb-6 text-xl font-bold">Yêu cầu trả hàng & Hoàn tiền</h3>
        
        <div className="mb-6">
          <label className="block mb-3 font-bold text-gray-900 text-sm">Lý do trả hàng *</label>
          <div className="flex flex-col gap-2">
            {Object.entries(RETURN_REASONS).map(([key, label]) => (
              <label key={key} className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer transition-all hover:border-green-600 hover:bg-green-50">
                <input 
                  type="radio" 
                  className="mr-3 accent-green-600"
                  value={key} 
                  checked={selectedReason === key} 
                  onChange={(e) => setSelectedReason(e.target.value as ReturnReason)} 
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block mb-3 font-bold text-gray-900 text-sm">Mô tả chi tiết *</label>
          <textarea 
            className="w-full p-3 border border-gray-200 rounded-md text-sm outline-none focus:border-green-600 transition-all"
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Vui lòng mô tả chi tiết vấn đề, ví dụ: Sản phẩm bị lỗi ở phần nào, tình trạng hư hỏng..." 
            maxLength={500} 
            rows={5} 
          />
          <p className="text-right text-xs text-gray-400 mt-1">{description.length}/500</p>
        </div>

        <div className="mb-6">
          <label className="block mb-3 font-bold text-gray-900 text-sm">Tải lên chứng minh (Tối đa 5 ảnh) *</label>
          <div className="relative border-2 border-dashed border-green-200 rounded-lg p-8 text-center bg-green-50 hover:bg-green-100 transition-colors cursor-pointer">
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" 
              accept="image/*" 
              multiple 
              onChange={handleFileSelect} 
              disabled={evidence.length >= 5} 
            />
            <div className="flex flex-col items-center gap-2 text-gray-600">
              <Upload size={24} className="text-green-600" />
              <p className="m-0 font-semibold text-sm">Nhấp để tải lên hoặc kéo thả ảnh</p>
              <small className="text-gray-400 text-xs text-center">JPG, PNG - Tối đa 5MB mỗi file</small>
            </div>
          </div>

          {evidence.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-bold text-gray-900 mb-3">Ảnh đã tải lên ({evidence.length}/5):</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {evidence.map((file, index) => (
                  <div key={index} className="relative p-3 bg-white border border-gray-200 rounded-md flex flex-col items-center gap-2">
                    <FileText size={32} className="text-green-600" />
                    <p className="text-[10px] text-gray-500 text-center truncate w-full">{file.name}</p>
                    <button 
                      type="button" 
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                      onClick={() => removeFile(index)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <h4 className="m-0 mb-3 text-green-600 font-bold text-base">Thông tin hoàn tiền</h4>
          <p className="m-0 text-gray-600 text-sm">Số tiền sẽ được hoàn lại:</p>
          <p className="text-2xl font-black text-green-600 my-2">{orderAmount.toLocaleString('vi-VN')} đ</p>
          <p className="text-gray-400 text-[11px] leading-relaxed italic">Hoàn tiền sẽ được xử lý vào tài khoản của bạn trong 5-7 ngày làm việc sau khi được phê duyệt.</p>
        </div>

        <button 
          disabled={isSubmitting} 
          onClick={handleSubmit}
          className="w-full py-3 bg-green-600 text-white border-none rounded-md font-bold flex items-center justify-center gap-2 transition-all hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Send size={18} />
          {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
        </button>
      </div>
    </div>
  );
};