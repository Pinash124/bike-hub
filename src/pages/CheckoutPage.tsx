import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Checkout from '../components/buyer/Checkout/Checkout';
import { addressService, type Address } from '../services/address.service';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await addressService.getMyAddresses();
        setAddresses(data);
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  const handlePayment = (data: any) => {
    console.log('Payment data:', data);
    alert('Payment processed! Order created.');
    navigate('/buyer/dashboard?tab=orders');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return <Checkout addresses={addresses} onPayment={handlePayment} />;
}
