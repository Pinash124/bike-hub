import React, { useState } from 'react';
import { Package, Truck, CheckCircle, XCircle, Clock, MapPin } from 'lucide-react';

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
}

const STATUS_TIMELINE: Record<OrderStatus, { icon: React.ReactNode; label: string; color: string }> = {
  processing: { icon: <Clock size={20} />, label: 'Processing', color: '#ffa500' },
  shipping: { icon: <Truck size={20} />, label: 'Shipping', color: '#1db854' },
  pending_confirmation: { icon: <MapPin size={20} />, label: 'Awaiting Confirmation', color: '#1db854' },
  completed: { icon: <CheckCircle size={20} />, label: 'Completed', color: '#1db854' },
  cancelled: { icon: <XCircle size={20} />, label: 'Cancelled', color: '#ff6b6b' },
  refunded: { icon: <XCircle size={20} />, label: 'Refunded', color: '#ff6b6b' },
};

const getStatusColor = (status: OrderStatus): string => {
  const statusMap: Record<OrderStatus, string> = {
    processing: 'text-orange-500',
    shipping: 'text-green-600',
    pending_confirmation: 'text-green-600',
    completed: 'text-green-700',
    cancelled: 'text-red-500',
    refunded: 'text-red-500',
  };
  return statusMap[status];
};

const getStatusBgColor = (status: OrderStatus): string => {
  const statusMap: Record<OrderStatus, string> = {
    processing: '',
    shipping: '',
    pending_confirmation: '',
    completed: 'bg-green-50 border-green-200',
    cancelled: 'bg-red-50 border-red-200',
    refunded: 'bg-red-50 border-red-200',
  };
  return statusMap[status];
};

