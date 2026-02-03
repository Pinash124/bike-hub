// src/components/sections/BikeCard.tsx
import { Heart, MapPin, Gauge, Ruler, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom' //

interface BikeCardProps {
  id: number | string; // Thêm id
  image: string; title: string; price: number; originalPrice?: number;
  year: number; location: string; mileage: number; size?: string; condition?: string;
  // Thêm các trường phụ để trang chi tiết hiển thị đầy đủ
  description?: string; brand?: string; material?: string; seller?: string; rating?: number; reviews?: number;
}

export default function BikeCard(props: BikeCardProps) {
  const { id, image, title, price, originalPrice, year, location, mileage, size = 'M', condition = '99%' } = props;
  const navigate = useNavigate(); //
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  // Hàm xử lý khi nhấn vào Card
  const handleCardClick = () => {
    // Chuyển hướng đến /product/:id và truyền toàn bộ dữ liệu qua state
    navigate(`/product/${id}`, { 
      state: { 
        product: {
          ...props,
          name: title, // Chuyển title thành name để khớp với ProductDetail.tsx
        } 
      } 
    });
  };

  return (
    <div 
      onClick={handleCardClick} //
      className="group relative bg-white border border-gray-100 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 overflow-hidden cursor-pointer"
    >
      {/* IMAGE AREA */}
      <div className="relative aspect-square bg-[#f8fafc] overflow-hidden flex items-center justify-center">
        <div className="text-6xl transition-transform duration-700 group-hover:scale-110">
          {image.startsWith('http') ? <img src={image} alt={title} className="w-full h-full object-cover" /> : image}
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); /* Ngăn chặn sự kiện click lan ra Card */ }} 
          className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 hover:bg-white shadow-sm transition-all active:scale-90"
        >
          <Heart size={20} />
        </button>

        <div className="absolute bottom-4 left-4 flex gap-2">
          <span className="bg-black text-white text-[10px] font-black px-3 py-1.5 uppercase tracking-widest">{condition}</span>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em]">Model {year}</span>
        </div>

        <h3 className="text-base font-bold text-gray-900 line-clamp-1 mb-4 group-hover:text-green-600 transition-colors uppercase tracking-tight">
          {title}
        </h3>

        <div className="grid grid-cols-2 gap-y-3 mb-6">
          <div className="flex items-center gap-2 text-gray-400">
            <Ruler size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Size {size}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 justify-end">
            <Gauge size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider">{mileage.toLocaleString()} KM</span>
          </div>
        </div>

        <div className="flex items-end justify-between pt-4 border-t border-gray-50">
          <div className="flex flex-col">
            <span className="text-xl font-black text-gray-900 tracking-tighter">
              {price.toLocaleString()}<span className="text-[10px] ml-1">VND</span>
            </span>
          </div>
          <div className="bg-gray-900 text-white p-2 transition-all duration-300 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
            <ArrowRight size={18} strokeWidth={3} />
          </div>
        </div>
      </div>

      <div className="px-5 pb-4 flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        <MapPin size={12} className="text-gray-300" />
        {location}
      </div>
    </div>
  )
}