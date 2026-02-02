import React, { useState } from 'react';
import Banner from '../sections/Banner';
import Categories from '../sections/Categories';
import BikeCard from '../sections/BikeCard';
import '../../styles/GuestMarketplace.css';

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
    <div className="homepage-container">
      {/* Card 1: Banner */}
      <Banner />

      {/* Card 2: Categories */}
      <Categories 
        selectedCategory={selectedBrand} 
        onSelectCategory={(brand) => setSelectedBrand(brand === selectedBrand ? 'Tất cả' : brand)} 
      />

      {/* Danh sách sản phẩm dựa trên lọc */}
      <div className="products-section">
        <div className="section-header">
          <h3>{selectedBrand === 'Tất cả' ? 'Sản phẩm mới nhất' : `Xe dòng ${selectedBrand}`}</h3>
        </div>
        <div className="bike-grid">
          {filteredBikes.map(bike => (
            <BikeCard key={bike.id} {...bike} />
          ))}
        </div>
      </div>
    </div>
  );
};