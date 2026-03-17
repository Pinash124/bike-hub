import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductSearch from '../components/buyer/Products/ProductSearch';
import type { Product } from '../components/buyer/Products/ProductSearch';
import { listingService, type Listing } from '../services/listing.service';

export default function SearchPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const data = await listingService.getListings();
      // Map API data to UI Product format. Only show 'LIVE' listings.
      const liveListings = data.filter((listing) => listing.status === 'LIVE');
      const mappedProducts: Product[] = liveListings.map((listing: Listing) => ({
        id: listing.id,
        name: listing.title,
        price: listing.price,
        condition: listing.condition || 'Used',
        image: listing.images?.[0]?.secureUrl || 'https://images.unsplash.com/photo-1532298229144-0ee050c99d2b?q=80&w=800',
        seller: 'Seller Info', // Info might need to be fetched or included in listing
        sellerId: 'unknown',
        rating: 5.0,
        brand: listing.brand?.name || 'Unknown',
        material: 'N/A',
        size: 'N/A',
        reviews: 0,
        description: listing.description
      }));
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Failed to fetch listings', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    // Note: We might want to pass the full Listing object if possible, 
    // but the UI expects Product. For now, we pass the mapped product.
    // Ideally, ProductDetailPage should fetch fresh data by ID.
    navigate(`/product/${product.id}`, { state: { product } });
  };

  if (isLoading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return <ProductSearch products={products} onSelectProduct={handleSelectProduct} />;
}
