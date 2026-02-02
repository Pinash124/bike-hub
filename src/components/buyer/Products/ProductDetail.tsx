import React, { useState } from 'react';
import { ShoppingCart, MessageSquare, Heart, Share2, ChevronLeft, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';

export interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    price: number;
    condition: string;
    image: string;
    seller: string;
    sellerId: string;
    rating: number;
    reviews: number;
    brand: string;
    material: string;
    size: string;
    description: string;
  };
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddToCart = () => {
    addItem({
      id: `cart_${product.id}`,
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity,
      image: product.image,
      sellerId: product.sellerId,
      sellerName: product.seller,
    });
    alert('Sản phẩm đã được thêm vào giỏ hàng!');
  };

  const handleContact = () => alert('Tính năng chat với người bán đang phát triển');
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Đã sao chép liên kết sản phẩm!');
  };

  const images = [product.image, product.image, product.image];

  return (
    <div className="bg-white min-h-screen">
      {/* Header Bar */}
      <div className="bg-gray-50 px-6 py-4 border-b-2 border-gray-100 sticky top-0 z-10">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white text-green-600 border-2 border-green-600 px-4 py-2 rounded-lg font-bold hover:bg-green-50 transition-colors"
        >
          <ChevronLeft size={20} /> Quay lại
        </button>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="flex flex-col gap-4">
            <div className="relative w-full aspect-square bg-gray-50 border-2 border-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
              <span className="text-8xl">{images[selectedImage]}</span>
              <span className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md">
                {product.condition}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-50 border-2 rounded-xl flex items-center justify-center transition-all text-2xl
                    ${index === selectedImage ? 'border-green-600 shadow-md' : 'border-gray-100 hover:border-green-200'}`}
                >
                  {img}
                </button>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h1 className="text-4xl font-black text-gray-900 leading-tight mb-2">{product.name}</h1>
                <p className="text-gray-500 font-medium">{product.brand} • {product.size} • {product.material}</p>
              </div>
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className={`w-14 h-14 border-2 rounded-xl flex items-center justify-center transition-all
                  ${isFavorite ? 'bg-red-500 border-red-500 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-green-600 hover:text-green-600'}`}
              >
                <Heart size={28} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl">
              <span className="flex items-center gap-1 text-green-700 font-bold text-lg">
                <Star size={20} className="fill-green-600" /> {product.rating}
              </span>
              <span className="text-green-600/70 font-medium">({product.reviews} đánh giá)</span>
            </div>

            <div className="border-b-2 border-gray-100 pb-4">
              <h2 className="text-4xl font-black text-green-600">
                {(product.price / 1000000).toFixed(1)}M VND
              </h2>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Mô tả</h3>
              <p className="text-gray-600 leading-relaxed text-base">{product.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Thương hiệu', value: product.brand },
                { label: 'Kích cỡ khung', value: product.size },
                { label: 'Chất liệu', value: product.material },
                { label: 'Tình trạng', value: product.condition }
              ].map((spec) => (
                <div key={spec.label} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <label className="block text-green-600 font-black text-[10px] uppercase tracking-wider mb-1">{spec.label}</label>
                  <p className="text-gray-900 font-bold">{spec.value}</p>
                </div>
              ))}
            </div>

            {/* Seller Card */}
            <div className="bg-white border-2 border-green-100 rounded-2xl p-6 shadow-sm">
              <div className="flex gap-4 mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">👤</div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900">{product.seller}</h4>
                  <p className="text-sm text-gray-500">⭐ 4.6 (128 đánh giá)</p>
                </div>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 transition-colors self-center">
                  Xem cửa hàng
                </button>
              </div>
              <p className="text-xs text-gray-400">Tham gia từ 2023</p>
            </div>

            <div className="flex items-center gap-4">
              <label className="font-bold text-gray-900">Số lượng:</label>
              <div className="flex items-center gap-1 bg-gray-50 border-2 border-gray-100 rounded-xl p-1">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 bg-white text-green-600 font-black rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm"
                >
                  −
                </button>
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center bg-transparent font-bold text-gray-900 outline-none"
                />
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 bg-white text-green-600 font-black rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-3 bg-green-600 text-white p-4 rounded-2xl font-black text-lg shadow-lg shadow-green-200 hover:bg-green-700 hover:-translate-y-1 transition-all active:scale-95"
              >
                <ShoppingCart size={24} /> Thêm vào giỏ
              </button>
              <button 
                onClick={handleContact}
                className="flex items-center justify-center gap-3 bg-white text-green-600 border-2 border-green-600 p-4 rounded-2xl font-black text-lg hover:bg-green-50 transition-all"
              >
                <MessageSquare size={24} /> Chat ngay
              </button>
            </div>

            <button 
              onClick={handleShare}
              className="w-full bg-transparent text-green-600 border-2 border-green-100 p-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:border-green-600 hover:bg-green-50 transition-all"
            >
              <Share2 size={18} /> Chia sẻ sản phẩm này
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 pt-12 border-t-2 border-gray-100">
          <h2 className="text-3xl font-black text-gray-900 mb-8">Đánh giá khách hàng ({product.reviews})</h2>
          <div className="flex flex-col gap-6">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-gray-900">Nguyễn Văn A</span>
                <span className="text-yellow-400 flex tracking-wider">⭐⭐⭐⭐⭐</span>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">Xe đạp tuyệt vời! Đúng như mô tả. Người bán nhiệt tình và hữu ích. Rất khuyến khích!</p>
              <div className="text-xs text-gray-400">Người mua đã xác thực • 2 tuần trước</div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-gray-900">Trần Thị B</span>
                <span className="text-yellow-400 flex tracking-wider">⭐⭐⭐⭐</span>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">Tình trạng xe tốt. Giao hàng nhanh và đóng gói cẩn thận.</p>
              <div className="text-xs text-gray-400">Người mua đã xác thực • 1 tháng trước</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;