import { Users, Package, TrendingUp, AlertCircle, Trash2, Lock, Unlock, Eye } from 'lucide-react'
import '../styles/Dashboard.css'

interface AdminUser {
  id: number
  name: string
  email: string
  role: 'buyer' | 'seller' | 'inspector'
  joinDate: string
  status: 'active' | 'banned'
}

interface PendingApproval {
  id: number
  title: string
  seller: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
}

export default function AdminDashboard() {

  const users: AdminUser[] = [
    { id: 1, name: 'Anh Tùng', email: 'anhtung@example.com', role: 'seller', joinDate: '2024-01-10', status: 'active' },
    { id: 2, name: 'Chị Lan', email: 'chilan@example.com', role: 'seller', joinDate: '2024-01-15', status: 'active' },
    { id: 3, name: 'Bạn Minh', email: 'bminh@example.com', role: 'buyer', joinDate: '2024-01-20', status: 'active' },
    { id: 4, name: 'Chị Hoa', email: 'chihoa@example.com', role: 'buyer', joinDate: '2024-01-05', status: 'banned' }
  ]

  const pendingBikes: PendingApproval[] = [
    { id: 1, title: 'Giant Escape 3 2024', seller: 'Anh Tùng', status: 'pending', submittedAt: '2024-01-22' },
    { id: 2, title: 'Trek FX 3', seller: 'Chị Lan', status: 'approved', submittedAt: '2024-01-20' }
  ]

  const stats = [
    { label: 'Tổng Người Dùng', value: users.length.toString(), icon: Users },
    { label: 'Xe Đang Bán', value: '156', icon: Package },
    { label: 'Doanh Thu', value: '25.5M ₫', icon: TrendingUp },
    { label: 'Cần Duyệt', value: '5', icon: AlertCircle }
  ]

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Bảng Điều Khiển Quản Trị Viên</h1>
          <p>Quản lý hệ thống BikeHub</p>
        </div>
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
          <h2>Quản Lý Người Dùng</h2>
          <a href="#" className="link-view-all">Xem tất cả</a>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Email</th>
                <th>Vai Trò</th>
                <th>Ngày Tham Gia</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="font-semibold">{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className="badge-role">
                      {u.role === 'seller' ? 'Bán Hàng' : u.role === 'buyer' ? 'Mua Hàng' : 'Kiểm Duyệt'}
                    </span>
                  </td>
                  <td>{u.joinDate}</td>
                  <td>
                    <span className={`status-badge status-${u.status}`}>
                      {u.status === 'active' ? 'Hoạt động' : 'Bị cấm'}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button className="btn-icon-small" title="Xem chi tiết">
                      <Eye size={16} />
                    </button>
                    {u.status === 'active' ? (
                      <button className="btn-icon-small btn-danger" title="Cấm người dùng">
                        <Lock size={16} />
                      </button>
                    ) : (
                      <button className="btn-icon-small btn-success" title="Bỏ cấm">
                        <Unlock size={16} />
                      </button>
                    )}
                    <button className="btn-icon-small btn-danger" title="Xóa">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2>Xe Cần Duyệt</h2>
        </div>

        <div className="approval-list">
          {pendingBikes.map(bike => (
            <div key={bike.id} className="approval-item">
              <div className="approval-info">
                <h3>{bike.title}</h3>
                <p>Bởi: {bike.seller}</p>
                <p className="meta">Gửi lúc: {bike.submittedAt}</p>
              </div>
              <div className="approval-status">
                <span className={`status-badge status-${bike.status}`}>
                  {bike.status === 'pending' ? 'Đang chờ' : bike.status === 'approved' ? 'Đã duyệt' : 'Bị từ chối'}
                </span>
              </div>
              {bike.status === 'pending' && (
                <div className="approval-actions">
                  <button className="btn-success">Phê Duyệt</button>
                  <button className="btn-danger">Từ Chối</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
