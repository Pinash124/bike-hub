import { Heart, MapPin, Zap } from 'lucide-react'
import '../styles/BikeCard.css'

interface BikeCardProps {
  id: number
  image: string
  title: string
  price: number
  year: number
  location: string
  mileage: number
  isFeatured?: boolean
}

export default function BikeCard({
  id,
  image,
  title,
  price,
  year,
  location,
  mileage,
  isFeatured = false,
}: BikeCardProps) {
  return (
    <div className={`bike-card ${isFeatured ? 'featured' : ''}`}>
      {isFeatured && <div className="featured-badge">Nổi Bật</div>}
      
      <div className="bike-image">
        <img src={image} alt={title} />
        <button className="btn-favorite">
          <Heart size={20} />
        </button>
      </div>

      <div className="bike-info">
        <h3>{title}</h3>
        
        <div className="price-tag">
          <span className="price">{price.toLocaleString('vi-VN')}₫</span>
          <span className="year">{year}</span>
        </div>

        <div className="bike-details">
          <div className="detail">
            <MapPin size={16} />
            <span>{location}</span>
          </div>
          <div className="detail">
            <Zap size={16} />
            <span>{mileage.toLocaleString('vi-VN')} km</span>
          </div>
        </div>

        <button className="btn-view">Xem Chi Tiết</button>
      </div>
    </div>
  )
}
