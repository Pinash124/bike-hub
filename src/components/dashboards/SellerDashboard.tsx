// src/components/dashboards/SellerDashboard.tsx
// Role: SELLER — shows real listings from API + inspection status
import { Plus, Eye, TrendingUp, Package, Clock, CheckCircle, ChevronRight, Bike, Calendar, AlertCircle, RefreshCw, Search, Edit2, Trash2, BarChart3, DollarSign } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import { listingService, type Listing } from '../../services/listing.service'

const STATUS_CONFIG: Record<string, { label: string, color: string, bg: string, border: string, icon: string }> = {
  DRAFT: { label: 'Nháp', color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200', icon: '📝' },
  PENDING: { label: 'Chờ duyệt', color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-200', icon: '⏳' },
  RESERVED: { label: 'Đã đặt cọc', color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200', icon: '💰' },
  REJECTED: { label: 'Bị từ chối', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-200', icon: '❌' },
  APPROVED: { label: 'Đã duyệt', color: 'text-indigo-700', bg: 'bg-indigo-100', border: 'border-indigo-200', icon: '✅' },
  LIVE: { label: 'Đang bán', color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200', icon: '🚀' },
  SOLD: { label: 'Đã bán', color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-200', icon: '🎉' },
}

export default function SellerDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest')
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchMyListings()
  }, [])

  const fetchMyListings = async () => {
    try {
      const data = await listingService.getMyListings()
      setListings(data)
    } catch (error) {
      console.error('Failed to fetch listings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchMyListings()
    setIsRefreshing(false)
  }

  const filteredAndSortedListings = useMemo(() => {
    let filtered = listings

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(l => l.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(l => 
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.brand?.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })
  }, [listings, statusFilter, searchQuery, sortBy])

  const liveCount = listings.filter(l => l.status === 'LIVE').length
  const soldCount = listings.filter(l => l.status === 'SOLD').length
  const pendingCount = listings.filter(l => l.status === 'PENDING').length
  const totalRevenue = listings.filter(l => l.status === 'SOLD').reduce((sum, l) => sum + l.price, 0)

  const stats = [
    { label: 'Xe đang bán', value: liveCount.toString(), icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-100', trend: '+12%' },
    { label: 'Xe đã bán', value: soldCount.toString(), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100', trend: '+8%' },
    { label: 'Chờ duyệt', value: pendingCount.toString(), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', trend: '-2%' },
    { label: 'Doanh thu', value: `${(totalRevenue / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-100', trend: '+25%' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 pb-32 pt-8 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <BarChart3 size={24} className="text-white" />
                </div>
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">Seller Dashboard</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-2">Bảng Điều Khiển</h1>
              <p className="text-green-100 text-lg font-medium">Chào mừng trở lại, <span className="font-bold text-white">{user.name || 'Người bán'}</span>! 👋</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
              >
                <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                Làm mới
              </button>
              <button
                className="flex items-center gap-2 bg-white hover:bg-green-50 text-green-700 px-6 py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-green-900/20 transition-all active:scale-95"
                onClick={() => navigate('/seller/new-bike')}
              >
                <Plus size={18} strokeWidth={2.5} />
                Đăng Xe Mới
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 space-y-8 relative z-10">
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="group bg-white rounded-3xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={28} className={stat.color} />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    stat.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {stat.trend}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-800">{isLoading ? '...' : stat.value}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Enhanced KYC Notice */}
        {!user.isKYCVerified && (
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-2 border-amber-200 rounded-3xl p-8 flex flex-col lg:flex-row items-start lg:items-center gap-6 shadow-lg">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0 animate-pulse">
              <AlertCircle size={32} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-amber-900 mb-2">⚠️ Cần xác minh danh tính (KYC)</h3>
              <p className="text-amber-700 text-base leading-relaxed">Để đăng bán xe trên BikeHub, bạn cần xác minh danh tính. Quá trình này chỉ mất 2-3 phút và đảm bảo an toàn cho cả người mua và người bán.</p>
            </div>
            <button
              onClick={() => navigate('/kyc')}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-600/40 shrink-0"
            >
              Xác minh ngay
            </button>
          </div>
        )}

        {/* Enhanced Listings Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                  <Bike size={28} className="text-green-600" />
                  Danh Sách Xe Đạp
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {filteredAndSortedListings.length} xe
                  </span>
                </h2>
                <p className="text-slate-600 mt-1">Quản lý tất cả xe đang bán của bạn</p>
              </div>
              <button className="text-sm font-bold text-green-600 hover:text-green-700 flex items-center gap-2 transition-colors">
                Xem tất cả <ChevronRight size={18} />
              </button>
            </div>
            
            {/* Search and Filters */}
            <div className="mt-6 flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm theo tên xe, thương hiệu..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="LIVE">Đang bán</option>
                  <option value="SOLD">Đã bán</option>
                  <option value="PENDING">Chờ duyệt</option>
                  <option value="APPROVED">Đã duyệt</option>
                  <option value="DRAFT">Nháp</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price-low">Giá thấp → cao</option>
                  <option value="price-high">Giá cao → thấp</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-8">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-green-200 animate-spin"></div>
                  <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-green-600 animate-spin"></div>
                </div>
                <p className="text-base font-medium text-slate-600">Đang tải danh sách xe...</p>
              </div>
            ) : filteredAndSortedListings.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <Bike size={48} className="text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                  {searchQuery || statusFilter !== 'all' ? 'Không tìm thấy xe nào' : 'Chưa có xe nào được đăng'}
                </h3>
                <p className="text-slate-600 text-base mt-2 max-w-md leading-relaxed">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác.'
                    : 'Hãy bắt đầu hành trình bán hàng của bạn bằng cách đăng chiếc xe đầu tiên lên BikeHub.'
                  }
                </p>
                <button
                  onClick={() => navigate('/seller/new-bike')}
                  className="mt-8 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl font-bold text-sm uppercase tracking-wider transition-all shadow-lg hover:shadow-xl"
                >
                  Đăng xe đầu tiên
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSortedListings.map(listing => {
                  const thumbnail = listing.images?.[0]?.secureUrl
                  const config = STATUS_CONFIG[listing.status] || STATUS_CONFIG.DRAFT
                  const needsPayment = listing.status === 'APPROVED';

                  return (
                    <div key={listing.id} className="group border border-slate-200 rounded-3xl overflow-hidden hover:border-green-300 hover:shadow-2xl transition-all duration-300 bg-white">
                      {/* Image Section */}
                      <div className="relative h-48 bg-slate-100 overflow-hidden">
                        {thumbnail ? (
                          <img 
                            src={thumbnail} 
                            alt={listing.title} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-slate-100 to-slate-200">
                            🚴
                          </div>
                        )}
                        
                        {/* Status Badge */}
                        <div className="absolute top-4 left-4">
                          <span className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-sm ${config.bg} ${config.color} ${config.border}`}>
                            <span className="text-lg">{config.icon}</span>
                            {config.label}
                          </span>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white transition-colors shadow-lg">
                            <Edit2 size={16} className="text-slate-600" />
                          </button>
                          <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white transition-colors shadow-lg">
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                        
                        {listing.status === 'SOLD' && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="bg-slate-800 text-white text-sm font-bold px-4 py-2 rounded-full uppercase tracking-widest">Đã bán</span>
                          </div>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-2" title={listing.title}>
                            {listing.title}
                          </h3>
                          <div className="flex items-center justify-between">
                            <p className="text-2xl font-black text-green-600">
                              {listing.price.toLocaleString('vi-VN')} ₫
                            </p>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Eye size={14} />
                              <span>1.2k</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600">
                            <Package size={12} className="text-slate-400" /> 
                            {listing.brand?.name || 'Khác'}
                          </span>
                          {listing.usageDuration != null && (
                            <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600">
                              <Calendar size={12} className="text-slate-400" /> 
                              {listing.usageDuration} năm
                            </span>
                          )}
                        </div>

                        {needsPayment && (
                          <div className="border-t border-slate-100 pt-4">
                            <button
                              onClick={() => navigate(`/seller/choose-plan/${listing.id}`, { state: { listing } })}
                              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                              <DollarSign size={16} />
                              Thanh toán để hiển thị
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        {/* Enhanced Verification Success Notice */}
        {user.isKYCVerified && (
          <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-2 border-green-200 rounded-3xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-green-800 font-semibold text-base">
                ✅ Tài khoản đã được xác minh danh tính
              </p>
              <p className="text-green-600 text-sm mt-1">Bạn có thể tự do đăng bán xe trên nền tảng BikeHub.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
