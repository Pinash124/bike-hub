import { Heart, MapPin, Gauge, Ruler } from 'lucide-react'

interface BikeCardProps {
  image: string; title: string; price: number; originalPrice?: number;
  year: number; location: string; mileage: number; size?: string; condition?: string;
}

export default function BikeCard({
  image, title, price, originalPrice, year, location, mileage, size = 'M', condition = '99%'
}: BikeCardProps) {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

  return (
    <div className="group relative bg-white border border-gray-100 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 overflow-hidden">
      
      {/* IMAGE AREA */}
      <div className="relative aspect-square bg-[#f8fafc] overflow-hidden flex items-center justify-center">
        {/* Placeholder cho ảnh - Phóng to nhẹ khi hover */}
        <div className="text-6xl transition-transform duration-700 group-hover:scale-110">
          {image}
        </div>

        {/* Wishlist Button */}
        <button className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 hover:bg-white shadow-sm transition-all active:scale-90">
          <Heart size={20} />
        </button>

        {/* Badges - Làm bo góc vuông vắn và chữ font-black */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <span className="bg-black text-white text-[10px] font-black px-3 py-1.5 uppercase tracking-widest">
            {condition}
          </span>
          {discount > 0 && (
            <span className="bg-green-500 text-white text-[10px] font-black px-3 py-1.5 uppercase tracking-widest">
              -{discount}%
            </span>
          )}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="p-5">
        {/* Category/Year Tag */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em]">
            Model {year}
          </span>
        </div>

        {/* Title - Tăng size và dùng font-bold */}
        <h3 className="text-base font-bold text-gray-900 line-clamp-1 mb-4 group-hover:text-green-600 transition-colors uppercase tracking-tight">
          {title}
        </h3>

        {/* Specs Grid - Dùng Icon để trông chuyên nghiệp hơn */}
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

        {/* Price & Action */}
        <div className="flex items-end justify-between pt-4 border-t border-gray-50">
          <div className="flex flex-col">
            {originalPrice && (
              <span className="text-xs text-gray-400 line-through mb-1 font-medium">
                {originalPrice.toLocaleString()}₫
              </span>
            )}
            <span className="text-xl font-black text-gray-900 tracking-tighter">
              {price.toLocaleString()}<span className="text-[10px] ml-1">VND</span>
            </span>
          </div>
          
          {/* Nút giả lập (chỉ hiện rõ khi hover) */}
          <div className="bg-gray-900 text-white p-2 transition-all duration-300 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
            <ArrowRightIcon size={18} />
          </div>
        </div>
      </div>

      {/* Địa điểm - Đưa xuống dưới cùng dạng mờ */}
      <div className="px-5 pb-4 flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        <MapPin size={12} className="text-gray-300" />
        {location}
      </div>
    </div>
  )
}

// Icon bổ trợ
function ArrowRightIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  )
}