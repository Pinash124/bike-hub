import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid } from 'lucide-react';
import '../../styles/GuestMarketplace.css';

interface Product {
  id: string;
  name: string;
  price: number;
  condition: string;
  image: string;
  seller: string;
  rating: number;
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Mountain Bike Pro',
    price: 1500000,
    condition: 'Like New',
    image: '🚲',
    seller: 'John Bike Store',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Road Bike Sport',
    price: 2000000,
    condition: 'Used',
    image: '🚴',
    seller: 'Sports Store',
    rating: 4.5,
  },
  {
    id: '3',
    name: 'City Commuter',
    price: 800000,
    condition: 'New',
    image: '🚲',
    seller: 'Urban Bikes',
    rating: 4.9,
  },
  {
    id: '4',
    name: 'Electric Bike',
    price: 5000000,
    condition: 'New',
    image: '⚡',
    seller: 'Tech Bikes',
    rating: 4.7,
  },
];

export const GuestMarketplace: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleProductClick = (productId: string) => {
    // Guest can view product details but must login to buy
    navigate(`/product/${productId}`, { state: { fromGuest: true } });
  };

  const handleBuyClick = () => {
    // Redirect to login when guest tries to buy
    navigate('/login', { state: { from: 'purchase' } });
  };

  return (
    <div className="guest-marketplace">
      {/* Search and Filter Section */}
      <div className="marketplace-header">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search bikes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          className="filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} />
          Filter
        </button>
      </div>

      {/* Filter Section (Guest - Simplified) */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-group">
            <h4>Price Range</h4>
            <input type="range" min="0" max="10000000" />
          </div>
          <div className="filter-group">
            <h4>Condition</h4>
            <label>
              <input type="checkbox" /> New
            </label>
            <label>
              <input type="checkbox" /> Like New
            </label>
            <label>
              <input type="checkbox" /> Used
            </label>
          </div>
          <div className="filter-group">
            <h4>Brand</h4>
            <label>
              <input type="checkbox" /> Trek
            </label>
            <label>
              <input type="checkbox" /> Giant
            </label>
            <label>
              <input type="checkbox" /> Specialized
            </label>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="products-grid">
        {mockProducts
          .filter((p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image" onClick={() => handleProductClick(product.id)}>
                <span className="image-placeholder">{product.image}</span>
                <span className="condition-badge">{product.condition}</span>
              </div>
              <div className="product-info">
                <h3 onClick={() => handleProductClick(product.id)}>
                  {product.name}
                </h3>
                <p className="seller-name">{product.seller}</p>
                <div className="rating">
                  ⭐ {product.rating}
                </div>
                <div className="product-footer">
                  <span className="price">
                    {(product.price / 1000000).toFixed(1)}M VND
                  </span>
                  <button
                    className="btn-buy-guest"
                    onClick={handleBuyClick}
                  >
                    Buy
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Guest Notice */}
      <div className="guest-notice">
        <p>👋 You're browsing as a guest. Sign in to purchase, add to cart, or leave reviews.</p>
        <button
          className="btn-signin-notice"
          onClick={() => navigate('/login')}
        >
          Sign In Now
        </button>
      </div>
    </div>
  );
};

export default GuestMarketplace;
