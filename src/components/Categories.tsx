import { Bike, Wind, Zap, Wrench } from 'lucide-react'
import '../styles/Categories.css'

const categories = [
  {
    id: 1,
    icon: Bike,
    name: 'Xe Đạp Địa Hình',
    count: '8,540',
    description: 'MTB và Off-road',
  },
  {
    id: 2,
    icon: Wind,
    name: 'Xe Đạp Tốc Độ',
    count: '6,230',
    description: 'Road bike',
  },
  {
    id: 3,
    icon: Zap,
    name: 'Xe Đạp Điện',
    count: '5,680',
    description: 'E-bike hiện đại',
  },
  {
    id: 4,
    icon: Wrench,
    name: 'Phụ Tùng & Phụ Kiện',
    count: '12,420',
    description: 'Linh kiện xe đạp',
  },
]

export default function Categories() {
  return (
    <section className="categories">
      <div className="section-header">
        <h2>Danh Mục Xe Đạp</h2>
        <p>Chọn loại xe đạp bạn quan tâm</p>
      </div>

      <div className="categories-grid">
        {categories.map(({ id, icon: Icon, name, count, description }) => (
          <div key={id} className="category-card">
            <div className="category-icon">
              <Icon size={32} />
            </div>
            <h3>{name}</h3>
            <p className="category-desc">{description}</p>
            <span className="category-count">{count} sản phẩm</span>
            <button className="btn-category">Xem Ngay →</button>
          </div>
        ))}
      </div>
    </section>
  )
}
