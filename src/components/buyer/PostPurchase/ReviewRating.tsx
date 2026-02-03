import React, { useState } from 'react';
import { Upload, Send, Star, X } from 'lucide-react';

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
      <div className="bg-white border border-gray-200 rounded-lg p-6 my-4 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <h4 className="m-0 text-gray-900 font-bold text-lg flex-1">{existingReview.title}</h4>
          <div className="flex gap-1 shrink-0">
            {Array(5).fill(0).map((_, i) => (
              <Star 
                key={i} 
                size={16} 
                className={i < existingReview.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} 
              />
            ))}
          </div>
        </div>
        <p className="text-gray-600 leading-relaxed mb-4 whitespace-pre-wrap">{existingReview.content}</p>
        {existingReview.photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
            {existingReview.photos.map((photo, index) => (
              <div key={index} className="aspect-square rounded-md overflow-hidden border border-gray-200">
                <img src={URL.createObjectURL(photo)} alt={`Review ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 m-0">{new Date(existingReview.createdAt).toLocaleDateString('vi-VN')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto my-8 px-4">
      <div className="bg-white border border-green-200 rounded-lg p-8 shadow-md">
        <h3 className="text-green-600 mb-2 text-xl font-bold">Đánh giá sản phẩm & Cửa hàng</h3>
        <p className="text-gray-500 text-sm mb-6 italic">{productName}</p>

        <div className="mb-6">
          <label className="block mb-3 font-bold text-gray-900 text-sm">Đánh giá sao *</label>
          <div className="flex gap-3 mb-2">
            {Array(5).fill(0).map((_, i) => (
              <button 
                key={i} 
                type="button" 
                onMouseEnter={() => setHoverRating(i + 1)} 
                onMouseLeave={() => setHoverRating(0)} 
                onClick={() => setRating(i + 1)}
                className="bg-none border-none p-0 cursor-pointer flex items-center justify-center transition-transform hover:scale-110"
              >
                <Star 
                  size={32} 
                  className={i < (hoverRating || rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} 
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500">{rating === 0 ? 'Vui lòng chọn số sao' : `Bạn đã chọn ${rating} sao`}</p>
        </div>

        <div className="mb-6">
          <label className="block mb-3 font-bold text-gray-900 text-sm">Tiêu đề đánh giá *</label>
          <input 
            type="text" 
            className="w-full p-3 border border-gray-200 rounded-md text-sm outline-none focus:border-green-600 transition-all"
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Ví dụ: Sản phẩm tuyệt vời, giao hàng nhanh" 
            maxLength={100} 
          />
          <p className="text-right text-xs text-gray-400 mt-1">{title.length}/100</p>
        </div>

        <div className="mb-6">
          <label className="block mb-3 font-bold text-gray-900 text-sm">Nội dung đánh giá *</label>
          <textarea 
            className="w-full p-3 border border-gray-200 rounded-md text-sm outline-none focus:border-green-600 transition-all"
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            placeholder="Mô tả chi tiết trải nghiệm của bạn với sản phẩm này..." 
            maxLength={1000} 
            rows={6} 
          />
          <p className="text-right text-xs text-gray-400 mt-1">{content.length}/1000</p>
        </div>

        <div className="mb-6">
          <label className="block mb-3 font-bold text-gray-900 text-sm">Tải lên ảnh (Tối đa 5 ảnh)</label>
          <div className="relative border-2 border-dashed border-green-200 rounded-lg p-8 text-center bg-green-50 hover:bg-green-100 transition-colors cursor-pointer">
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" 
              accept="image/*" 
              multiple 
              onChange={handleFileSelect} 
              disabled={photos.length >= 5} 
            />
            <div className="flex flex-col items-center gap-2 text-gray-600">
              <Upload size={24} className="text-green-600" />
              <p className="m-0 font-semibold text-sm">Nhấp để tải lên hoặc kéo thả ảnh</p>
              <small className="text-gray-400 text-xs text-center">JPG, PNG - Tối đa 5MB mỗi file</small>
            </div>
          </div>

          {photos.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-bold text-gray-900 mb-3">Ảnh đã tải lên ({photos.length}/5):</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-md overflow-hidden bg-green-50 border border-green-200 shadow-sm">
                    <img src={URL.createObjectURL(photo)} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                      onClick={() => removePhoto(index)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <h4 className="text-green-600 mb-3 text-sm font-bold">Hướng dẫn viết đánh giá tốt</h4>
          <ul className="list-none m-0 p-0 text-sm text-gray-600 space-y-2">
            <li className="flex gap-2"><span>✓</span> Mô tả chi tiết về chất lượng, độ bền, và hiệu suất</li>
            <li className="flex gap-2"><span>✓</span> Chia sẻ trải nghiệm thực tế khi sử dụng</li>
            <li className="flex gap-2"><span>✓</span> So sánh với sản phẩm tương tự nếu có</li>
            <li className="flex gap-2"><span>✓</span> Tải ảnh sản phẩm thực tế để giúp người khác</li>
            <li className="flex gap-2 text-red-400"><span>✗</span> Tránh sử dụng từ ngữ thiếu văn minh, công kích</li>
          </ul>
        </div>

        <button 
          disabled={isSubmitting || rating === 0} 
          onClick={handleSubmit}
          className="w-full py-3 bg-green-600 text-white border-none rounded-lg font-bold flex items-center justify-center gap-2 transition-all hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-95"
        >
          <Send size={18} />
          {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      </div>
    </div>
  );
};

export default ReviewRating;