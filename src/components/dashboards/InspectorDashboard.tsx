import { CheckCircle, XCircle, Clock, AlertCircle, Camera } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

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
    <div className="bg-white min-h-[calc(100vh-80px)]">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bảng Điều Khiển Kiểm Duyệt Viên</h1>
          <p className="text-gray-600">Kiểm duyệt thông tin xe đạp trên nền tảng</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <Icon size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 mb-8">
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Xe Cần Kiểm Duyệt</h2>
            <a href="#" className="text-green-600 hover:text-green-700 text-sm font-medium">Xem tất cả</a>
          </div>

          <div className="divide-y divide-gray-200">
            {bikesForInspection.map(bike => (
              <div key={bike.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                    {bike.image}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{bike.title}</h3>
                    <p className="text-green-600 font-medium">{bike.price.toLocaleString('vi-VN')} ₫</p>
                    <div className="text-sm text-gray-600 space-y-1 mt-1">
                      <p>Bán bởi: {bike.seller}</p>
                      <p>Gửi lúc: {bike.submittedAt}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    bike.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    bike.status === 'inspecting' ? 'bg-blue-100 text-blue-800' :
                    bike.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {getStatusColor(bike.status)}
                  </span>
                  {bike.status === 'pending' && (
                    <button 
                      onClick={() => navigate(`/inspector/inspect/${bike.id}`)}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      <Camera size={18} />
                      Kiểm Duyệt
                    </button>
                  )}
                  {bike.status === 'inspecting' && (
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-default">
                      Đang kiểm duyệt
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">Lịch Sử Kiểm Duyệt</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sản Phẩm</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ngày Kiểm Duyệt</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Kết Quả</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ghi Chú</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inspectionHistory.map(history => (
                  <tr key={history.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-semibold text-gray-900">{history.title}</td>
                    <td className="px-6 py-4 text-gray-600">{history.inspectedDate}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        history.result === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {history.result === 'approved' ? '✓ Phê Duyệt' : '✕ Từ Chối'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{history.notes}</td>
                    <td className="px-6 py-4">
                      <button className="text-green-600 hover:text-green-700 font-medium text-sm">Chi tiết</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
