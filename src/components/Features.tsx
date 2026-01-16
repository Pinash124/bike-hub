import { Shield, TrendingUp, Users, Clock } from 'lucide-react'
import '../styles/Features.css'

const features = [
  {
    id: 1,
    icon: Shield,
    title: 'An Toàn & Tin Cậy',
    description: 'Kiểm duyệt tin đăng và người dùng nghiêm ngặt',
  },
  {
    id: 2,
    icon: TrendingUp,
    title: 'Giá Cạnh Tranh',
    description: 'So sánh giá từ hàng ngàn tin đăng',
  },
  {
    id: 3,
    icon: Users,
    title: 'Cộng Đồng Lớn',
    description: 'Kết nối với hơn 100,000 người yêu xe',
  },
  {
    id: 4,
    icon: Clock,
    title: 'Nhanh Chóng',
    description: 'Đăng tin chỉ trong vài phút',
  },
]

export default function Features() {
  return (
    <section className="features">
      <div className="section-header">
        <h2>Tại Sao Chọn BikeHub?</h2>
        <p>Nền tảng tin cậy cho người mua và bán xe đạp cũ</p>
      </div>

      <div className="features-grid">
        {features.map(({ id, icon: Icon, title, description }) => (
          <div key={id} className="feature-card">
            <div className="feature-icon">
              <Icon size={32} />
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
