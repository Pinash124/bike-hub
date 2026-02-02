import { Heart } from 'lucide-react'

interface BikeCardProps {
  image: string; title: string; price: number; originalPrice?: number;
  year: number; location: string; mileage: number; size?: string; condition?: string;
}

export default function BikeCard({
  image, title, price, originalPrice, year, location, mileage, size = 'M', condition = '99%'
}: BikeCardProps) {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 transition-all hover:shadow-xl hover:-translate-y-1 group">
      <div className="relative aspect-[4/3] bg-gray-50 flex items-center justify-center text-5xl">
        {image}
        <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 transition-colors">
          <Heart size={18} />
        </button>
        <div className="absolute bottom-3 left-3 flex gap-2">
          <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded">{condition}</span>
          {discount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">-{discount}%</span>}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-sm font-bold text-gray-800 line-clamp-2 h-10 mb-2 group-hover:text-green-600 transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-3">
          <span>Size {size}</span><span>•</span><span>Đời {year}</span>
        </div>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-lg font-black text-red-600">{price.toLocaleString()}₫</span>
          {originalPrice && <span className="text-xs text-gray-400 line-through">{originalPrice.toLocaleString()}₫</span>}
        </div>
        <div className="pt-3 border-t border-dashed border-gray-100 flex justify-between text-[10px] text-gray-400">
          <span>{mileage.toLocaleString()} km</span>
          <span>{location}</span>
        </div>
      </div>
    </div>
  )
}