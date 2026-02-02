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
  condition = 'Used',
  isFeatured = false,
}: BikeCardProps) {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

  return (
    <div className={`bike-card ${isFeatured ? 'featured' : ''}`}>
      <div className="bike-image">
        <div className="placeholder">{image}</div>
        <button className="btn-favorite" title="Yêu thích">
          <Heart size={20} />
        </button>
        <div className="condition-badge">{condition}</div>
        {discount > 0 && <div className="discount-badge">-{discount}%</div>}
      </div>

      <div className="bike-info">
        <h3 className="bike-title">{title}</h3>
        
        <div className="bike-meta">
          <span>Size {size}</span>
          <span>•</span>
          <span>{condition}</span>
        </div>

        <div className="bike-price-section">
          <div className="price">
            {price.toLocaleString('vi-VN')}₫
          </div>
          {originalPrice && (
            <div className="original-price">
              {originalPrice.toLocaleString('vi-VN')}₫
            </div>
          )}
        </div>

        <div className="bike-details">
          <span className="detail">{year} • {mileage.toLocaleString('vi-VN')} km</span>
          <span className="detail-location">{location}</span>
        </div>
      </div>
    </div>
  )
}
