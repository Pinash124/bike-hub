import BikeCard from './BikeCard'
import '../styles/FeaturedBikes.css'

const featuredBikes = [
  {
    id: 1,
    image: '🚴',
    title: 'Trek X-Caliber 8 2023',
    price: 25000000,
    year: 2023,
    location: 'Hà Nội',
    mileage: 500,
    isFeatured: true,
  },
  {
    id: 2,
    image: '🚴',
    title: 'Giant Escape 3 2022',
    price: 8000000,
    year: 2022,
    location: 'TP.HCM',
    mileage: 2500,
    isFeatured: true,
  },
  {
    id: 3,
    image: '🚴',
    title: 'Specialized Rockhopper 2023',
    price: 18000000,
    year: 2023,
    location: 'Đà Nẵng',
    mileage: 800,
    isFeatured: true,
  },
  {
    id: 4,
    image: '🚴',
    title: 'Merida Big Nine XT 2021',
    price: 15000000,
    year: 2021,
    location: 'Hải Phòng',
    mileage: 5000,
    isFeatured: false,
  },
  {
    id: 5,
    image: '🚴',
    title: 'Xe Đạp Cơ Bản Tốt 2020',
    price: 3000000,
    year: 2020,
    location: 'Hà Nội',
    mileage: 8000,
    isFeatured: false,
  },
  {
    id: 6,
    image: '🚴',
    title: 'Cannondale Quick 4 2022',
    price: 12000000,
    year: 2022,
    location: 'TP.HCM',
    mileage: 3500,
    isFeatured: false,
  },
]

export default function FeaturedBikes() {
  return (
    <section className="featured-bikes">
      <div className="section-header">
        <h2>Xe Đạp Nổi Bật Hôm Nay</h2>
        <p>Những chiếc xe đạp được yêu thích nhất trên BikeHub</p>
      </div>

      <div className="bikes-grid">
        {featuredBikes.map((bike) => (
          <BikeCard key={bike.id} {...bike} />
        ))}
      </div>

      <div className="view-all">
        <button className="btn-secondary">Xem Tất Cả Xe →</button>
      </div>
    </section>
  )
}
