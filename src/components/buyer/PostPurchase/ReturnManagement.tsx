import React, { useState } from 'react';
import { Upload, Send, X, FileText } from 'lucide-react';
import styled from 'styled-components';

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
      <StatusCard>
        <Header>
          <h3>Trạng thái yêu cầu trả hàng</h3>
          <Badge status={existingReturn.status}>{existingReturn.status === 'pending' ? 'Đang xử lý' : existingReturn.status === 'approved' ? 'Được phê duyệt' : existingReturn.status === 'rejected' ? 'Bị từ chối' : 'Đã hoàn tiền'}</Badge>
        </Header>
        <DetailsBox>
          <p><strong>Lý do:</strong> {RETURN_REASONS[existingReturn.reason]}</p>
          <p><strong>Mô tả:</strong> {existingReturn.description}</p>
          <p><strong>Ngày yêu cầu:</strong> {new Date(existingReturn.createdAt).toLocaleDateString('vi-VN')}</p>
          {existingReturn.adminNotes && (<p><strong>Ghi chú:</strong> {existingReturn.adminNotes}</p>)}
        </DetailsBox>
      </StatusCard>
    );
  }

  return (
    <Container>
      <Form>
        <h3>Yêu cầu trả hàng & Hoàn tiền</h3>
        <Section>
          <label>Lý do trả hàng *</label>
          <Options>
            {Object.entries(RETURN_REASONS).map(([key, label]) => (
              <Reason key={key}>
                <input type="radio" value={key} checked={selectedReason === key} onChange={(e) => setSelectedReason(e.target.value as ReturnReason)} />
                <span>{label}</span>
              </Reason>
            ))}
          </Options>
        </Section>

        <Section>
          <label>Mô tả chi tiết *</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Vui lòng mô tả chi tiết vấn đề, ví dụ: Sản phẩm bị lỗi ở phần nào, tình trạng hư hỏng..." maxLength={500} rows={5} />
          <p className="char-count">{description.length}/500</p>
        </Section>

        <Section>
          <label>Tải lên chứng minh (Tối đa 5 ảnh) *</label>
          <UploadBox>
            <input type="file" accept="image/*" multiple onChange={handleFileSelect} disabled={evidence.length >= 5} />
            <Hint>
              <Upload size={20} />
              <p>Nhấp để tải lên hoặc kéo thả ảnh</p>
              <small>JPG, PNG - Tối đa 5MB mỗi file</small>
            </Hint>
          </UploadBox>

          {evidence.length > 0 && (
            <Preview>
              <p className="preview-title">Ảnh đã tải lên ({evidence.length}/5):</p>
              <Grid>
                {evidence.map((file, index) => (
                  <Evidence key={index}>
                    <FileText size={32} />
                    <p className="file-name">{file.name}</p>
                    <button type="button" className="remove-btn" onClick={() => removeFile(index)}>
                      <X size={16} />
                    </button>
                  </Evidence>
                ))}
              </Grid>
            </Preview>
          )}
        </Section>

        <Refund>
          <h4>Thông tin hoàn tiền</h4>
          <p>Số tiền sẽ được hoàn lại:</p>
          <p className="refund-amount">{orderAmount.toLocaleString('vi-VN')} đ</p>
          <p className="info-note">Hoàn tiền sẽ được xử lý vào tài khoản ngân hàng của bạn trong 5-7 ngày làm việc sau khi được phê duyệt.</p>
        </Refund>

        <Submit disabled={isSubmitting} onClick={handleSubmit}><Send size={18} />{isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}</Submit>
      </Form>
    </Container>
  );
};

const Container = styled.div`max-width:600px;margin:2rem auto;padding:0 1rem;`
const Form = styled.div`background:white;border:1px solid #bbf7d0;border-radius:8px;padding:2rem;box-shadow:0 2px 8px rgba(29,184,84,0.1); h3{color:#1db854;margin-bottom:1.5rem;font-size:1.3rem}`
const Section = styled.div`margin-bottom:1.5rem; label{display:block;margin-bottom:0.75rem;font-weight:600;color:#1a1a1a;font-size:0.95rem}`
const Options = styled.div`display:flex;flex-direction:column;gap:0.5rem`
const Reason = styled.label`display:flex;align-items:center;padding:0.75rem;border:1px solid #e0e0e0;border-radius:6px;cursor:pointer;transition:all 0.3s; input{margin-right:0.75rem} &:hover{border-color:#1db854;background:#f0fdf4}`
const UploadBox = styled.div`position:relative;border:2px dashed #bbf7d0;border-radius:8px;padding:2rem;text-align:center;cursor:pointer;background:#f0fdf4; input{position:absolute;inset:0;opacity:0;cursor:pointer}`
const Hint = styled.div`pointer-events:none;display:flex;flex-direction:column;align-items:center;gap:0.5rem;color:#666; p{margin:0;font-weight:500} small{color:#999;font-size:0.85rem}`
const Preview = styled.div`margin-top:1rem; .preview-title{font-size:0.9rem;font-weight:600;color:#1a1a1a;margin-bottom:0.75rem}`
const Grid = styled.div`display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:0.75rem`
const Evidence = styled.div`position:relative;padding:0.75rem;background:white;border:1px solid #e0e0e0;border-radius:6px;display:flex;flex-direction:column;align-items:center;gap:0.5rem; svg{color:#1db854} .file-name{font-size:0.75rem;color:#666;text-align:center;margin:0} .remove-btn{position:absolute;top:-8px;right:-8px;width:24px;height:24px;padding:0;border:none;background:#ff6b6b;color:white;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center} .remove-btn:hover{background:#ff5252}`
const Refund = styled.div`background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:1rem;margin-bottom:1.5rem; h4{margin:0 0 0.75rem 0;color:#1db854;font-size:1rem} p{margin:0.5rem 0;color:#666;font-size:0.9rem} .refund-amount{font-size:1.5rem;font-weight:700;color:#1db854;margin:0.75rem 0} .info-note{color:#999;font-size:0.85rem}`
const Submit = styled.button`width:100%;padding:0.75rem;background:#1db854;color:white;border:none;border-radius:6px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:0.5rem;cursor:pointer; &:disabled{background:#ccc;cursor:not-allowed} &:hover:not(:disabled){background:#0da845}`

const StatusCard = styled.div`background:white;border:1px solid #bbf7d0;border-radius:8px;padding:1.5rem;margin:1.5rem 0`
const Header = styled.div`display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem; h3{margin:0;color:#1db854}`
const Badge = styled.span<{status?: string}>`
  padding:0.5rem 1rem;border-radius:20px;font-weight:600;font-size:0.85rem;
  background:${props => props.status==='pending'?'#fff3cd':props.status==='approved'?'#d4edda':props.status==='rejected'?'#f8d7da':'#d1ecf1'};
  color:${props => props.status==='pending'?'#856404':props.status==='approved'?'#155724':props.status==='rejected'?'#721c24':'#0c5460'};
`
const DetailsBox = styled.div`background:#f9f9f9;padding:1rem;border-radius:6px; p{margin:0.5rem 0;color:#666;font-size:0.95rem} strong{color:#1a1a1a}`

