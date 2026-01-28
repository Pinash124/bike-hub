import { Plus, Edit, Trash2, Eye, TrendingUp, Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import '../styles/Dashboard.css'

interface SellerBike {
  id: number
  title: string
  price: number
  image: string
  views: number
  sold: boolean
  createdAt: string
}

export default function SellerDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const sellerBikes: SellerBike[] = [
    {
      id: 1,
      title: 'Giant Escape 3 2024',
      price: 8500000,
      image: '🚴',
      views: 145,
      sold: false,
      createdAt: '2024-01-20'
    },
    {
      id: 2,
      title: 'Trek FX 3 Hybrid',
      price: 7200000,
      image: '🚲',
      views: 89,
      sold: false,
      createdAt: '2024-01-15'
    },
    {
      id: 3,
      title: 'Trek Marlin 5',
      price: 12000000,
      image: '🚴',
      views: 256,
      sold: true,
      createdAt: '2024-01-10'
    }
  ]

  const stats = [
    { label: 'Xe đang bán', value: '2', icon: Package },
    { label: 'Xe đã bán', value: '1', icon: TrendingUp },
    { label: 'Lượt xem', value: '490', icon: Eye }
  ]

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Bảng Điều Khiển Người Bán</h1>
          <p>Chào mừng, {user.name || 'Người bán'}!</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => navigate('/seller/new-bike')}
        >
          <Plus size={20} />
          Đăng Xe Mới
        </button>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="stat-card">
              <div className="stat-icon">
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <p className="stat-label">{stat.label}</p>
                <p className="stat-value">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2>Danh Sách Xe Đạp</h2>
          <a href="#" className="link-view-all">Xem tất cả</a>
        </div>

        <div className="bikes-list">
          {sellerBikes.map(bike => (
            <div key={bike.id} className="bike-item seller-bike-item">
              <div className="bike-item-image">
                <span>{bike.image}</span>
                {bike.sold && <span className="badge-sold">Đã bán</span>}
              </div>
              <div className="bike-item-info">
                <h3>{bike.title}</h3>
                <p className="bike-price">{bike.price.toLocaleString('vi-VN')} ₫</p>
                <p className="bike-meta">
                  <span>{bike.views} lượt xem</span> • 
                  <span className="ml-2">{bike.createdAt}</span>
                </p>
              </div>
              <div className="bike-actions">
                <button className="btn-icon" title="Xem chi tiết">
                  <Eye size={18} />
                </button>
                {!bike.sold && (
                  <>
                    <button className="btn-icon" title="Chỉnh sửa">
                      <Edit size={18} />
                    </button>
                    <button className="btn-icon btn-danger" title="Xóa">
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2>Đơn Bán Gần Đây</h2>
        </div>
        <div className="empty-state">
          <p>Chưa có đơn bán nào</p>
        </div>
      </div>
    </div>
  )
}
