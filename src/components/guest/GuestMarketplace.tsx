import React, { useState, useEffect } from 'react';
import Banner from '../sections/Banner';
import Categories from '../sections/Categories';
import BikeCard from '../sections/BikeCard';
import { brandService, type Brand } from '../../services/brand.service';
import { listingService, type Listing } from '../../services/listing.service';

export const GuestMarketplace: React.FC = () => {
  const [selectedBrand, setSelectedBrand] = useState('Tất cả');
  const [bikes, setBikes] = useState<Listing[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [listingsData, brandsData] = await Promise.all([
        listingService.getListings(),
        brandService.getAllBrands()
      ]);
      setBikes(listingsData.filter((b) => b.status === 'LIVE'));
      setBrands(brandsData);
    } catch (error) {
      console.error('Failed to fetch marketplace data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBikes = selectedBrand === 'Tất cả'
    ? bikes
    : bikes.filter(bike => bike.brand?.name === selectedBrand);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-white py-8">
      <div className="max-w-[1400px] mx-auto px-6">
        <Banner />

        <Categories
          brands={brands}
          selectedBrand={selectedBrand}
          onSelectBrand={(brand: string) => setSelectedBrand(brand === selectedBrand ? 'Tất cả' : brand)}
        />

        <div className="mt-8">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{selectedBrand === 'Tất cả' ? 'Sản phẩm mới nhất' : `Xe dòng ${selectedBrand}`}</h3>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 rounded-full border-4 border-green-200 border-t-green-600 animate-spin"></div>
            </div>
          ) : filteredBikes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Không tìm thấy xe phù hợp.
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredBikes.map(bike => {
                const mappedProps = {
                  id: bike.id,
                  image: bike.images?.[0]?.secureUrl || 'https://images.unsplash.com/photo-1532298229144-0ee050c99d2b?q=80&w=800',
                  title: bike.title,
                  price: bike.price,
                  year: new Date(bike.createdAt).getFullYear(),
                  location: bike.location || 'Toàn quốc',
                  mileage: bike.usageDuration || 0,
                  size: 'N/A', // Listing missing size
                  condition: bike.condition || 'Đã qua sử dụng',
                  description: bike.description,
                  brand: bike.brand?.name || 'Khác',
                };
                return <BikeCard key={bike.id} {...mappedProps} />
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
