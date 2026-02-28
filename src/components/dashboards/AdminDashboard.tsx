// src/components/dashboards/AdminDashboard.tsx
// Role: ADMIN — full management of users, KYC, inspections, brands, components, locations
import {
  Users, FileCheck, MapPin, Plus, Edit, Trash2,
  LayoutDashboard, Tag, Wrench, ClipboardList,
  CheckCircle, XCircle, Clock, ChevronRight,
  UserCheck, Bike, AlertTriangle, RefreshCw, X
} from 'lucide-react'
import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { adminService, getPrimaryRole, type AdminUser, type KYCRequest } from '../../services/admin.service'
import { locationService, type InspectionLocation } from '../../services/location.service'
import { brandService, type Brand } from '../../services/brand.service'
import { componentService, type InspectionComponent } from '../../services/component.service'
import { inspectionService, type InspectionTask } from '../../services/inspection.service'
import { listingService, type Listing } from '../../services/listing.service'

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'users' | 'kyc' | 'inspections' | 'catalog' | 'locations' | 'listings'

// ─── Error boundary ───────────────────────────────────────────────────────────

// React error boundary to catch any runtime exceptions inside the dashboard
class DashboardErrorBoundary extends React.Component<Record<string, unknown>, { hasError: boolean }> {
  constructor(props: Record<string, unknown>) {
    super(props as any)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_: unknown) {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error('AdminDashboard caught error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-xl font-bold text-red-600">Đã có lỗi xảy ra trong bảng điều khiển</h2>
          <p className="text-slate-500">Vui lòng thử làm mới trang hoặc liên hệ quản trị viên.</p>
        </div>
      )
    }
    return this.props.children
  }
}

const ROLE_LABEL: Record<string, string> = {
  BUYER: 'Người mua', SELLER: 'Người bán', INSPECTOR: 'Kiểm định viên', ADMIN: 'Quản trị viên',
}
const ROLE_COLOR: Record<string, string> = {
  BUYER: 'bg-blue-100 text-blue-700', SELLER: 'bg-amber-100 text-amber-700',
  INSPECTOR: 'bg-purple-100 text-purple-700', ADMIN: 'bg-rose-100 text-rose-700',
}
const INSPECTION_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING_ASSIGNED: { label: 'Chờ gán', color: 'bg-amber-100 text-amber-700' },
  ASSIGNED: { label: 'Đã gán', color: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'Đang thực hiện', color: 'bg-indigo-100 text-indigo-700' },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-700' },
}
const KYC_STATUS_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: 'Chờ duyệt', color: 'bg-amber-100 text-amber-700', icon: Clock },
  VERIFIED: { label: 'Đã xác minh', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  REJECTED: { label: 'Từ chối', color: 'bg-red-100 text-red-700', icon: XCircle },
}
const LISTING_STATUS_MAP: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Nháp', color: 'bg-slate-100 text-slate-600' },
  PENDING: { label: 'Chờ duyệt', color: 'bg-amber-100 text-amber-700' },
  APPROVED: { label: 'Đã duyệt', color: 'bg-emerald-100 text-emerald-700' },
  LIVE: { label: 'Đang bán', color: 'bg-blue-100 text-blue-700' },
  REJECTED: { label: 'Từ chối', color: 'bg-red-100 text-red-700' },
  RESERVED: { label: 'Đặt cọc', color: 'bg-purple-100 text-purple-700' },
  SOLD: { label: 'Đã bán', color: 'bg-teal-100 text-teal-700' },
}

