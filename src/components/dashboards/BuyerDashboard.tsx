import { Heart, ShoppingBag, Clock, User, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import '../../styles/dashboards/Dashboard.css'

interface FavoriteBike {
  id: number
  title: string
  price: number
  image: string
  seller: string
  location: string
}

interface PurchaseHistory {
  id: number
  title: string
  price: number
  purchaseDate: string
  status: 'pending' | 'completed' | 'cancelled'
}

export default function BuyerDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const favorites: FavoriteBike[] = [
    {
      id: 1,
      title: 'Giant Escape 3 2024',
      price: 8500000,
      image: '🚴',
      seller: 'Anh Tùng',
      location: 'Hà Nội'
    },
    {
      id: 2,
      title: 'Trek FX 3 Hybrid',
      price: 7200000,
      image: '🚲',
      seller: 'Chị Lan',
      location: 'TP.HCM'
    }
  ]

  const purchases: PurchaseHistory[] = [
    {
      id: 1,
      title: 'Trek Marlin 5',
      price: 12000000,
      purchaseDate: '2024-01-20',
      status: 'completed'
    },
    {
      id: 2,
      title: 'Specialized Rockhopper',
      price: 9500000,
      purchaseDate: '2024-01-10',
      status: 'completed'
    }
  ]

  const stats = [
    { label: 'Yêu thích', value: favorites.length.toString(), icon: Heart },
    { label: 'Đã mua', value: purchases.length.toString(), icon: ShoppingBag },
    { label: 'Đang chờ', value: '1', icon: Clock }
  ]

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      'completed': 'Hoàn thành',
      'pending': 'Đang xử lý',
      'cancelled': 'Đã hủy'
    }
    return statusMap[status] || status
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Bảng Điều Khiển Người Mua</h1>
          <p>Chào mừng, {user.name || 'Người mua'}!</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => navigate('/')}
        >
          <ShoppingBag size={20} />
          Tiếp Tục Mua Sắm
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
          <h2>Xe Đạp Yêu Thích</h2>
          <a href="#" className="link-view-all">Xem tất cả</a>
        </div>

        <div className="bikes-list">
          {favorites.map(bike => (
            <div key={bike.id} className="bike-item">
              <div className="bike-item-image">
                <span>{bike.image}</span>
                <button className="btn-heart active">
                  <Heart size={18} />
                </button>
              </div>
              <div className="bike-item-info">
                <h3>{bike.title}</h3>
                <p className="bike-price">{bike.price.toLocaleString('vi-VN')} ₫</p>
                <p className="bike-meta">
                  <span>Bán bởi: {bike.seller}</span> • 
                  <span className="ml-2">{bike.location}</span>
                </p>
              </div>
              <div className="bike-actions">
                <button className="btn-icon" title="Nhắn tin">
                  <MessageSquare size={18} />
                </button>
                <button className="btn-secondary" title="Xem chi tiết">
                  Xem Chi Tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2>Lịch Sử Mua Hàng</h2>
        </div>

        <div className="purchase-history">
          <table className="history-table">
            <thead>
              <tr>
                <th>Sản Phẩm</th>
                <th>Giá</th>
                <th>Ngày Mua</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(purchase => (
                <tr key={purchase.id}>
                  <td>{purchase.title}</td>
                  <td>{purchase.price.toLocaleString('vi-VN')} ₫</td>
                  <td>{purchase.purchaseDate}</td>
                  <td>
                    <span className={`status-badge status-${purchase.status}`}>
                      {getStatusBadge(purchase.status)}
                    </span>
                  </td>
                  <td>
                    <button className="btn-text">Chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2>Thông Tin Tài Khoản</h2>
        </div>
        <div className="account-info">
          <div className="info-card">
            <User size={24} />
            <div>
              <p className="info-label">Tên</p>
              <p className="info-value">{user.name || 'Chưa cập nhật'}</p>
            </div>
          </div>
          <button className="btn-secondary">Chỉnh Sửa Hồ Sơ</button>
        </div>
      </div>
    </div>
  )
}
