import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ProductDetail from '../components/buyer/Products/ProductDetail';
import { listingService, type Listing } from '../services/listing.service';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Optimistic: use state from BikeCard click immediately, then refresh from API
  const [listing, setListing] = useState<Listing | null>(
    location.state?.listing ?? null
  );
  const [isLoading, setIsLoading] = useState(!location.state?.listing);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); return; }
    // Always fetch from API to get full, up-to-date data
    setIsLoading(true);
    listingService.getListingById(id).then((data) => {
      if (data) setListing(data);
      else if (!listing) setNotFound(true); // only 404 if we had no state either
    }).catch(() => {
      if (!listing) setNotFound(true);
    }).finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading && !listing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <span className="text-6xl">🚲</span>
        <h2 className="text-2xl font-black text-gray-800">Sản phẩm không tồn tại</h2>
        <p className="text-gray-500">Sản phẩm này có thể đã bán hoặc bị gỡ xuống.</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return <ProductDetail listing={listing} />;
}
