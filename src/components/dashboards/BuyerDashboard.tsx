import { useState, useEffect } from 'react'
import { Heart, ShoppingBag, Clock, User, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { orderService } from '../../services/order.service'
import { listingService } from '../../services/listing.service'

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
  const { user } = useAuth()
  const [favorites] = useState<FavoriteBike[]>([]) // No API yet, set to empty
  const [purchases, setPurchases] = useState<PurchaseHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeOrdersCount, setActiveOrdersCount] = useState(0)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        const orders = await orderService.getMyOrders()

        // Count active orders
        const active = orders.filter(o => ['PENDING', 'CONFIRMED', 'SHIPPING'].includes(o.status)).length
        setActiveOrdersCount(active)

        // Enrich orders with product titles
        const enrichedPurchases = await Promise.all(orders.map(async (order) => {
          let title = `Order #${order.id.slice(0, 8).toUpperCase()}`
          if (order.listingId) {
            try {
              const listing = await listingService.getListingById(order.listingId)
              if (listing) title = listing.title
            } catch (err) {
              console.error(`Failed to fetch listing ${order.listingId}`, err)
            }
          }
          return {
            id: order.id as any,
            title: title,
            price: order.totalPrice,
            purchaseDate: new Date(order.createdAt).toLocaleDateString('vi-VN'),
            status: order.status.toLowerCase() as any
          }
        }))
        setPurchases(enrichedPurchases)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const stats = [
    { label: 'Yêu thích', value: favorites.length.toString(), icon: Heart },
    { label: 'Đã mua', value: purchases.filter(p => p.status === 'completed').length.toString(), icon: ShoppingBag },
    { label: 'Đang chờ', value: activeOrdersCount.toString(), icon: Clock }
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
          <p>Chào mừng, {user?.name || 'Người mua'}!</p>
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
          {favorites.length === 0 ? (
            <div className="w-full py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Heart size={48} className="mx-auto mb-3 text-gray-200" />
              <p className="text-gray-400 font-medium">Bạn chưa có xe đạp yêu thích nào</p>
            </div>
          ) : (
            favorites.map(bike => (
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
            ))
          )}
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
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400">Đang tải lịch sử...</td>
                </tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400">Bạn chưa có đơn hàng nào</td>
                </tr>
              ) : (
                purchases.map(purchase => (
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
                      <button className="btn-text" onClick={() => navigate('/buyer/orders')}>Chi tiết</button>
                    </td>
                  </tr>
                ))
              )}
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
              <p className="info-value">{user?.name || 'Chưa cập nhật'}</p>
            </div>
          </div>
          <button className="btn-secondary">Chỉnh Sửa Hồ Sơ</button>
        </div>
      </div>
    </div>
  )
}
