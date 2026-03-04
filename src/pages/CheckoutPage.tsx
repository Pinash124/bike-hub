import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Checkout from '../components/buyer/Checkout/Checkout';
import { addressService, type Address } from '../services/address.service';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // "Mua ngay" (Buy Now) → single listingId
  // Cart checkout   → listingIds[]
  const listingId: string | undefined = location.state?.listingId;
  const listingIds: string[] | undefined = location.state?.listingIds;

  // Normalise: always work with an array
  const ids = listingIds ?? (listingId ? [listingId] : []);

  useEffect(() => {
    addressService.getMyAddresses().then(setAddresses).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (ids.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-500 text-lg font-medium">Không có sản phẩm nào để thanh toán.</p>
        <button onClick={() => navigate(-1)} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700">
          Quay lại
        </button>
      </div>
    );
  }

  return <Checkout addresses={addresses} listingIds={ids} />;
}
