import { useState, useEffect } from 'react';
import OrderTracking from '../components/buyer/Orders/OrderTracking';
import type { Order as TrackingOrder } from '../components/buyer/Orders/OrderTracking';
import { orderService } from '../services/order.service';
import { listingService } from '../services/listing.service';

export default function OrderTrackingPage() {
  const [orders, setOrders] = useState<TrackingOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const myOrders = await orderService.getMyOrders();

      // Enrich orders with product details for the tracking UI
      const enrichedOrders = await Promise.all(myOrders.map(async (order) => {
        let bikeTitle = `Order #${order.id.slice(0, 8).toUpperCase()}`;
        let bikeImage = '';

        if (order.listingId) {
          try {
            const listing = await listingService.getListingById(order.listingId);
            if (listing) {
              bikeTitle = listing.title;
              bikeImage = listing.images?.[0]?.secureUrl || '';
            }
          } catch (err) {
            console.error('Failed to enrich order:', order.id, err);
          }
        }

        return {
          id: order.id,
          items: [
            {
              productName: bikeTitle,
              price: order.totalPrice,
              quantity: 1,
              image: bikeImage
            }
          ],
          status: order.status.toLowerCase() as any,
          totalAmount: order.totalPrice,
          deliveryAddress: order.buyer?.address?.addressLine || 'Giao hàng tận nơi',
          createdAt: new Date(order.createdAt).toLocaleDateString('vi-VN'),
          estimatedDelivery: 'Đang cập nhật'
        };
      }));

      setOrders(enrichedOrders);
    } catch (error) {
      console.error('Error fetching orders for tracking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleConfirmReceipt = async (orderId: string) => {
    try {
      await orderService.claimOrder(orderId);
      alert('Đã xác nhận nhận hàng thành công!');
      fetchOrders();
    } catch (err) {
      alert('Có lỗi xảy ra khi xác nhận.');
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
