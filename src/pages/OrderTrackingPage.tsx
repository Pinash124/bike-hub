import { useState, useEffect } from 'react';
import OrderTracking from '../components/buyer/Orders/OrderTracking';
import type { Order as TrackingOrder } from '../components/buyer/Orders/OrderTracking';
import { orderService } from '../services/order.service';

const mapOrderStatus = (status?: string): TrackingOrder['status'] => {
  switch ((status || '').toUpperCase()) {
    case 'PENDING':
    case 'PAID':
      return 'processing';
    case 'IN_TRANSIT':
      return 'shipping';
    case 'DELIVERED':
      return 'pending_confirmation';
    case 'CONFIRMED':
    case 'COMPLETE':
      return 'completed';
    case 'REFUND':
      return 'refunded';
    case 'EXPIRED':
    case 'CANCELLED':
    default:
      return 'cancelled';
  }
};

export default function OrderTrackingPage() {
  const [orders, setOrders] = useState<TrackingOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const myOrders = await orderService.getMyOrders();

        const enrichedOrders: TrackingOrder[] = myOrders.map((order) => {
          const listing = order.listing;
          const bikeTitle = listing?.title || `Order #${order.id.slice(0, 8).toUpperCase()}`;
          const bikeImage = listing?.images?.[0]?.secureUrl || '';
          const total = typeof order.totalPrice === 'number' ? order.totalPrice : (listing?.price || 0);

          return {
            id: order.id,
            items: [
              {
                productName: bikeTitle,
                price: total,
                quantity: 1,
                image: bikeImage,
              },
            ],
            status: mapOrderStatus(order.orderStatus || order.status),
            totalAmount: total,
            deliveryAddress: 'Giao hàng tận nơi',
            createdAt: new Date(order.createdAt).toISOString(),
            estimatedDelivery: order.expiresAt || order.createdAt,
          };
        });

        setOrders(enrichedOrders);
      } catch (error) {
        console.error('Error fetching orders for tracking:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleConfirmReceipt = async (orderId: string) => {
    try {
      await orderService.claimOrder(orderId);
      const myOrders = await orderService.getMyOrders();
      const refreshed: TrackingOrder[] = myOrders.map((order) => {
        const listing = order.listing;
        const total = typeof order.totalPrice === 'number' ? order.totalPrice : (listing?.price || 0);
        return {
          id: order.id,
          items: [{
            productName: listing?.title || `Order #${order.id.slice(0, 8).toUpperCase()}`,
            price: total,
            quantity: 1,
            image: listing?.images?.[0]?.secureUrl || '',
          }],
          status: mapOrderStatus(order.orderStatus || order.status),
          totalAmount: total,
          deliveryAddress: 'Giao hàng tận nơi',
          createdAt: new Date(order.createdAt).toISOString(),
          estimatedDelivery: order.expiresAt || order.createdAt,
        };
      });
      setOrders(refreshed);
      alert('Đã xác nhận nhận hàng thành công!');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Xác nhận nhận hàng thất bại.';
      alert(message);
    }
  };

  const handleRequestReturn = (orderId: string) => {
    console.log('Requesting return for order:', orderId);
    alert('Yêu cầu trả hàng đã được gửi. Quản trị viên sẽ xem xét.');
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-slate-400 font-bold animate-pulse">ĐANG TẢI ĐƠN HÀNG...</div>
      </div>
    );
  }

  return (
    <OrderTracking
      orders={orders}
      onConfirmReceipt={handleConfirmReceipt}
      onRequestReturn={handleRequestReturn}
    />
  );
}
