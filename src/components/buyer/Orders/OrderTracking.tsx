import React, { useState } from 'react';
import { Package, Truck, CheckCircle, XCircle, Clock, MapPin, ChevronRight, ChevronDown } from 'lucide-react';

export type OrderStatus = 'processing' | 'shipping' | 'pending_confirmation' | 'completed' | 'cancelled' | 'refunded';

export interface Order {
  id: string;
  items: Array<{
    productName: string;
    price: number;
    quantity: number;
  }>;
  status: OrderStatus;
  totalAmount: number;
  deliveryAddress: string;
  createdAt: string;
  estimatedDelivery: string;
}

interface OrderTrackingProps {
  orders: Order[];
  onConfirmReceipt?: (orderId: string) => void;
  onRequestReturn?: (orderId: string) => void;
  onLeaveReview?: (orderId: string) => void;
}

const STATUS_MAP: Record<OrderStatus, { icon: any; label: string; colorClass: string; bgClass: string }> = {
  processing: { icon: Clock, label: 'Đang xử lý', colorClass: 'text-amber-600', bgClass: 'bg-amber-50' },
  shipping: { icon: Truck, label: 'Đang giao hàng', colorClass: 'text-blue-600', bgClass: 'bg-blue-50' },
  pending_confirmation: { icon: MapPin, label: 'Chờ xác nhận', colorClass: 'text-green-600', bgClass: 'bg-green-50' },
  completed: { icon: CheckCircle, label: 'Đã hoàn thành', colorClass: 'text-green-700', bgClass: 'bg-green-100' },
  cancelled: { icon: XCircle, label: 'Đã hủy', colorClass: 'text-red-600', bgClass: 'bg-red-50' },
  refunded: { icon: XCircle, label: 'Đã hoàn tiền', colorClass: 'text-purple-600', bgClass: 'bg-purple-50' },
};

export const OrderTracking: React.FC<OrderTrackingProps> = ({
  orders,
  onConfirmReceipt,
  onRequestReturn,
  onLeaveReview
}) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-3xl p-4 md:p-8 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-green-600 flex items-center gap-3">
          <Package size={28} /> Lịch sử đơn hàng
        </h2>
        <span className="text-sm text-gray-400 font-medium">{orders.length} đơn hàng</span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-green-50/50 border-2 border-dashed border-green-100 rounded-3xl">
          <Package size={64} className="mx-auto mb-4 text-green-200" />
          <p className="text-gray-500 text-lg font-medium mb-6">Bạn chưa có đơn hàng nào</p>
          <button className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100">
            Mua sắm ngay
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = STATUS_MAP[order.status];
            const isExpanded = expandedOrderId === order.id;

            return (
              <div 
                key={order.id}
                className={`group border-2 rounded-2xl overflow-hidden transition-all duration-300 ${
                  isExpanded ? 'border-green-500 shadow-xl ring-4 ring-green-50' : 'border-gray-50 hover:border-green-200'
                }`}
              >
                {/* Header đơn hàng */}
                <div 
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="flex flex-wrap items-center justify-between p-5 bg-white cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${status.bgClass} ${status.colorClass}`}>
                      <status.icon size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Mã đơn: #{order.id.slice(0, 8).toUpperCase()}</h3>
                      <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden sm:block text-right">
                      <p className={`text-sm font-bold ${status.colorClass}`}>{status.label}</p>
                      <p className="text-lg font-black text-green-600">{(order.totalAmount / 1000000).toFixed(1)}M VND</p>
                    </div>
                    {isExpanded ? <ChevronDown className="text-green-600" /> : <ChevronRight className="text-gray-300 group-hover:text-green-600" />}
                  </div>
                </div>

                {/* Chi tiết đơn hàng khi mở rộng */}
                {isExpanded && (
                  <div className="p-6 bg-gray-50/50 border-t border-gray-100 space-y-8 animate-in slide-in-from-top-2 duration-300">
                    
                    {/* Timeline Trạng Thái */}
                    <div className="relative flex justify-between">
                      <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 -z-0 rounded-full"></div>
                      {[
                        { s: 'processing', label: 'Xử lý', icon: Clock },
                        { s: 'shipping', label: 'Đang giao', icon: Truck },
                        { s: 'pending_confirmation', label: 'Xác nhận', icon: MapPin },
                        { s: 'completed', label: 'Hoàn tất', icon: CheckCircle },
                      ].map((step, idx, arr) => {
                        const orderStepIdx = ['processing', 'shipping', 'pending_confirmation', 'completed'].indexOf(order.status);
                        const isDone = orderStepIdx >= idx || order.status === 'completed';
                        const isCurrent = order.status === step.s;

                        return (
                          <div key={step.s} className="relative z-10 flex flex-col items-center gap-2 group/step">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                              isDone ? 'bg-green-600 border-green-100 text-white' : 'bg-white border-gray-100 text-gray-300'
                            } ${isCurrent ? 'ring-4 ring-green-500/20 scale-110' : ''}`}>
                              <step.icon size={18} />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDone ? 'text-green-600' : 'text-gray-400'}`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Danh sách sản phẩm */}
                      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Sản phẩm</h4>
                        <div className="divide-y divide-gray-50">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="py-3 flex justify-between items-center">
                              <div>
                                <p className="font-bold text-gray-800 text-sm">{item.productName}</p>
                                <p className="text-xs text-gray-400">Số lượng: {item.quantity}</p>
                              </div>
                              <span className="font-bold text-green-600">{((item.price * item.quantity) / 1000000).toFixed(1)}M</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Địa chỉ giao hàng */}
                      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Địa chỉ nhận hàng</h4>
                        <div className="flex gap-3 text-gray-600">
                          <MapPin size={20} className="text-green-600 shrink-0" />
                          <p className="text-sm leading-relaxed">{order.deliveryAddress}</p>
                        </div>
                        <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-end">
                          <span className="text-xs text-gray-400">Giao dự kiến: {new Date(order.estimatedDelivery).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Nút hành động */}
                    <div className="flex flex-wrap gap-3 pt-2">
                      {order.status === 'shipping' && (
                        <>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onConfirmReceipt?.(order.id); }}
                            className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 shadow-lg shadow-green-200 transition-all"
                          >
                            Đã nhận được hàng
                          </button>
                          <button className="flex-1 bg-white text-red-500 border-2 border-red-500 py-3 rounded-xl font-bold text-sm hover:bg-red-50 transition-all">
                            Chưa nhận được hàng
                          </button>
                        </>
                      )}

                      {order.status === 'pending_confirmation' && (
                        <>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onConfirmReceipt?.(order.id); }}
                            className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 shadow-lg shadow-green-200 transition-all"
                          >
                            Xác nhận hàng đúng mô tả
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onRequestReturn?.(order.id); }}
                            className="flex-1 bg-white text-red-500 border-2 border-red-500 py-3 rounded-xl font-bold text-sm hover:bg-red-50 transition-all"
                          >
                            Yêu cầu trả hàng
                          </button>
                        </>
                      )}

                      {order.status === 'completed' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onLeaveReview?.(order.id); }}
                          className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 shadow-lg shadow-green-200 transition-all"
                        >
                          Viết đánh giá
                        </button>
                      )}

                      {order.status === 'cancelled' && <div className="w-full p-4 bg-red-50 text-red-600 rounded-xl text-center text-sm font-bold">Đơn hàng đã bị hủy</div>}
                      {order.status === 'refunded' && <div className="w-full p-4 bg-purple-50 text-purple-600 rounded-xl text-center text-sm font-bold">Đã hoàn tiền thành công</div>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderTracking;