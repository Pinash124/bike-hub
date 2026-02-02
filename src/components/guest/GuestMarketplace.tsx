import React, { useState } from 'react';
import Banner from '../sections/Banner';
import Categories from '../sections/Categories';
import BikeCard from '../sections/BikeCard';
 

// Mock data có thêm trường brand
const mockBikes = [
  { id: 1, title: 'Yamaha R1 Sport Edition', price: 25000000, brand: 'Yamaha', image: '🏍️', location: 'Hà Nội', year: 2023, mileage: 1200 },
  { id: 2, title: 'Giant Escape 3', price: 8500000, brand: 'Giant', image: '🚲', location: 'TP.HCM', year: 2022, mileage: 500 },
  { id: 3, title: 'Trek Marlin 7', price: 15000000, brand: 'Trek', image: '🚵', location: 'Đà Nẵng', year: 2023, mileage: 100 },
  // ... thêm các xe khác
];

export const GuestMarketplace: React.FC = () => {
  const [selectedBrand, setSelectedBrand] = useState('Tất cả');

  const filteredBikes = selectedBrand === 'Tất cả' 
    ? mockBikes 
    : mockBikes.filter(bike => bike.brand === selectedBrand);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-white py-8">
      <div className="max-w-[1400px] mx-auto px-6">
        <Banner />

        <Categories 
          selectedCategory={selectedBrand} 
          onSelectCategory={(brand) => setSelectedBrand(brand === selectedBrand ? 'Tất cả' : brand)} 
        />

        <div className="mt-8">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{selectedBrand === 'Tất cả' ? 'Sản phẩm mới nhất' : `Xe dòng ${selectedBrand}`}</h3>
          </div>

          <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredBikes.map(bike => (
              <BikeCard key={bike.id} {...bike} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