// ─── Reusable UI ─────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <AlertTriangle size={36} className="mb-3 opacity-40" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">
            <X size={16} className="text-slate-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition placeholder:text-slate-300"

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  users, kyc, inspections, brands, components, locations, loading
}: {
  users: AdminUser[]; kyc: KYCRequest[]; inspections: InspectionTask[];
  brands: Brand[]; components: InspectionComponent[]; locations: InspectionLocation[];
  loading: boolean;
}) {
  const pendingKYC = kyc.filter(k => k.status === 'PENDING').length
  const pendingInspections = inspections.filter(i => i.status === 'PENDING_ASSIGNED').length

  const stats = [
    { label: 'Tổng Người Dùng', value: users.length, icon: Users, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600' },
    { label: 'KYC Chờ Duyệt', value: pendingKYC, icon: FileCheck, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-600' },
    { label: 'Kiểm Định Chờ Gán', value: pendingInspections, icon: ClipboardList, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-600' },
    { label: 'Thương Hiệu', value: brands.length, icon: Bike, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { label: 'Hạng Mục KĐ', value: components.length, icon: Wrench, color: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50', text: 'text-indigo-600' },
    { label: 'Địa Điểm KĐ', value: locations.length, icon: MapPin, color: 'from-rose-500 to-rose-600', bg: 'bg-rose-50', text: 'text-rose-600' },
  ]

  const inspectors = users.filter(u => getPrimaryRole(u) === 'INSPECTOR')
  const sellers = users.filter(u => getPrimaryRole(u) === 'SELLER')
  const buyers = users.filter(u => getPrimaryRole(u) === 'BUYER')

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2.5 rounded-xl ${s.bg}`}>
                  <Icon size={20} className={s.text} />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight">{s.label}</p>
              </div>
              <p className="text-3xl font-black text-slate-800">
                {loading ? <span className="text-slate-300 text-xl">...</span> : s.value}
              </p>
            </div>
          )
        })}
      </div>

      {/* User composition */}
      {!loading && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-4">Thành Phần Người Dùng</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Người Mua', count: buyers.length, color: 'bg-blue-500' },
              { label: 'Người Bán', count: sellers.length, color: 'bg-amber-500' },
              { label: 'Kiểm Định Viên', count: inspectors.length, color: 'bg-purple-500' },
            ].map(item => (
              <div key={item.label} className="text-center">
                <div className={`w-2 h-2 ${item.color} rounded-full mx-auto mb-2`} />
                <p className="text-2xl font-black text-slate-800">{item.count}</p>
                <p className="text-xs text-slate-500 font-medium">{item.label}</p>
              </div>
            ))}
          </div>

          {users.length > 0 && (
            <div className="mt-4 flex h-2 rounded-full overflow-hidden gap-0.5">
              {buyers.length > 0 && <div className="bg-blue-500 transition-all" style={{ flex: buyers.length }} />}
              {sellers.length > 0 && <div className="bg-amber-500 transition-all" style={{ flex: sellers.length }} />}
              {inspectors.length > 0 && <div className="bg-purple-500 transition-all" style={{ flex: inspectors.length }} />}
            </div>
          )}
        </div>
      )}

      {/* Recent inspections preview */}
      {!loading && inspections.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50">
            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Đơn Kiểm Định Gần Đây</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {inspections.slice(0, 5).map(ins => {
              const st = INSPECTION_STATUS_MAP[ins.status] ?? { label: ins.status, color: 'bg-slate-100 text-slate-600' }
              return (
                <div key={ins.inspectionId} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/60 transition">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{ins.inspectionType === 'COMPANY' ? 'Tại Công Ty' : 'Tại Chỗ'}</p>
                    <p className="text-xs text-slate-400">{ins.scheduledAt ? new Date(ins.scheduledAt).toLocaleDateString('vi-VN') : '—'}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${st.color}`}>{st.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Users Tab ───────────────────────────────────────────────────────────────

function UsersTab({ users, loading }: { users: AdminUser[]; loading: boolean }) {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')

  const filtered = users.filter(u => {
    const role = getPrimaryRole(u)
    const matchRole = roleFilter === 'ALL' || role === roleFilter
    const matchSearch = !search || (u.username?.toLowerCase().includes(search.toLowerCase()) || u.name?.toLowerCase().includes(search.toLowerCase()))
    return matchRole && matchSearch
  })

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between">
        <h2 className="font-bold text-slate-800">Danh Sách Người Dùng <span className="text-slate-400 font-normal text-sm ml-1">({users.length})</span></h2>
        <div className="flex gap-2 flex-wrap">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm tên / email..."
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 w-44"
          />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400">
            <option value="ALL">Tất cả</option>
            <option value="BUYER">Người mua</option>
            <option value="SELLER">Người bán</option>
            <option value="INSPECTOR">Kiểm định viên</option>
            <option value="ADMIN">Quản trị viên</option>
          </select>
        </div>
      </div>
      {loading ? <Spinner /> : filtered.length === 0 ? <EmptyState message="Không có người dùng nào." /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-3.5">Người Dùng</th>
                <th className="px-6 py-3.5">Vai Trò</th>
                <th className="px-6 py-3.5">KYC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-slate-600">{(u.name || u.username || '?')[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{u.name || 'Chưa cập nhật'}</p>
                        <p className="text-xs text-slate-400">{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    {(() => {
                      const r = getPrimaryRole(u); return (
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${ROLE_COLOR[r] ?? 'bg-slate-100 text-slate-600'}`}>
                          {ROLE_LABEL[r] ?? r}
                        </span>
                      )
                    })()}
                  </td>
                  <td className="px-6 py-3.5">
                    {u.kyc
                      ? <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold"><CheckCircle size={13} /> Đã xác minh</span>
                      : <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-medium"><Clock size={13} /> Chưa xác minh</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── KYC Tab ─────────────────────────────────────────────────────────────────

function KycTab({ kycList, loading, onRefresh }: { kycList: KYCRequest[]; loading: boolean; onRefresh: () => void }) {
  const [processing, setProcessing] = useState<string | null>(null)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL')

  const filtered = filter === 'ALL' ? kycList : kycList.filter(k => k.status === filter)

  const handleVerify = async (id: string, approved: boolean) => {
    setProcessing(id)
    const ok = await adminService.verifyKYC(id, approved)
    if (ok) {
      alert(approved ? 'Đã phê duyệt KYC!' : 'Đã từ chối KYC!')
      onRefresh()
    } else {
      alert('Thao tác thất bại, vui lòng thử lại.')
    }
    setProcessing(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${filter === f ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400'}`}>
            {f === 'ALL' ? 'Tất cả' : KYC_STATUS_MAP[f]?.label ?? f}
            {f === 'PENDING' && kycList.filter(k => k.status === 'PENDING').length > 0 &&
              <span className="ml-1.5 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{kycList.filter(k => k.status === 'PENDING').length}</span>}
          </button>
        ))}
        <button onClick={onRefresh} className="ml-auto p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 transition">
          <RefreshCw size={15} />
        </button>
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? <EmptyState message="Không có yêu cầu KYC nào." /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((kyc, i) => {
            const st = KYC_STATUS_MAP[kyc.status] ?? { label: kyc.status, color: 'bg-slate-100 text-slate-600', icon: Clock }
            const Icon = st.icon
            const isProc = processing === kyc.id
            return (
              <div key={kyc.id || String(i)} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">{kyc.fullName || 'Không rõ tên'}</h3>
                    {kyc.user?.username && (
                      <p className="text-xs text-slate-400 mt-0.5">@{kyc.user.username}</p>
                    )}
                  </div>
                  <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${st.color}`}>
                    <Icon size={12} /> {st.label}
                  </span>
                </div>

                {/* KYC Details */}
                <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-xs">
                  {kyc.idNumber && (
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">CMND/CCCD</span>
                      <span className="font-bold text-slate-700">{kyc.idNumber}</span>
                    </div>
                  )}
                  {kyc.dateOfBirth && (
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Ngày sinh</span>
                      <span className="font-bold text-slate-700">{kyc.dateOfBirth}</span>
                    </div>
                  )}
                  {kyc.gender && (
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Giới tính</span>
                      <span className="font-bold text-slate-700">{kyc.gender}</span>
                    </div>
                  )}
                  {kyc.nationality && (
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Quốc tịch</span>
                      <span className="font-bold text-slate-700">{kyc.nationality}</span>
                    </div>
                  )}
                  {kyc.submittedAt && (
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Nộp lúc</span>
                      <span className="font-medium text-slate-500">{new Date(kyc.submittedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                  {kyc.verifiedAt && (
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Duyệt lúc</span>
                      <span className="font-medium text-slate-500">{new Date(kyc.verifiedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                </div>

                {/* Actions — only for PENDING */}
                {kyc.status === 'PENDING' && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => handleVerify(kyc.id, false)} disabled={isProc}
                      className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-1">
                      <XCircle size={14} /> Từ chối
                    </button>
                    <button onClick={() => handleVerify(kyc.id, true)} disabled={isProc}
                      className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20">
                      {isProc ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />} Duyệt
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Inspections Tab ─────────────────────────────────────────────────────────

function InspectionsTab({
  inspections, users, loading, onRefresh
}: {
  inspections: InspectionTask[]; users: AdminUser[]; loading: boolean; onRefresh: () => void
}) {
  const [filter, setFilter] = useState('ALL')
  const [assignModal, setAssignModal] = useState<InspectionTask | null>(null)
  const [selectedInspector, setSelectedInspector] = useState('')
  const [assigning, setAssigning] = useState(false)

  const inspectors = users.filter(u => getPrimaryRole(u) === 'INSPECTOR')
  const all = filter === 'ALL' ? inspections : inspections.filter(i => i.status === filter)

  const handleAssign = async () => {
    if (!assignModal || !selectedInspector) return
    setAssigning(true)
    const ok = await inspectionService.assignInspector({ inspectionId: assignModal.inspectionId, inspectorId: selectedInspector })
    if (ok) {
      alert('Gán inspector thành công!')
      onRefresh()
      setAssignModal(null)
    } else {
      alert('Gán thất bại, vui lòng thử lại.')
    }
    setAssigning(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {['ALL', 'PENDING_ASSIGNED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].map(f => {
          const st = INSPECTION_STATUS_MAP[f]
          return (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${filter === f ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400'}`}>
              {f === 'ALL' ? 'Tất cả' : st?.label ?? f}
            </button>
          )
        })}
        <button onClick={onRefresh} className="ml-auto p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 transition">
          <RefreshCw size={15} />
        </button>
      </div>

      {loading ? <Spinner /> : all.length === 0 ? <EmptyState message="Không có đơn kiểm định nào." /> : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="px-5 py-3.5">Loại</th>
                  <th className="px-5 py-3.5">Lịch hẹn</th>
                  <th className="px-5 py-3.5">Trạng thái</th>
                  <th className="px-5 py-3.5">Inspector</th>
                  <th className="px-5 py-3.5">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {all.map(ins => {
                  const st = INSPECTION_STATUS_MAP[ins.status] ?? { label: ins.status, color: 'bg-slate-100 text-slate-600' }
                  return (
                    <tr key={ins.inspectionId} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                          {ins.inspectionType === 'COMPANY' ? '🏢 Tại Công Ty' : '📍 Tại Chỗ'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">
                        {ins.scheduledAt ? new Date(ins.scheduledAt).toLocaleString('vi-VN') : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${st.color}`}>{st.label}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">
                        {ins.inspector?.name || <span className="text-slate-300 italic">Chưa gán</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        {ins.status === 'PENDING_ASSIGNED' && (
                          <button onClick={() => { setAssignModal(ins); setSelectedInspector('') }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition shadow-sm">
                            <UserCheck size={13} /> Gán Inspector
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {assignModal && (
        <Modal title="Gán Inspector" onClose={() => setAssignModal(null)}>
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl text-sm text-slate-600 space-y-1">
              <p><span className="font-bold">Loại:</span> {assignModal.inspectionType === 'COMPANY' ? 'Tại Công Ty' : 'Tại Chỗ'}</p>
              {assignModal.scheduledAt && <p><span className="font-bold">Lịch hẹn:</span> {new Date(assignModal.scheduledAt).toLocaleString('vi-VN')}</p>}
            </div>
            <FormField label="Chọn Inspector">
              <select value={selectedInspector} onChange={e => setSelectedInspector(e.target.value)} className={inputCls}>
                <option value="">-- Chọn inspector --</option>
                {inspectors.map(i => (
                  <option key={i.id} value={i.id}>{i.name || i.username}</option>
                ))}
              </select>
            </FormField>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setAssignModal(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-wider transition">
                Hủy
              </button>
              <button onClick={handleAssign} disabled={!selectedInspector || assigning}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-md disabled:opacity-50">
                {assigning ? 'Đang gán...' : 'Xác Nhận Gán'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── Catalog Tab (Brands + Components) ───────────────────────────────────────

function CatalogTab() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [components, setComponents] = useState<InspectionComponent[]>([])
  const [loading, setLoading] = useState(true)

  // Brand form
  const [brandModal, setBrandModal] = useState(false)
  const [editBrand, setEditBrand] = useState<Brand | null>(null)
  const [brandName, setBrandName] = useState('')
  const [brandSaving, setBrandSaving] = useState(false)

  // Component form
  const [compModal, setCompModal] = useState(false)
  const [editComp, setEditComp] = useState<InspectionComponent | null>(null)
  const [compName, setCompName] = useState('')
  const [compSaving, setCompSaving] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    const [b, c] = await Promise.all([brandService.getAllBrands(), componentService.getAllComponents()])
    setBrands(b); setComponents(c); setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const openBrand = (b?: Brand) => { setEditBrand(b ?? null); setBrandName(b?.name ?? ''); setBrandModal(true) }
  const openComp = (c?: InspectionComponent) => { setEditComp(c ?? null); setCompName(c?.name ?? ''); setCompModal(true) }

  const saveBrand = async (e: React.FormEvent) => {
    e.preventDefault(); setBrandSaving(true)
    try {
      if (editBrand) {
        await brandService.updateBrands([{ id: editBrand.id, name: brandName }])
        alert('Cập nhật thành công!')
      } else {
        await brandService.createBrand(brandName)
        alert('Thêm thương hiệu thành công!')
      }
      setBrandModal(false); fetch()
    } catch { alert('Có lỗi xảy ra.') }
    finally { setBrandSaving(false) }
  }

  const deleteBrand = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa thương hiệu này?')) return
    const ok = await brandService.deleteBrand(id)
    if (ok) {
      alert('Đã xóa!')
      fetch()
    } else {
      alert('Xóa thất bại!')
    }
  }

  const saveComp = async (e: React.FormEvent) => {
    e.preventDefault(); setCompSaving(true)
    try {
      if (editComp) {
        await componentService.updateComponent(editComp.id, { name: compName })
        alert('Cập nhật thành công!')
      } else {
        await componentService.createComponent({ name: compName })
        alert('Thêm hạng mục thành công!')
      }
      setCompModal(false); fetch()
    } catch { alert('Có lỗi xảy ra.') }
    finally { setCompSaving(false) }
  }

  const deleteComp = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa hạng mục này?')) return
    const ok = await componentService.deleteComponent(id)
    if (ok) {
      alert('Đã xóa!')
      fetch()
    } else {
      alert('Xóa thất bại!')
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Brands Panel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bike size={18} className="text-amber-500" />
            <h3 className="font-bold text-slate-800">Thương Hiệu <span className="text-slate-400 font-normal text-sm">({brands.length})</span></h3>
          </div>
          <button onClick={() => openBrand()}
            className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition shadow-sm">
            <Plus size={13} /> Thêm
          </button>
        </div>
        {brands.length === 0 ? <EmptyState message="Chưa có thương hiệu nào." /> : (
          <ul className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
            {brands.map(b => (
              <li key={b.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/60 transition group">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Bike size={14} className="text-amber-500" />
                  </span>
                  <span className="text-sm font-semibold text-slate-700">{b.name}</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => openBrand(b)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition"><Edit size={14} /></button>
                  <button onClick={() => deleteBrand(b.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition"><Trash2 size={14} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Components Panel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Wrench size={18} className="text-indigo-500" />
            <h3 className="font-bold text-slate-800">Hạng Mục KĐ <span className="text-slate-400 font-normal text-sm">({components.length})</span></h3>
          </div>
          <button onClick={() => openComp()}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition shadow-sm">
            <Plus size={13} /> Thêm
          </button>
        </div>
        {components.length === 0 ? <EmptyState message="Chưa có hạng mục nào." /> : (
          <ul className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
            {components.map(c => (
              <li key={c.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/60 transition group">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Wrench size={14} className="text-indigo-500" />
                  </span>
                  <span className="text-sm font-semibold text-slate-700">{c.name}</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => openComp(c)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition"><Edit size={14} /></button>
                  <button onClick={() => deleteComp(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition"><Trash2 size={14} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Brand Modal */}
      {brandModal && (
        <Modal title={editBrand ? 'Sửa Thương Hiệu' : 'Thêm Thương Hiệu'} onClose={() => setBrandModal(false)}>
          <form onSubmit={saveBrand} className="space-y-4">
            <FormField label="Tên thương hiệu">
              <input required value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="VD: Trek, Giant..." className={inputCls} />
            </FormField>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setBrandModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-wider transition">Hủy</button>
              <button type="submit" disabled={brandSaving}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-md disabled:opacity-50">
                {brandSaving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Component Modal */}
      {compModal && (
        <Modal title={editComp ? 'Sửa Hạng Mục' : 'Thêm Hạng Mục'} onClose={() => setCompModal(false)}>
          <form onSubmit={saveComp} className="space-y-4">
            <FormField label="Tên hạng mục">
              <input required value={compName} onChange={e => setCompName(e.target.value)} placeholder="VD: Khung xe, Bộ truyền động..." className={inputCls} />
            </FormField>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setCompModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-wider transition">Hủy</button>
              <button type="submit" disabled={compSaving}
                className="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-md disabled:opacity-50">
                {compSaving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

// ─── Locations Tab ────────────────────────────────────────────────────────────

function LocationsTab({ locations, loading, onRefresh }: { locations: InspectionLocation[]; loading: boolean; onRefresh: () => void }) {
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ contactName: '', contactPhone: '', addressLine: '' })
  const [saving, setSaving] = useState(false)

  const open = (loc?: InspectionLocation) => {
    setEditId(loc ? String(loc.id) : null)
    setForm({ contactName: loc?.contactName ?? '', contactPhone: loc?.contactPhone ?? '', addressLine: loc?.addressLine ?? '' })
    setModal(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editId) {
        await locationService.updateLocation(Number(editId), form)
        alert('Cập nhật thành công!')
      } else {
        await locationService.createLocation(form)
        alert('Tạo mới thành công!')
      }
      setModal(false); onRefresh()
    } catch (error: unknown) {
      // unknown may not have message property
      const msg = (error && typeof error === 'object' && 'message' in error)
        ? (error as any).message
        : undefined
      alert(msg || 'Có lỗi xảy ra.')
    } finally { setSaving(false) }
  }

  const remove = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa địa điểm này?')) return
    const ok = await locationService.deleteLocation(id)
    if (ok) {
      alert('Đã xóa!')
      onRefresh()
    } else {
      alert('Xóa thất bại!')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-slate-800">Cơ Sở Kiểm Định <span className="text-slate-400 font-normal text-sm">({locations.length})</span></h2>
        <button onClick={() => open()}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-md">
          <Plus size={15} /> Thêm Cơ Sở
        </button>
      </div>

      {loading ? <Spinner /> : locations.length === 0 ? <EmptyState message="Chưa có cơ sở kiểm định nào." /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {locations.map(loc => (
            <div key={loc.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition group relative">
              <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => open(loc)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition"><Edit size={14} /></button>
                <button onClick={() => remove(loc.id)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 transition"><Trash2 size={14} /></button>
              </div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`p-2 rounded-xl ${loc.type === 'COMPANY' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                  <MapPin size={16} className={loc.type === 'COMPANY' ? 'text-emerald-600' : 'text-amber-600'} />
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${loc.type === 'COMPANY' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {loc.type === 'COMPANY' ? 'Công ty' : 'Cá nhân'}
                </span>
              </div>
              <div className="space-y-1.5 pr-10">
                <p className="text-sm font-bold text-slate-800">{loc.contactName || 'Chưa đặt tên'}</p>
                <p className="text-xs text-slate-500">📞 {loc.contactPhone || 'Không có SĐT'}</p>
                <p className="text-xs text-slate-500 line-clamp-2">📍 {loc.addressLine || 'Chưa có địa chỉ'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={editId ? 'Cập Nhật Cơ Sở' : 'Thêm Cơ Sở Mới'} onClose={() => setModal(false)}>
          <form onSubmit={save} className="space-y-4">
            <FormField label="Tên liên hệ">
              <input required value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })}
                placeholder="VD: Trung Tâm Kiểm Định A" className={inputCls} />
            </FormField>
            <FormField label="Số điện thoại">
              <input required type="tel" value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                placeholder="VD: 0987654321" className={inputCls} />
            </FormField>
            <FormField label="Địa chỉ chi tiết">
              <textarea required value={form.addressLine} onChange={e => setForm({ ...form, addressLine: e.target.value })}
                placeholder="VD: 123 Đường Nguyễn Huệ, Q1, TP.HCM" rows={3}
                className={`${inputCls} resize-none`} />
            </FormField>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-wider transition">Hủy</button>
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-md disabled:opacity-50">
                {saving ? 'Đang lưu...' : 'Lưu Cơ Sở'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

// ─── Listings Moderation Tab ──────────────────────────────────────────────────

function ListingsTab({ listings, loading, onRefresh }: { listings: Listing[]; loading: boolean; onRefresh: () => void }) {
  type ListFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'LIVE' | 'DRAFT'
  const [filter, setFilter] = useState<ListFilter>('ALL')
  const [processing, setProcessing] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = listings.filter(l => {
    const matchStatus = filter === 'ALL' || l.status === filter
    // defensive: title may be undefined/null if backend returns malformed data
    const title = l.title || ''
    const matchSearch = !search ||
      title.toLowerCase().includes(search.toLowerCase()) ||
      (l.brand?.name ?? '').toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const pendingCount = listings.filter(l => l.status === 'PENDING').length

  const handleApprove = async (id: string) => {
    setProcessing(id)
    const ok = await listingService.approveListing(id)
    if (ok) { alert('Đã duyệt bài đăng!'); onRefresh() }
    else alert('Thao tác thất bại, vui lòng thử lại.')
    setProcessing(null)
  }

  const handleReject = async (id: string) => {
    setProcessing(id)
    const ok = await listingService.rejectListing(id)
    if (ok) { alert('Đã từ chối bài đăng!'); onRefresh() }
    else alert('Thao tác thất bại, vui lòng thử lại.')
    setProcessing(null)
  }

  const filterTabs: { key: ListFilter; label: string }[] = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'PENDING', label: 'Chờ duyệt' },
    { key: 'APPROVED', label: 'Đã duyệt' },
    { key: 'LIVE', label: 'Đang bán' },
    { key: 'REJECTED', label: 'Từ chối' },
    { key: 'DRAFT', label: 'Nháp' },
  ]

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {filterTabs.map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${filter === key ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400'
              }`}>
            {label}
            {key === 'PENDING' && pendingCount > 0 && (
              <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </button>
        ))}
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm tiêu đề / thương hiệu..."
          className="ml-auto px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 w-52" />
        <button onClick={onRefresh} className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 transition">
          <RefreshCw size={15} />
        </button>
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? <EmptyState message="Không có bài đăng nào." /> : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="px-5 py-3.5">Ảnh</th>
                  <th className="px-5 py-3.5">Tiêu đề</th>
                  <th className="px-5 py-3.5">Thương hiệu</th>
                  <th className="px-5 py-3.5">Giá</th>
                  <th className="px-5 py-3.5">Trạng thái</th>
                  <th className="px-5 py-3.5">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((listing, i) => {
                  const st = LISTING_STATUS_MAP[listing.status] ?? { label: listing.status, color: 'bg-slate-100 text-slate-600' }
                  const isProc = processing === listing.id
                  const thumb = listing.images?.[0]?.secureUrl
                  return (
                    <tr key={listing.id || String(i)} className="hover:bg-slate-50/60 transition">
                      {/* Thumbnail */}
                      <td className="px-5 py-3">
                        {thumb
                          ? <img src={thumb} alt="thumb" className="w-14 h-10 object-cover rounded-xl border border-slate-100" />
                          : <div className="w-14 h-10 rounded-xl bg-slate-100 flex items-center justify-center"><Image size={16} className="text-slate-300" /></div>
                        }
                      </td>
                      {/* Title */}
                      <td className="px-5 py-3 max-w-[220px]">
                        <p className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug">{listing.title || '—'}</p>
                        {listing.frameNumber && <p className="text-[10px] text-slate-400 mt-0.5">Frame: {listing.frameNumber}</p>}
                      </td>
                      {/* Brand */}
                      <td className="px-5 py-3">
                        <span className="text-sm text-slate-600 font-medium">{listing.brand?.name ?? '—'}</span>
                      </td>
                      {/* Price */}
                      <td className="px-5 py-3">
                        <span className="text-sm font-bold text-slate-800">
                          {listing.price != null ? listing.price.toLocaleString('vi-VN') + ' ₫' : '—'}
                        </span>
                      </td>
                      {/* Status badge */}
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${st.color}`}>{st.label}</span>
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-3">
                        {listing.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleReject(listing.id)} disabled={isProc}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition disabled:opacity-50">
                              <XCircle size={13} /> Từ chối
                            </button>
                            <button onClick={() => handleApprove(listing.id)} disabled={isProc}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition disabled:opacity-50 shadow-sm">
                              {isProc ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle size={13} />} Duyệt
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error('Logout failed', err)
    }
    navigate('/')
  }

  const [users, setUsers] = useState<AdminUser[]>([])
  const [kycList, setKycList] = useState<KYCRequest[]>([])
  const [inspections, setInspections] = useState<InspectionTask[]>([])
  const [locations, setLocations] = useState<InspectionLocation[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [components, setComponents] = useState<InspectionComponent[]>([])
  const [listings, setListings] = useState<Listing[]>([])

  const [usersLoading, setUsersLoading] = useState(true)
  const [kycLoading, setKycLoading] = useState(true)
  const [inspLoading, setInspLoading] = useState(true)
  const [locLoading, setLocLoading] = useState(true)
  const [listingsLoading, setListingsLoading] = useState(true)
  // catalogLoading was unused; each tab manages its own loading state

  const overviewLoading = usersLoading || kycLoading || inspLoading || locLoading

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
      const data = await adminService.getAllUsers()
      setUsers(data)
    } catch (err) {
      console.error('[Admin] fetchUsers failed', err)
    } finally {
      setUsersLoading(false)
    }
  }, [])

  const fetchKYC = useCallback(async () => {
    setKycLoading(true)
    try {
      const data = await adminService.getAllKYCRequests()
      setKycList(data)
    } catch (err) {
      console.error('[Admin] fetchKYC failed', err)
    } finally {
      setKycLoading(false)
    }
  }, [])

  const fetchInspections = useCallback(async () => {
    setInspLoading(true)
    try {
      const data = await inspectionService.getAllInspections()
      setInspections(data)
    } catch (err) {
      console.error('[Admin] fetchInspections failed', err)
    } finally {
      setInspLoading(false)
    }
  }, [])

  const fetchLocations = useCallback(async () => {
    setLocLoading(true)
    try {
      const data = await locationService.getAllLocations()
      setLocations(data)
    } catch (err) {
      console.error('[Admin] fetchLocations failed', err)
    } finally {
      setLocLoading(false)
    }
  }, [])

  const fetchOverviewCatalog = useCallback(async () => {
    try {
      const [b, c] = await Promise.all([brandService.getAllBrands(), componentService.getAllComponents()])
      setBrands(Array.isArray(b) ? b : [])
      setComponents(Array.isArray(c) ? c : [])
    } catch (err) {
      console.error('[Admin] fetchOverviewCatalog failed', err)
    }
  }, [])

  const fetchListings = useCallback(async () => {
    setListingsLoading(true)
    try {
      const data = await listingService.getAllListings()
      if (Array.isArray(data)) {
        setListings(data)
      } else {
        console.warn('[Admin] unexpected listings response', data)
        setListings([])
      }
    } catch (err) {
      console.error('[Admin] fetchListings failed', err)
      setListings([])
    } finally {
      setListingsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
    fetchKYC()
    fetchInspections()
    fetchLocations()
    fetchOverviewCatalog()
    fetchListings()
  }, [fetchUsers, fetchKYC, fetchInspections, fetchLocations, fetchOverviewCatalog, fetchListings])

  const pendingKYC = kycList.filter(k => k.status === 'PENDING').length
  const pendingInsp = inspections.filter(i => i.status === 'PENDING_ASSIGNED').length
  const pendingListings = Array.isArray(listings) ? listings.filter(l => l.status === 'PENDING').length : 0

  const navItems: { tab: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { tab: 'overview', label: 'Tổng Quan', icon: LayoutDashboard },
    { tab: 'users', label: 'Người Dùng', icon: Users },
    { tab: 'kyc', label: 'Xác Minh KYC', icon: FileCheck, badge: pendingKYC },
    { tab: 'listings', label: 'Duyệt Bài Đăng', icon: Tag, badge: pendingListings },
    { tab: 'inspections', label: 'Kiểm Định', icon: ClipboardList, badge: pendingInsp },
    { tab: 'catalog', label: 'Thương Hiệu & Hạng Mục', icon: Wrench },
    { tab: 'locations', label: 'Cơ Sở Kiểm Định', icon: MapPin },
  ]

  return (
    <DashboardErrorBoundary>
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 py-6">

        {/* Page header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bảng Điều Khiển Quản Trị</h1>
            <p className="text-slate-500 text-sm mt-0.5">BikeHub Admin Panel — Quản lý toàn bộ hoạt động hệ thống</p>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition">
            Đăng xuất
          </button>
        </div>

        <div className="flex gap-6 items-start">

          {/* ── Sidebar ── */}
          <nav className="w-56 shrink-0 sticky top-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {navItems.map(item => {
                const Icon = item.icon
                const isActive = activeTab === item.tab
                return (
                  <button key={item.tab} onClick={() => setActiveTab(item.tab)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition group ${isActive ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <span className="flex items-center gap-2.5">
                      <Icon size={17} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
                      {item.label}
                    </span>
                    <span className="flex items-center gap-1.5">
                      {item.badge != null && item.badge > 0 && (
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/30 text-white' : 'bg-red-500 text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight size={14} className="text-white/70" />}
                    </span>
                  </button>
                )
              })}
            </div>
          </nav>

          {/* ── Content ── */}
          <div className="flex-1 min-w-0">
            {activeTab === 'overview' && (
              <OverviewTab
                users={users} kyc={kycList} inspections={inspections}
                brands={brands} components={components} locations={locations}
                loading={overviewLoading}
              />
            )}
            {activeTab === 'users' && <UsersTab users={users} loading={usersLoading} />}
            {activeTab === 'kyc' && <KycTab kycList={kycList} loading={kycLoading} onRefresh={fetchKYC} />}
            {activeTab === 'listings' && (
              <ListingsTab listings={listings} loading={listingsLoading} onRefresh={fetchListings} />
            )}
            {activeTab === 'inspections' && (
              <InspectionsTab inspections={inspections} users={users} loading={inspLoading} onRefresh={fetchInspections} />
            )}
            {activeTab === 'catalog' && <CatalogTab />}
            {activeTab === 'locations' && (
              <LocationsTab locations={locations} loading={locLoading} onRefresh={fetchLocations} />
            )}
          </div>
        </div>
      </div>
    </div>
    </DashboardErrorBoundary>
  )
}
