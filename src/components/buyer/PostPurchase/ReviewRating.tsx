import React, { useState } from 'react';
import { Upload, Send, Star, X } from 'lucide-react';
import '../../../styles/ReviewRating.css';

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
  sellerId,
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
      <div className="review-display-card">
        <div className="review-header">
          <h4>{existingReview.title}</h4>
          <div className="star-rating-display">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < existingReview.rating ? '#ffc107' : '#ddd'}
                  stroke={i < existingReview.rating ? '#ffc107' : '#ddd'}
                />
              ))}
          </div>
        </div>
        <p className="review-content">{existingReview.content}</p>
        {existingReview.photos.length > 0 && (
          <div className="review-photos">
            {existingReview.photos.map((photo, index) => (
              <div key={index} className="photo-item">
                <img src={URL.createObjectURL(photo)} alt={`Review ${index + 1}`} />
              </div>
            ))}
          </div>
        )}
        <p className="review-date">{new Date(existingReview.createdAt).toLocaleDateString('vi-VN')}</p>
      </div>
    );
  }

  return (
    <div className="review-rating-container">
      <div className="review-form">
        <h3>Đánh giá sản phẩm & Cửa hàng</h3>
        <p className="product-info">{productName}</p>

        <div className="form-section">
          <label>Đánh giá sao *</label>
          <div className="star-rating">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className="star-btn"
                  onMouseEnter={() => setHoverRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(i + 1)}
                >
                  <Star
                    size={32}
                    fill={i < (hoverRating || rating) ? '#ffc107' : '#ddd'}
                    stroke={i < (hoverRating || rating) ? '#ffc107' : '#ddd'}
                  />
                </button>
              ))}
          </div>
          <p className="rating-text">
            {rating === 0 ? 'Vui lòng chọn số sao' : `Bạn đã chọn ${rating} sao`}
          </p>
        </div>

        <div className="form-section">
          <label>Tiêu đề đánh giá *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Sản phẩm tuyệt vời, giao hàng nhanh"
            maxLength={100}
          />
          <p className="char-count">{title.length}/100</p>
        </div>

        <div className="form-section">
          <label>Nội dung đánh giá *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Mô tả chi tiết trải nghiệm của bạn với sản phẩm này..."
            maxLength={1000}
            rows={6}
          />
          <p className="char-count">{content.length}/1000</p>
        </div>

        <div className="form-section">
          <label>Tải lên ảnh (Tối đa 5 ảnh)</label>
          <div className="file-upload">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={photos.length >= 5}
            />
            <div className="upload-hint">
              <Upload size={20} />
              <p>Nhấp để tải lên hoặc kéo thả ảnh</p>
              <small>JPG, PNG - Tối đa 5MB mỗi file</small>
            </div>
          </div>

          {photos.length > 0 && (
            <div className="photos-preview">
              <p className="preview-title">Ảnh đã tải lên ({photos.length}/5):</p>
              <div className="photos-grid">
                {photos.map((photo, index) => (
                  <div key={index} className="photo-item">
                    <img src={URL.createObjectURL(photo)} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removePhoto(index)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="review-guidelines">
          <h4>Hướng dẫn viết đánh giá tốt</h4>
          <ul>
            <li>✓ Mô tả chi tiết về chất lượng, độ bền, và hiệu suất sản phẩm</li>
            <li>✓ Chia sẻ trải nghiệm thực tế khi sử dụng sản phẩm</li>
            <li>✓ So sánh với sản phẩm tương tự nếu có</li>
            <li>✓ Tải ảnh sản phẩm thực tế để giúp người khác</li>
            <li>✗ Tránh sử dụng từ ngữ phiếu bình, công kích</li>
          </ul>
        </div>

        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
        >
          <Send size={18} />
          {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      </div>
    </div>
  );
};
