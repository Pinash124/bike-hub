// src/pages/OrderTrackingPage.tsx
// Buyer: view their orders + order log history timeline + claim delivered orders
import { useState, useEffect } from 'react';
import { orderService, type Order } from '../services/order.service';
import { orderLogService, type OrderLog } from '../services/orderLog.service';
import { Package, ClipboardList, ChevronDown, ChevronUp, CheckCircle, Loader2 } from 'lucide-react';

const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  EXPIRED: 'Hết hạn',
  PAID: 'Đã thanh toán',
  REFUND: 'Hoàn tiền',
  IN_TRANSIT: 'Đang giao xe',
  DELIVERED: 'Đã giao xe',
  CONFIRMED: 'Đã xác nhận',
  COMPLETE: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
};

const ORDER_STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PAID: 'bg-blue-100 text-blue-700',
  IN_TRANSIT: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-indigo-100 text-indigo-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  COMPLETE: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-slate-100 text-slate-500',
  REFUND: 'bg-orange-100 text-orange-700',
};

const LOG_ICON: Record<string, string> = {
  PENDING: '⏳', PAID: '💳', IN_TRANSIT: '🚚', DELIVERED: '📦',
  CONFIRMED: '✅', COMPLETE: '🎉', CANCELLED: '❌', EXPIRED: '⌛', REFUND: '💸',
};

export default function OrderTrackingPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [orderLogs, setOrderLogs] = useState<Record<string, OrderLog[]>>({});
  const [logsLoading, setLogsLoading] = useState<Record<string, boolean>>({});
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const myOrders = await orderService.getMyOrders();
      setOrders(myOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const toggleOrderLogs = async (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }
    setExpandedOrderId(orderId);
    if (!orderLogs[orderId]) {
      setLogsLoading(prev => ({ ...prev, [orderId]: true }));
      const logs = await orderLogService.getByOrderId(orderId);
      setOrderLogs(prev => ({ ...prev, [orderId]: logs }));
      setLogsLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleConfirmReceipt = async (orderId: string) => {
    setClaimingId(orderId);
    try {
      await orderService.claimOrder(orderId);
      await fetchOrders();
    } catch {
      alert('Có lỗi xảy ra khi xác nhận.');
    } finally {
      setClaimingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center">
            <Package size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Đơn hàng của tôi</h1>
            <p className="text-slate-500 text-sm">Theo dõi trạng thái các đơn đặt cọc xe</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
            <Package size={64} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-600 mb-2">Chưa có đơn hàng nào</h3>
            <p className="text-slate-400 text-sm">Hãy tìm và đặt cọc xe bạn muốn mua!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const isExpanded = expandedOrderId === order.id;
              const logs = orderLogs[order.id] ?? [];
              const isLoadingLogs = logsLoading[order.id];
              const thumbnail = order.listing?.images?.[0]?.secureUrl;
              const currentStatus = order.orderStatus || order.status;
              const canClaim = currentStatus === 'DELIVERED';

              return (
                <div key={order.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Order Header */}
                  <div className="p-5">
                    <div className="flex gap-4">
                      {thumbnail ? (
                        <img src={thumbnail} alt="" className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
                      ) : (
                        <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">🚴</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-slate-800 line-clamp-1">{order.listing?.title || 'Xe đạp'}</p>
                            <p className="text-xs text-slate-400 mt-0.5">#{order.id.slice(0, 8).toUpperCase()}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${ORDER_STATUS_STYLE[currentStatus] ?? 'bg-slate-100 text-slate-600'}`}>
                            {ORDER_STATUS_LABEL[currentStatus] ?? currentStatus}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-lg font-black text-green-600">
                            {(order.totalPrice / 1_000_000).toFixed(1)}M ₫
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                      {canClaim && (
                        <button
                          onClick={() => handleConfirmReceipt(order.id)}
                          disabled={claimingId === order.id}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-50"
                        >
                          {claimingId === order.id
                            ? <><Loader2 size={14} className="animate-spin" /> Đang xác nhận...</>
                            : <><CheckCircle size={14} /> Đã nhận được xe</>}
                        </button>
                      )}
                      <button
                        onClick={() => toggleOrderLogs(order.id)}
                        className="ml-auto flex items-center gap-1 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-green-400 hover:text-green-700 transition-colors"
                      >
                        <ClipboardList size={14} />
                        Lịch sử
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Order Log Timeline */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                      {isLoadingLogs ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 size={20} className="animate-spin text-green-600" />
                        </div>
                      ) : logs.length === 0 ? (
                        <p className="text-center text-sm text-slate-400 py-4">Chưa có lịch sử trạng thái.</p>
                      ) : (
                        <div className="relative">
                          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
                          <div className="space-y-4">
                            {[...logs].reverse().map((log, idx) => (
                              <div key={log.id} className="flex gap-4 relative">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 flex-shrink-0 z-10 ${
                                  idx === 0 ? 'bg-green-100 border-green-400' : 'bg-white border-slate-300'
                                }`}>
                                  {LOG_ICON[log.status] ?? '•'}
                                </div>
                                <div className="flex-1 pb-2">
                                  <div className="flex items-center justify-between">
                                    <p className={`text-sm font-bold ${idx === 0 ? 'text-green-700' : 'text-slate-700'}`}>
                                      {orderLogService.getStatusLabel(log.status)}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                                    </p>
                                  </div>
                                  {log.image && (
                                    <img src={log.image} alt="Delivery proof" className="mt-2 rounded-lg max-h-32 object-cover border border-slate-200" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
