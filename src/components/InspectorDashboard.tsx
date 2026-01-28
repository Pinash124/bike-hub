import { CheckCircle, XCircle, Clock, AlertCircle, Camera } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import '../styles/Dashboard.css'

interface BikeForInspection {
  id: number
  title: string
  seller: string
  submittedAt: string
  status: 'pending' | 'inspecting' | 'approved' | 'rejected'
  image: string
  price: number
}

interface InspectionHistory {
  id: number
  title: string
  inspectedDate: string
  result: 'approved' | 'rejected'
  notes: string
}

export default function InspectorDashboard() {
  const navigate = useNavigate()

  const bikesForInspection: BikeForInspection[] = [
    {
      id: 1,
      title: 'Giant Escape 3 2024',
      seller: 'Anh Tùng',
      submittedAt: '2024-01-22',
      status: 'pending',
      image: '🚴',
      price: 8500000
    },
    {
      id: 2,
      title: 'Trek Marlin 5',
      seller: 'Chị Lan',
      submittedAt: '2024-01-20',
      status: 'inspecting',
      image: '🚲',
      price: 12000000
    },
    {
      id: 3,
      title: 'Specialized Rockhopper',
      seller: 'Anh Minh',
      submittedAt: '2024-01-18',
      status: 'approved',
      image: '🚴',
      price: 9500000
    }
  ]

  const inspectionHistory: InspectionHistory[] = [
    {
      id: 1,
      title: 'Trek FX 3 Hybrid',
      inspectedDate: '2024-01-20',
      result: 'approved',
      notes: 'Điều kiện tốt, hình ảnh rõ ràng'
    },
    {
      id: 2,
      title: 'Giant Escape 2023',
      inspectedDate: '2024-01-15',
      result: 'rejected',
      notes: 'Hình ảnh không rõ, thiếu thông tin kỹ thuật'
    }
  ]

  const stats = [
    { label: 'Đang Chờ', value: '8', icon: Clock },
    { label: 'Đang Kiểm Duyệt', value: '2', icon: AlertCircle },
    { label: 'Đã Duyệt', value: '45', icon: CheckCircle },
    { label: 'Từ Chối', value: '3', icon: XCircle }
  ]

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Chờ kiểm duyệt',
      'inspecting': 'Đang kiểm duyệt',
      'approved': 'Đã phê duyệt',
      'rejected': 'Bị từ chối'
    }
    return statusMap[status] || status
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Bảng Điều Khiển Kiểm Duyệt Viên</h1>
          <p>Kiểm duyệt thông tin xe đạp trên nền tảng</p>
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
          <h2>Xe Cần Kiểm Duyệt</h2>
          <a href="#" className="link-view-all">Xem tất cả</a>
        </div>

        <div className="inspection-list">
          {bikesForInspection.map(bike => (
            <div key={bike.id} className="inspection-item">
              <div className="inspection-image">
                <span className="image-emoji">{bike.image}</span>
              </div>
              <div className="inspection-info">
                <h3>{bike.title}</h3>
                <p className="bike-price">{bike.price.toLocaleString('vi-VN')} ₫</p>
                <div className="bike-meta-info">
                  <span>Bán bởi: {bike.seller}</span>
                  <span>Gửi lúc: {bike.submittedAt}</span>
                </div>
              </div>
              <div className="inspection-status">
                <span className={`status-badge status-${bike.status}`}>
                  {getStatusColor(bike.status)}
                </span>
              </div>
              {bike.status === 'pending' && (
                <div className="inspection-actions">
                  <button className="btn-primary" onClick={() => navigate(`/inspector/inspect/${bike.id}`)}>
                    <Camera size={18} />
                    Kiểm Duyệt
                  </button>
                </div>
              )}
              {bike.status === 'inspecting' && (
                <div className="inspection-actions">
                  <button className="btn-secondary">
                    Đang kiểm duyệt
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2>Lịch Sử Kiểm Duyệt</h2>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sản Phẩm</th>
                <th>Ngày Kiểm Duyệt</th>
                <th>Kết Quả</th>
                <th>Ghi Chú</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {inspectionHistory.map(history => (
                <tr key={history.id}>
                  <td className="font-semibold">{history.title}</td>
                  <td>{history.inspectedDate}</td>
                  <td>
                    <span className={`status-badge status-${history.result}`}>
                      {history.result === 'approved' ? '✓ Phê Duyệt' : '✕ Từ Chối'}
                    </span>
                  </td>
                  <td>{history.notes}</td>
                  <td>
                    <button className="btn-text">Chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
