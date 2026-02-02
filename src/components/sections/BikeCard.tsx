import { Heart } from 'lucide-react'
import '../../styles/sections/BikeCard.css'

interface BikeCardProps {
  id: number
  image: string
  title: string
  price: number
  originalPrice?: number
  year: number
  location: string
  mileage: number
  size?: string
  condition?: string
  isFeatured?: boolean
  brand?: string // Thêm brand để đồng bộ với bộ lọc
}

export default function BikeCard({
  image,
  title,
  price,
  originalPrice,
  year,
  location,
  mileage,
  size = 'M',
  condition = '99%',
  isFeatured = false,
}: BikeCardProps) {
  // Tính toán % giảm giá
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

  return (
    <div className={`bike-card ${isFeatured ? 'featured' : ''}`}>
      <div className="bike-image">
        {/* Sau này thay <img> vào đây */}
        <div className="placeholder">{image}</div>
        
        <button className="btn-favorite" title="Yêu thích">
          <Heart size={18} />
        </button>

        {/* Badges */}
        <div className="badge-container">
          <div className="condition-badge">{condition}</div>
          {discount > 0 && <div className="discount-badge">-{discount}%</div>}
        </div>
      </div>

      <div className="bike-info">
        <h3 className="bike-title" title={title}>{title}</h3>
        
        <div className="bike-meta">
          <span className="meta-item">Size {size}</span>
          <span className="meta-divider">•</span>
          <span className="meta-item">Đời {year}</span>
        </div>

        <div className="bike-price-row">
          <span className="current-price">
            {price.toLocaleString('vi-VN')}₫
          </span>
          {originalPrice && (
            <span className="original-price">
              {originalPrice.toLocaleString('vi-VN')}₫
            </span>
          )}
        </div>

        <div className="bike-footer">
          <span className="mileage">{mileage.toLocaleString('vi-VN')} km</span>
          <span className="location">{location}</span>
        </div>
      </div>
    </div>
  )
}