export const OrderTracking: React.FC<OrderTrackingProps> = ({
  orders,
  onConfirmReceipt,
  onRequestReturn,
}) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="bg-white rounded-lg p-8">
      <h2 className="text-3xl font-bold mb-8 text-green-600 flex items-center gap-3">
        <Package size={24} /> Order History
      </h2>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-green-50 border-2 border-dashed border-green-200 rounded-lg">
          <Package size={48} className="mx-auto mb-4 text-green-600 opacity-50" />
          <p className="text-gray-600 text-lg mb-4">No orders yet</p>
          <a href="/marketplace" className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg">Start Shopping</a>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => {
            const statusInfo = STATUS_TIMELINE[order.status];
            const isExpanded = expandedOrderId === order.id;
            const bgClass = getStatusBgColor(order.status);

            return (
              <div 
                key={order.id}
                onClick={() => toggleExpand(order.id)}
                className={`border-2 rounded-lg overflow-hidden transition-all cursor-pointer hover:border-green-200 hover:shadow-lg ${bgClass ? bgClass : 'border-gray-300 bg-white'}`}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-6 bg-white">
                  <div>
                    <h3 className="text-lg font-semibold text-green-600">Order #{order.id.slice(0, 8)}</h3>
                    <p className="text-gray-500 text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className={`flex items-center gap-2 font-semibold text-sm ${getStatusColor(order.status)}`}>
                    {statusInfo.icon}
                    <span>{statusInfo.label}</span>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4">
                    <p className="text-lg font-bold text-green-600">{(order.totalAmount / 1000000).toFixed(1)}M VND</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleExpand(order.id); }}
                      className="bg-transparent border-none text-green-600 cursor-pointer text-lg p-2 flex items-center justify-center w-8 h-8"
                    >
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-6 bg-gray-50 border-t border-gray-200 flex flex-col gap-6">
                    {/* Timeline */}
                    <div className="flex justify-between gap-0 relative">
                      {[
                        { status: 'processing', icon: <Clock size={16} />, label: 'Processing', desc: 'Order confirmed and being prepared' },
                        { status: 'shipping', icon: <Truck size={16} />, label: 'Shipping', desc: `Est. delivery: ${new Date(order.estimatedDelivery).toLocaleDateString()}` },
                        { status: 'pending_confirmation', icon: <MapPin size={16} />, label: 'Awaiting Confirmation', desc: 'Confirm receipt within 7 days' },
                        { status: 'completed', icon: <CheckCircle size={16} />, label: 'Completed', desc: 'Order completed and money sent to seller' },
                      ].map((step, idx) => {
                        const isActive = order.status === 'completed' || ['processing', 'shipping', 'pending_confirmation'].includes(order.status) && idx <= ['processing', 'shipping', 'pending_confirmation', 'completed'].indexOf(order.status);
                        return (
                          <div key={step.status} className="flex-1 flex gap-4 relative" style={{opacity: isActive ? 1 : 0.5}}>
                            {idx < 3 && <div className="absolute top-5 left-1/2 w-full h-0.5 bg-gray-300" style={{zIndex: 0}} />}
                            <div className="w-10 h-10 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-gray-500 flex-shrink-0 relative z-10">
                              {step.icon}
                            </div>
                            <div className="flex-1 pr-4">
                              <h4 className="text-gray-900 font-semibold text-sm m-0 mb-1">{step.label}</h4>
                              <p className="text-gray-500 text-xs m-0">{step.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Items */}
                    <div className="bg-white border border-gray-300 rounded-lg p-4">
                      <h4 className="text-green-600 font-semibold text-sm mb-4 m-0">Items in Order</h4>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-3 gap-4 items-center py-3 border-b border-gray-300 last:border-b-0">
                          <span className="text-gray-900 font-medium">{item.productName}</span>
                          <span className="text-center text-gray-500 text-sm">x{item.quantity}</span>
                          <span className="text-right text-green-600 font-semibold">{((item.price * item.quantity) / 1000000).toFixed(1)}M</span>
                        </div>
                      ))}
                    </div>

                    {/* Delivery */}
                    <div className="bg-white border border-gray-300 rounded-lg p-4">
                      <h4 className="text-green-600 font-semibold text-sm mb-2 m-0">Delivery To</h4>
                      <p className="text-gray-900 m-0 leading-relaxed">{order.deliveryAddress}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 flex-wrap">
                      {order.status === 'shipping' && (
                        <>
                          <button onClick={() => onConfirmReceipt?.(order.id)} className="flex-1 min-w-[150px] py-3 px-4 border-none rounded-lg font-semibold text-sm bg-green-600 text-white cursor-pointer hover:bg-green-700 transition">Confirm Received</button>
                          <button onClick={() => onConfirmReceipt?.(order.id)} className="flex-1 min-w-[150px] py-3 px-4 border-2 border-red-500 rounded-lg font-semibold text-sm text-red-500 bg-white cursor-pointer hover:bg-red-50 transition">Not Received / Cancel</button>
                        </>
                      )}

                      {order.status === 'pending_confirmation' && (
                        <>
                          <button onClick={() => onConfirmReceipt?.(order.id)} className="flex-1 min-w-[150px] py-3 px-4 border-none rounded-lg font-semibold text-sm bg-green-600 text-white cursor-pointer hover:bg-green-700 transition">Confirm Order Correct</button>
                          <button onClick={() => onRequestReturn?.(order.id)} className="flex-1 min-w-[150px] py-3 px-4 border-2 border-red-500 rounded-lg font-semibold text-sm text-red-500 bg-white cursor-pointer hover:bg-red-50 transition">Request Return</button>
                        </>
                      )}

                      {order.status === 'completed' && (
                        <button className="flex-1 min-w-[150px] py-3 px-4 border-none rounded-lg font-semibold text-sm bg-green-600 text-white cursor-pointer hover:bg-green-700 transition">Leave Review</button>
                      )}

                      {order.status === 'cancelled' && <p className="text-gray-500 italic m-0">Order has been cancelled</p>}
                      {order.status === 'refunded' && <p className="text-gray-500 italic m-0">Refund has been processed</p>}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
};

export default OrderTracking;
