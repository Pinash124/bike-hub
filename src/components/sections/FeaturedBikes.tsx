import BikeCard from './BikeCard'

const featuredBikes = [
  { id: 1, image: '🚴', title: 'Trek X-Caliber 8 2023', price: 25000000, originalPrice: 28000000, year: 2023, location: 'Hà Nội', mileage: 500, size: 'L', condition: 'New' },
  { id: 2, image: '🚴', title: 'Giant Escape 3 2022', price: 8000000, originalPrice: 9500000, year: 2022, location: 'TP.HCM', mileage: 2500, size: 'M', condition: 'Almost new' },
  { id: 3, image: '🚴', title: 'Specialized Rockhopper 2023', price: 18000000, originalPrice: 20000000, year: 2023, location: 'Đà Nẵng', mileage: 800, size: 'M', condition: 'New' },
  { id: 4, image: '🚴', title: 'Merida Big Nine XT 2021', price: 15000000, originalPrice: 17500000, year: 2021, location: 'Hải Phòng', mileage: 5000, size: 'L', condition: 'Used' },
]

export default function FeaturedBikes() {
  return (
    <section className="bg-white py-12 border-b border-gray-50">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-bold text-green-600">Selected for you</h2>
          <a href="#" className="text-sm font-bold text-gray-400 hover:text-green-600 transition-colors">See all bikes →</a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredBikes.map((bike) => (
            <BikeCard key={bike.id} {...bike} />
          ))}
        </div>
      </div>
    </section>
  )
}