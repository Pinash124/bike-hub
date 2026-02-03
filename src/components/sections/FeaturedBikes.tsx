import BikeCard from './BikeCard'

const featuredBikes = [
  { id: 1, image: '🚴', title: 'Trek X-Caliber 8 2023', price: 25000000, originalPrice: 28000000, year: 2023, location: 'Hà Nội', mileage: 500, size: 'L', condition: 'New' },
  { id: 2, image: '🚴', title: 'Giant Escape 3 2022', price: 8000000, originalPrice: 9500000, year: 2022, location: 'TP.HCM', mileage: 2500, size: 'M', condition: 'Almost new' },
  { id: 3, image: '🚴', title: 'Specialized Rockhopper 2023', price: 18000000, originalPrice: 20000000, year: 2023, location: 'Đà Nẵng', mileage: 800, size: 'M', condition: 'New' },
  { id: 4, image: '🚴', title: 'Merida Big Nine XT 2021', price: 15000000, originalPrice: 17500000, year: 2021, location: 'Hải Phòng', mileage: 5000, size: 'L', condition: 'Used' },
]

export default function FeaturedBikes() {
  return (
    // Tăng py-12 lên py-24 để tạo độ thoáng "Premium"
    <section className="bg-white py-24 border-b border-gray-50">
      
      {/* Sử dụng class content-layout đã định nghĩa trong index.css để thụt lùi 2 bên */}
      <div className="content-layout">
        
        {/* Header của Section: Làm tiêu đề nhỏ lại nhưng đậm và giãn cách rộng */}
        <div className="flex justify-between items-end mb-16">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-green-600 uppercase tracking-[0.4em]">
              Sản phẩm nổi bật
            </span>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">
              Dành riêng cho bạn
            </h2>
          </div>
          
          <a 
            href="#" 
            className="text-[11px] font-black text-gray-400 hover:text-green-600 uppercase tracking-widest transition-all border-b-2 border-transparent hover:border-green-600 pb-1"
          >
            Xem tất cả sản phẩm →
          </a>
        </div>

        {/* Grid sản phẩm: Tăng gap-6 lên gap-10 để các card có không gian "thở" */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {featuredBikes.map((bike) => (
            <BikeCard key={bike.id} {...bike} />
          ))}
        </div>
      </div>
    </section>
  )
}