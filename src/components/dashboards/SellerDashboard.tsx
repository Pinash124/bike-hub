// src/components/dashboards/SellerDashboard.tsx
// Role: SELLER — shows real listings from API + inspection status
import { Plus, Eye, TrendingUp, Package, Clock, CheckCircle, ChevronRight, Bike, Calendar, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { listingService, type Listing } from '../../services/listing.service'

const STATUS_CONFIG: Record<string, { label: string, color: string, bg: string, border: string }> = {
  DRAFT: { label: 'Nháp', color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200' },
  PENDING: { label: 'Chờ duyệt', color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-200' },
  RESERVED: { label: 'Đã đặt cọc', color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200' },
  REJECTED: { label: 'Bị từ chối', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-200' },
  APPROVED: { label: 'Đã duyệt', color: 'text-indigo-700', bg: 'bg-indigo-100', border: 'border-indigo-200' },
  LIVE: { label: 'Đang bán', color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200' },
  SOLD: { label: 'Đã bán', color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-200' },
}

export default function SellerDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  const liveCount = listings.filter(l => l.status === 'LIVE').length
  const soldCount = listings.filter(l => l.status === 'SOLD').length
  const pendingCount = listings.filter(l => l.status === 'PENDING').length

  const stats = [
    { label: 'Xe đang bán', value: liveCount.toString(), icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Xe đã bán', value: soldCount.toString(), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Chờ kiểm duyệt', value: pendingCount.toString(), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Tổng lượt xem', value: '—', icon: Eye, color: 'text-purple-600', bg: 'bg-purple-100' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header section with curve */}
      <div className="bg-green-600 pb-20 pt-10 px-6 relative">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="text-white">
            <h1 className="text-3xl font-black tracking-tight">Bảng Điều Khiển Của Bạn</h1>
            <p className="text-green-100 mt-1 font-medium">Chào mừng, {user.name || 'Người bán'}!</p>
          </div>
          <button
            className="flex items-center gap-2 bg-white text-green-700 hover:bg-green-50 px-6 py-3.5 rounded-full font-bold text-sm uppercase tracking-widest shadow-xl shadow-green-900/20 transition-all active:scale-95"
            onClick={() => navigate('/seller/new-bike')}
          >
            <Plus size={18} strokeWidth={2.5} />
            Đăng Xe Mới
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-10 space-y-8 relative z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <Icon size={24} className={stat.color} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-800">{isLoading ? '...' : stat.value}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* KYC Notice */}
        {!user.isKYCVerified && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-sm">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
              <AlertCircle size={24} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-900">Tài khoản chưa xác minh danh tính (KYC)</h3>
              <p className="text-amber-700 text-sm mt-1">Bạn cần xác minh danh tính để bản tin được duyệt và hiển thị trên nền tảng. Quá trình này chỉ mất 2 phút.</p>
            </div>
            <button
              onClick={() => navigate('/kyc')}
              className="mt-4 sm:mt-0 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-colors shadow-lg shadow-amber-500/30 shrink-0"
            >
              Xác minh ngay
            </button>
          </div>
        )}

        {/* Listings Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800">Danh Sách Xe Đạp</h2>
            <button className="text-sm font-bold text-green-600 hover:text-green-700 flex items-center gap-1">
              Xem tất cả <ChevronRight size={16} />
            </button>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border-4 border-green-200 border-t-green-600 animate-spin"></div>
                <p className="text-sm font-medium text-slate-400">Đang tải danh sách xe...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Bike size={40} className="text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Chưa có xe nào được đăng</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-sm">Hãy bắt đầu hành trình bán hàng của bạn bằng cách đăng chiếc xe đầu tiên lên BikeHub.</p>
                <button
                  onClick={() => navigate('/seller/new-bike')}
                  className="mt-6 px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-colors"
                >
                  Đăng xe ngay
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listings.map(listing => {
                  const thumbnail = listing.images?.[0]?.secureUrl
                  const config = STATUS_CONFIG[listing.status] || STATUS_CONFIG.DRAFT
                  const needsPayment = listing.status === 'APPROVED';

                  return (
                    <div key={listing.id} className="group border border-slate-100 rounded-2xl p-4 hover:border-green-200 hover:shadow-md transition-all flex gap-4 bg-slate-50/50">
                      <div className="w-24 h-24 rounded-xl bg-slate-100 overflow-hidden shrink-0 relative">
                        {thumbnail ? (
                          <img src={thumbnail} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">🚴</div>
                        )}
                        {listing.status === 'SOLD' && (
                          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                            <span className="bg-slate-800 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">Đã bán</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-bold text-slate-800 truncate" title={listing.title}>{listing.title}</h3>
                            <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.bg} ${config.color} ${config.border}`}>
                              {config.label}
                            </span>
                          </div>
                          <p className="text-green-600 font-black">{listing.price.toLocaleString('vi-VN')} ₫</p>
                        </div>

                        <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                          <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200">
                            <Package size={12} className="text-slate-400" /> {listing.brand?.name || 'Khác'}
                          </span>
                          {listing.usageDuration != null && (
                            <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200">
                              <Calendar size={12} className="text-slate-400" /> {listing.usageDuration} tháng
                            </span>
                          )}
                        </div>
                      </div>

                      {needsPayment && (
                        <div className="mt-2 border-t border-slate-100/60 p-3">
                          <button
                            onClick={() => navigate(`/seller/choose-plan/${listing.id}`, { state: { listing } })}
                            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black rounded-xl text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/30 hover:shadow-green-600/40 hover:-translate-y-0.5"
                          >
                            Thanh toán
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Verification Success Notice */}
      {user.isKYCVerified && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-green-600 shrink-0" />
          <p className="text-green-800 text-sm font-medium">Tài khoản của bạn đã được xác minh danh tính. Bạn có thể tự do đăng bán xe trên nền tảng.</p>
        </div>
      )}
    </div>
  )
}
