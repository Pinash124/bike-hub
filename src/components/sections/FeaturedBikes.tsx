import BikeCard from './BikeCard'
import '../../styles/sections/FeaturedBikes.css'

const featuredBikes = [
  {
    id: 1,
    image: '🚴',
    title: 'Trek X-Caliber 8 2023',
    price: 25000000,
    originalPrice: 28000000,
    year: 2023,
    location: 'Hà Nội',
    mileage: 500,
    size: 'L',
    condition: 'New',
    isFeatured: true,
  },
  {
    id: 2,
    image: '🚴',
    title: 'Giant Escape 3 2022',
    price: 8000000,
    originalPrice: 9500000,
    year: 2022,
    location: 'TP.HCM',
    mileage: 2500,
    size: 'M',
    condition: 'Almost new',
    isFeatured: true,
  },
  {
    id: 3,
    image: '🚴',
    title: 'Specialized Rockhopper 2023',
    price: 18000000,
    originalPrice: 20000000,
    year: 2023,
    location: 'Đà Nẵng',
    mileage: 800,
    size: 'M',
    condition: 'New',
    isFeatured: true,
  },
  {
    id: 4,
    image: '🚴',
    title: 'Merida Big Nine XT 2021',
    price: 15000000,
    originalPrice: 17500000,
    year: 2021,
    location: 'Hải Phòng',
    mileage: 5000,
    size: 'L',
    condition: 'Used',
    isFeatured: false,
  },
  {
    id: 5,
    image: '🚴',
    title: 'Xe Đạp Cơ Bản Tốt 2020',
    price: 3000000,
    originalPrice: 4500000,
    year: 2020,
    location: 'Hà Nội',
    mileage: 8000,
    size: 'M',
    condition: 'Refurbished',
    isFeatured: false,
  },
  {
    id: 6,
    image: '🚴',
    title: 'Cannondale Quick 4 2022',
    price: 12000000,
    originalPrice: 14000000,
    year: 2022,
    location: 'TP.HCM',
    mileage: 3500,
    size: 'L',
    condition: 'Almost new',
    isFeatured: false,
  },
]

export default function FeaturedBikes() {
  return (
    <section className="featured-bikes">
      <div className="featured-bikes-container">
        <h2>Selected for you</h2>
        <div className="bikes-grid">
          {featuredBikes.map((bike) => (
            <BikeCard key={bike.id} {...bike} />
          ))}
        </div>
        <div className="see-all">
          <a href="#/bikes">See all bikes →</a>
        </div>
      </div>
    </section>
  )
}
