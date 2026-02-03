import { useNavigate } from 'react-router-dom';
import Checkout from '../components/buyer/Checkout/Checkout';
import type { Address } from '../components/buyer/Checkout/Checkout';

// Mock addresses for now
const MOCK_ADDRESSES: Address[] = [
  {
    id: '1',
    fullName: 'Nguyễn Văn A',
    phone: '0123456789',
    province: 'Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Ben Nghé',
    detailedAddress: '123 Đường Nguyễn Huệ',
    isDefault: true
  },
  {
    id: '2',
    fullName: 'Nguyễn Văn B',
    phone: '0987654321',
    province: 'Hà Nội',
    district: 'Quận Ba Đình',
    ward: 'Phường Trúc Bạch',
    detailedAddress: '456 Phố Bà Triệu',
    isDefault: false
  }
];

export default function CheckoutPage() {
  const navigate = useNavigate();

  const handlePayment = (data: any) => {
    console.log('Payment data:', data);
    alert('Payment processed! Order created.');
    navigate('/buyer/orders');
  };

  return <Checkout addresses={MOCK_ADDRESSES} onPayment={handlePayment} />;
}
