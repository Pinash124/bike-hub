import React, { useState } from 'react';
import { ShoppingCart, MessageSquare, Heart, Share2, ChevronLeft, Zap, Tag, Clock, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { type Listing } from '../../../services/listing.service';

interface ListingDetailProps {
  listing: Listing;
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1532298229144-0ee050c99d2b?q=80&w=800';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  LIVE: { label: 'Đang bán', color: 'bg-green-600 text-white' },
  RESERVED: { label: 'Đã đặt cọc', color: 'bg-yellow-500 text-white' },
  SOLD: { label: 'Đã bán', color: 'bg-red-600 text-white' },
  DRAFT: { label: 'Bản nháp', color: 'bg-gray-400 text-white' },
  PENDING: { label: 'Chờ duyệt', color: 'bg-blue-500 text-white' },
  APPROVED: { label: 'Đang bán', color: 'bg-green-600 text-white' },
  REJECTED: { label: 'Bị từ chối', color: 'bg-red-400 text-white' },
};

export const ProductDetail: React.FC<ListingDetailProps> = ({ listing }) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const images = listing.images?.length
    ? listing.images
      .slice()
      .sort((a, b) => a.imageOrder - b.imageOrder)
      .map((img) => img.secureUrl)
    : [PLACEHOLDER];

  const isAvailable = listing.status === 'LIVE' || listing.status === 'APPROVED';

  const statusInfo = STATUS_LABELS[listing.status] ?? {
    label: listing.status,
    color: 'bg-gray-400 text-white',
  };

  const handleAddToCart = () => {
    addItem({
      id: `cart_${listing.id}`,
      productId: listing.id,
      productName: listing.title,
      price: listing.price,
      quantity: 1,
      image: images[0],
      sellerId: String(listing.brand?.id ?? ''),
      sellerName: listing.brand?.name ?? 'Người bán',
    });
    alert('Đã thêm vào giỏ hàng!');
  };

  const handleBuyNow = () => {
    navigate('/buyer/checkout', { state: { listingId: listing.id, listing } });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Đã sao chép liên kết!');
  };

  const specs = [
    { label: 'Thương hiệu', value: listing.brand?.name ?? 'N/A', icon: <Tag size={14} /> },
    { label: 'Thời gian sử dụng', value: listing.usageDuration ? `${listing.usageDuration} tháng` : 'N/A', icon: <Clock size={14} /> },
    { label: 'Tình trạng', value: listing.condition ?? 'N/A', icon: <Award size={14} /> },
    { label: 'Loại xe', value: listing.bikeType ?? 'N/A', icon: <Zap size={14} /> },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Sticky sub-header */}
      <div className="bg-gray-50 px-6 py-4 border-b-2 border-gray-100 sticky top-[72px] z-10">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white text-green-600 border-2 border-green-600 px-4 py-2 rounded-lg font-bold hover:bg-green-50 transition-colors"
          >
            <ChevronLeft size={20} /> Quay lại
          </button>
          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ── Image Gallery ── */}
          <div className="flex flex-col gap-4">
            <div className="relative w-full aspect-square bg-gray-50 border-2 border-gray-100 rounded-2xl overflow-hidden">
              <img
                src={images[selectedImage]}
                alt={listing.title}
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
              />
              <span className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`absolute top-4 right-4 w-11 h-11 rounded-xl flex items-center justify-center shadow-md transition-all
                  ${isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'}`}
              >
                <Heart size={22} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square bg-gray-50 border-2 rounded-xl overflow-hidden transition-all
                      ${idx === selectedImage ? 'border-green-600 shadow-md' : 'border-gray-100 hover:border-green-300'}`}
                  >
                    <img
                      src={src}
                      alt={`Ảnh ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info Section ── */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-black text-green-600 uppercase tracking-widest mb-2">
                {listing.brand?.name ?? 'Xe đạp'}
              </p>
              <h1 className="text-3xl font-black text-gray-900 leading-tight">{listing.title}</h1>
            </div>

            {/* Price */}
            <div className="border-b-2 border-gray-100 pb-4">
              <h2 className="text-4xl font-black text-green-600">
                {listing.price.toLocaleString('vi-VN')}
                <span className="text-lg ml-2 font-bold text-green-500">VND</span>
              </h2>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Mô tả</h3>
              <p className="text-gray-600 leading-relaxed">{listing.description || 'Chưa có mô tả.'}</p>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3">
              {specs.map((spec) => (
                <div key={spec.label} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-1.5 text-green-600 mb-1">
                    {spec.icon}
                    <label className="text-[10px] font-black uppercase tracking-wider">{spec.label}</label>
                  </div>
                  <p className="text-gray-900 font-bold text-sm">{spec.value}</p>
                </div>
              ))}
            </div>

            {/* Frame number */}
            {listing.frameNumber && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <p className="text-[11px] font-black text-green-600 uppercase tracking-widest mb-1">Số khung xe</p>
                <p className="font-mono font-bold text-gray-800">{listing.frameNumber}</p>
              </div>
            )}

            {/* CTA Buttons */}
            {isAvailable ? (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleBuyNow}
                  className="w-full flex items-center justify-center gap-3 bg-green-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-green-200 hover:bg-green-700 hover:-translate-y-0.5 transition-all active:scale-95"
                >
                  <Zap size={22} /> Mua ngay
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex items-center justify-center gap-2 border-2 border-green-600 text-green-600 py-3 rounded-xl font-bold hover:bg-green-50 transition-all"
                  >
                    <ShoppingCart size={20} /> Thêm vào giỏ
                  </button>
                  <button
                    onClick={() => alert('Tính năng chat đang phát triển')}
                    className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-bold hover:border-gray-400 transition-all"
                  >
                    <MessageSquare size={20} /> Chat người bán
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full py-4 bg-gray-100 rounded-2xl text-center text-gray-500 font-bold text-lg">
                {listing.status === 'SOLD' ? '🚫 Sản phẩm đã bán' : '⏳ Sản phẩm chưa sẵn có'}
              </div>
            )}

            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 text-gray-500 border border-gray-200 py-3 rounded-xl font-bold hover:border-green-300 hover:text-green-600 transition-all text-sm"
            >
              <Share2 size={16} /> Chia sẻ sản phẩm
            </button>
          </div>
        </div>

        {/* Meta footer */}
        <div className="mt-12 pt-8 border-t-2 border-gray-100 text-sm text-gray-400 flex gap-6 flex-wrap">
          <span>ID: <strong className="text-gray-600">{listing.id.slice(0, 8).toUpperCase()}</strong></span>
          <span>Đăng ngày: <strong className="text-gray-600">{new Date(listing.createdAt).toLocaleDateString('vi-VN')}</strong></span>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;