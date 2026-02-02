import React, { useState } from 'react';
import { Upload, Send, Star, X } from 'lucide-react';
import styled from 'styled-components';

export interface Review {
  id: string;
  orderId: string;
  productName: string;
  rating: number;
  title: string;
  content: string;
  photos: File[];
  createdAt: string;
  helpful: number;
}

interface ReviewRatingProps {
  orderId: string;
  productName: string;
  sellerId: string;
  onSubmitReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  existingReview?: Review;
}

export const ReviewRating: React.FC<ReviewRatingProps> = ({
  orderId,
  productName,
  onSubmitReview,
  existingReview
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos([...photos, ...files].slice(0, 5));
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Vui lòng chọn số sao đánh giá');
      return;
    }

    if (!title.trim() || !content.trim()) {
      alert('Vui lòng nhập tiêu đề và nội dung đánh giá');
      return;
    }

    setIsSubmitting(true);
    try {
      onSubmitReview({
        orderId,
        productName,
        rating,
        title: title.trim(),
        content: content.trim(),
        photos,
        helpful: 0
      });
      // Reset form
      setRating(0);
      setTitle('');
      setContent('');
      setPhotos([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (existingReview) {
    return (
      <DisplayCard>
        <DisplayHeader>
          <h4>{existingReview.title}</h4>
          <StarDisplay>
            {Array(5).fill(0).map((_, i) => (
              <Star key={i} size={16} fill={i < existingReview.rating ? '#ffc107' : '#ddd'} stroke={i < existingReview.rating ? '#ffc107' : '#ddd'} />
            ))}
          </StarDisplay>
        </DisplayHeader>
        <Content>{existingReview.content}</Content>
        {existingReview.photos.length > 0 && (
          <Photos>
            {existingReview.photos.map((photo, index) => (
              <div key={index} className="photo-item">
                <img src={URL.createObjectURL(photo)} alt={`Review ${index + 1}`} />
              </div>
            ))}
          </Photos>
        )}
        <DateText>{new Date(existingReview.createdAt).toLocaleDateString('vi-VN')}</DateText>
      </DisplayCard>
    );
  }

  return (
    <Wrap>
      <FormBox>
        <h3>Đánh giá sản phẩm & Cửa hàng</h3>
        <ProductInfo>{productName}</ProductInfo>

        <Section>
          <label>Đánh giá sao *</label>
          <StarRow>
            {Array(5).fill(0).map((_, i) => (
              <StarBtn key={i} type="button" onMouseEnter={() => setHoverRating(i + 1)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(i + 1)}>
                <Star size={32} fill={i < (hoverRating || rating) ? '#ffc107' : '#ddd'} stroke={i < (hoverRating || rating) ? '#ffc107' : '#ddd'} />
              </StarBtn>
            ))}
          </StarRow>
          <p className="rating-text">{rating === 0 ? 'Vui lòng chọn số sao' : `Bạn đã chọn ${rating} sao`}</p>
        </Section>

        <Section>
          <label>Tiêu đề đánh giá *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ví dụ: Sản phẩm tuyệt vời, giao hàng nhanh" maxLength={100} />
          <p className="char-count">{title.length}/100</p>
        </Section>

        <Section>
          <label>Nội dung đánh giá *</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Mô tả chi tiết trải nghiệm của bạn với sản phẩm này..." maxLength={1000} rows={6} />
          <p className="char-count">{content.length}/1000</p>
        </Section>

        <Section>
          <label>Tải lên ảnh (Tối đa 5 ảnh)</label>
          <UploadBox>
            <input type="file" accept="image/*" multiple onChange={handleFileSelect} disabled={photos.length >= 5} />
            <Hint>
              <Upload size={20} />
              <p>Nhấp để tải lên hoặc kéo thả ảnh</p>
              <small>JPG, PNG - Tối đa 5MB mỗi file</small>
            </Hint>
          </UploadBox>

          {photos.length > 0 && (
            <PhotosPreview>
              <p className="preview-title">Ảnh đã tải lên ({photos.length}/5):</p>
              <PhotosGrid>
                {photos.map((photo, index) => (
                  <PhotoItem key={index}>
                    <img src={URL.createObjectURL(photo)} alt={`Preview ${index + 1}`} />
                    <button type="button" className="remove-btn" onClick={() => removePhoto(index)}>
                      <X size={16} />
                    </button>
                  </PhotoItem>
                ))}
              </PhotosGrid>
            </PhotosPreview>
          )}
        </Section>

        <Guidelines>
          <h4>Hướng dẫn viết đánh giá tốt</h4>
          <ul>
            <li>✓ Mô tả chi tiết về chất lượng, độ bền, và hiệu suất sản phẩm</li>
            <li>✓ Chia sẻ trải nghiệm thực tế khi sử dụng sản phẩm</li>
            <li>✓ So sánh với sản phẩm tương tự nếu có</li>
            <li>✓ Tải ảnh sản phẩm thực tế để giúp người khác</li>
            <li>✗ Tránh sử dụng từ ngữ phiếu bình, công kích</li>
          </ul>
        </Guidelines>

        <Submit disabled={isSubmitting || rating === 0} onClick={handleSubmit}><Send size={18} />{isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}</Submit>
      </FormBox>
    </Wrap>
  );
};

export default ReviewRating;

const Wrap = styled.div`max-width:600px;margin:2rem auto;padding:0 1rem;`
const FormBox = styled.div`background:white;border:1px solid #bbf7d0;border-radius:8px;padding:2rem;box-shadow:0 2px 8px rgba(29,184,84,0.1); h3{color:#1db854;margin-bottom:0.5rem;font-size:1.3rem}`
const ProductInfo = styled.p`color:#666;font-size:0.9rem;margin-bottom:1.5rem;font-style:italic`
const Section = styled.div`margin-bottom:1.5rem; label{display:block;margin-bottom:0.75rem;font-weight:600;color:#1a1a1a;font-size:0.95rem}`
const StarRow = styled.div`display:flex;gap:0.75rem;margin-bottom:0.5rem`
const StarBtn = styled.button`background:none;border:none;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform 0.2s; &:hover{transform:scale(1.15)} svg{width:32px;height:32px}`
const Hint = styled.div`pointer-events:none;display:flex;flex-direction:column;align-items:center;gap:0.5rem;color:#666; p{margin:0;font-weight:500} small{color:#999;font-size:0.85rem}`
const UploadBox = styled.div`position:relative;border:2px dashed #bbf7d0;border-radius:8px;padding:2rem;text-align:center;cursor:pointer;background:#f0fdf4; input{position:absolute;inset:0;opacity:0;cursor:pointer}`
const PhotosPreview = styled.div`margin-top:1rem; .preview-title{font-size:0.9rem;font-weight:600;color:#1a1a1a;margin-bottom:0.75rem}`
const PhotosGrid = styled.div`display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:0.75rem`
const PhotoItem = styled.div`position:relative;width:100%;aspect-ratio:1;border-radius:6px;overflow:hidden;background:#f0fdf4;border:1px solid #bbf7d0; img{width:100%;height:100%;object-fit:cover} .remove-btn{position:absolute;top:-8px;right:-8px;width:24px;height:24px;padding:0;border:none;background:#ff6b6b;color:white;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center} .remove-btn:hover{background:#ff5252}`
const Photos = styled.div`display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:0.75rem;margin-bottom:1rem; .photo-item{border:1px solid #e0e0e0}`
const DisplayCard = styled.div`background:white;border:1px solid #e0e0e0;border-radius:8px;padding:1.5rem;margin:1rem 0`
const DisplayHeader = styled.div`display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem h4{margin:0 0 0.5rem 0;color:#1a1a1a;font-size:1.1rem;flex:1}`
const StarDisplay = styled.div`display:flex;gap:0.25rem;flex-shrink:0 svg{width:16px;height:16px}`
const Content = styled.p`color:#666;line-height:1.6;margin:0 0 1rem 0;white-space:pre-wrap`
const DateText = styled.p`font-size:0.85rem;color:#999;margin:0`
const Guidelines = styled.div`background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:1rem;margin-bottom:1.5rem h4{margin:0 0 0.75rem 0;color:#1db854;font-size:1rem} ul{margin:0;padding-left:1.5rem;color:#666;font-size:0.9rem} li{margin-bottom:0.5rem}`
const Submit = styled.button`width:100%;padding:0.75rem;background:#1db854;color:white;border:none;border-radius:6px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:0.5rem;transition:background 0.3s; &:disabled{background:#ccc;cursor:not-allowed} &:hover:not(:disabled){background:#0da845}`

