import OrderTracking from '../components/buyer/Orders/OrderTracking';
import type { Order } from '../components/buyer/Orders/OrderTracking';

// Mock orders for demo
const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-20240120-001',
    items: [
      {
        productName: 'Trek FX 3 Hybrid Bike',
        price: 1500000,
        quantity: 1
      }
    ],
    status: 'shipping',
    totalAmount: 1530000,
    deliveryAddress: '123 Đường Nguyễn Huệ, Quận 1, TP HCM',
    createdAt: '2024-01-20',
    estimatedDelivery: '2024-01-25'
  },
  {
    id: 'ORD-20240118-002',
    items: [
      {
        productName: 'Giant Escape 3',
        price: 1200000,
        quantity: 2
      }
    ],
    status: 'pending_confirmation',
    totalAmount: 2430000,
    deliveryAddress: '456 Phố Bà Triệu, Quận Ba Đình, Hà Nội',
    createdAt: '2024-01-18',
    estimatedDelivery: '2024-01-22'
  },
  {
    id: 'ORD-20240115-003',
    items: [
      {
        productName: 'Specialized Rockhopper',
        price: 2500000,
        quantity: 1
      }
    ],
    status: 'completed',
    totalAmount: 2530000,
    deliveryAddress: '123 Đường Nguyễn Huệ, Quận 1, TP HCM',
    createdAt: '2024-01-15',
    estimatedDelivery: '2024-01-18'
  }
];

export default function OrderTrackingPage() {
  const handleConfirmReceipt = (orderId: string) => {
    console.log('Confirming receipt for order:', orderId);
    alert('Order confirmed!');
  };

  const handleRequestReturn = (orderId: string) => {
    console.log('Requesting return for order:', orderId);
    alert('Return request submitted. Admin will review.');
  };

  return (
    <OrderTracking 
      orders={MOCK_ORDERS}
      onConfirmReceipt={handleConfirmReceipt}
      onRequestReturn={handleRequestReturn}
    />
  );
}
