import React, { useState } from 'react';
import { Package, Truck, CheckCircle, XCircle, Clock, MapPin } from 'lucide-react';
import '../../../styles/OrderTracking.css';

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

export const OrderTracking: React.FC<OrderTrackingProps> = ({
  orders,
  onConfirmReceipt,
  onRequestReturn,
}) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusColor = (status: OrderStatus): string => {
    const statusMap: Record<OrderStatus, string> = {
      processing: '#ffa500',
      shipping: '#1db854',
      pending_confirmation: '#1db854',
      completed: '#0da845',
      cancelled: '#ff6b6b',
      refunded: '#ff6b6b',
    };
    return statusMap[status];
  };

  return (
    <div className="order-tracking">
      <h2>
        <Package size={24} /> Order History
      </h2>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <Package size={48} />
          <p>No orders yet</p>
          <a href="/marketplace" className="btn-primary">
            Start Shopping
          </a>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const statusInfo = STATUS_TIMELINE[order.status];
            const isExpanded = expandedOrderId === order.id;

            return (
              <div
                key={order.id}
                className={`order-card ${order.status}`}
              >
                {/* Order Header */}
                <div
                  className="order-header"
                  onClick={() => toggleExpand(order.id)}
                >
                  <div className="order-info">
                    <h3>Order #{order.id.slice(0, 8)}</h3>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="order-status" style={{ color: getStatusColor(order.status) }}>
                    {statusInfo.icon}
                    <span>{statusInfo.label}</span>
                  </div>

                  <div className="order-amount">
                    <p className="price">
                      {(order.totalAmount / 1000000).toFixed(1)}M VND
                    </p>
                    <button
                      className="btn-expand"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(order.id);
                      }}
                    >
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  </div>
                </div>

                {/* Order Details (Expanded) */}
                {isExpanded && (
                  <div className="order-details">
                    {/* Timeline */}
                    <div className="order-timeline">
                      <div className="timeline-step processing">
                        <div className="step-marker">
                          <Clock size={16} />
                        </div>
                        <div className="step-info">
                          <h4>Processing</h4>
                          <p>Order confirmed and being prepared</p>
                        </div>
                      </div>

                      <div className={`timeline-step ${['shipping', 'pending_confirmation', 'completed'].includes(order.status) ? 'active' : ''}`}>
                        <div className="step-marker">
                          <Truck size={16} />
                        </div>
                        <div className="step-info">
                          <h4>Shipping</h4>
                          <p>
                            Est. delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className={`timeline-step ${['pending_confirmation', 'completed'].includes(order.status) ? 'active' : ''}`}>
                        <div className="step-marker">
                          <MapPin size={16} />
                        </div>
                        <div className="step-info">
                          <h4>Awaiting Confirmation</h4>
                          <p>Confirm receipt within 7 days</p>
                        </div>
                      </div>

                      <div className={`timeline-step ${order.status === 'completed' ? 'active' : ''}`}>
                        <div className="step-marker">
                          <CheckCircle size={16} />
                        </div>
                        <div className="step-info">
                          <h4>Completed</h4>
                          <p>Order completed and money sent to seller</p>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="order-items">
                      <h4>Items in Order</h4>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-item">
                          <span className="item-name">{item.productName}</span>
                          <span className="item-qty">x{item.quantity}</span>
                          <span className="item-price">
                            {((item.price * item.quantity) / 1000000).toFixed(1)}M
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Address */}
                    <div className="delivery-address">
                      <h4>Delivery To</h4>
                      <p>{order.deliveryAddress}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="order-actions">
                      {order.status === 'shipping' && (
                        <>
                          <button
                            className="btn-action received"
                            onClick={() => onConfirmReceipt?.(order.id)}
                          >
                            Confirm Received
                          </button>
                          <button
                            className="btn-action not-received"
                            onClick={() => onConfirmReceipt?.(order.id)}
                          >
                            Not Received / Cancel
                          </button>
                        </>
                      )}

                      {order.status === 'pending_confirmation' && (
                        <>
                          <button
                            className="btn-action complete"
                            onClick={() => onConfirmReceipt?.(order.id)}
                          >
                            Confirm Order Correct
                          </button>
                          <button
                            className="btn-action request-return"
                            onClick={() => onRequestReturn?.(order.id)}
                          >
                            Request Return
                          </button>
                        </>
                      )}

                      {order.status === 'completed' && (
                        <button className="btn-action rate">
                          Leave Review
                        </button>
                      )}

                      {order.status === 'cancelled' && (
                        <p className="status-info">Order has been cancelled</p>
                      )}

                      {order.status === 'refunded' && (
                        <p className="status-info">Refund has been processed</p>
                      )}
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
