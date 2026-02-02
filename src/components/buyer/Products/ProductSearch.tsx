import React, { useState, useMemo } from 'react';
import { Search, Sliders } from 'lucide-react';
import { ProductFilter } from './ProductFilter';
import type { FilterCriteria } from './ProductFilter';
import '../../../styles/ProductSearch.css';

export interface Product {
  id: string;
  name: string;
  price: number;
  condition: string;
  image: string;
  seller: string;
  sellerId: string;
  rating: number;
  brand: string;
  material: string;
  size: string;
  reviews: number;
  description: string;
}

interface ProductSearchProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Trek FX 3 Hybrid Bike',
    price: 1500000,
    condition: 'Like New (99%)',
    image: '🚲',
    seller: 'John Bike Store',
    sellerId: 'seller_1',
    rating: 4.8,
    brand: 'Trek',
    material: 'Aluminum',
    size: 'M (52cm)',
    reviews: 45,
    description: 'Excellent condition, barely used hybrid bike perfect for commuting.',
  },
  {
    id: '2',
    name: 'Giant Contend Road Bike',
    price: 2000000,
    condition: 'Good (90%)',
    image: '🚴',
    seller: 'Sports Store Vietnam',
    sellerId: 'seller_2',
    rating: 4.5,
    brand: 'Giant',
    material: 'Carbon',
    size: 'L (54cm)',
    reviews: 32,
    description: 'Road bike in good condition, ready for long rides.',
  },
  {
    id: '3',
    name: 'Specialized Hardrock MTB',
    price: 1200000,
    condition: 'Used',
    image: '🚵',
    seller: 'Mountain Trail Club',
    sellerId: 'seller_3',
    rating: 4.7,
    brand: 'Specialized',
    material: 'Aluminum',
    size: 'M (52cm)',
    reviews: 28,
    description: 'Mountain bike perfect for trails and off-road adventures.',
  },
  {
    id: '4',
    name: 'Cannondale Quick Commuter',
    price: 1100000,
    condition: 'Like New (99%)',
    image: '🚲',
    seller: 'Urban Bikes',
    sellerId: 'seller_4',
    rating: 4.9,
    brand: 'Cannondale',
    material: 'Steel',
    size: 'S (49cm)',
    reviews: 18,
    description: 'Perfect city commuter bike, lightweight and durable.',
  },
  {
    id: '5',
    name: 'Scott Spark Carbon MTB',
    price: 3500000,
    condition: 'New',
    image: '🚵',
    seller: 'Premium Bikes',
    sellerId: 'seller_5',
    rating: 5.0,
    brand: 'Scott',
    material: 'Carbon',
    size: 'L (54cm)',
    reviews: 12,
    description: 'High-end carbon MTB for serious riders.',
  },
];

export const ProductSearch: React.FC<ProductSearchProps> = ({
  products = MOCK_PRODUCTS,
  onSelectProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterCriteria>({
    priceRange: [0, 10000000],
    brands: [],
    conditions: [],
    materials: [],
    sizes: [],
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high' | 'rating'>('relevance');

  // Filter and search products
  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      // Search query
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase());

      // Price range
      const matchesPrice =
        product.price >= filters.priceRange[0] &&
        product.price <= filters.priceRange[1];

      // Brands
      const matchesBrand =
        filters.brands.length === 0 || filters.brands.includes(product.brand);

      // Conditions
      const matchesCondition =
        filters.conditions.length === 0 || filters.conditions.includes(product.condition);

      // Materials
      const matchesMaterial =
        filters.materials.length === 0 || filters.materials.includes(product.material);

      // Sizes
      const matchesSize =
        filters.sizes.length === 0 || filters.sizes.includes(product.size);

      return (
        matchesSearch &&
        matchesPrice &&
        matchesBrand &&
        matchesCondition &&
        matchesMaterial &&
        matchesSize
      );
    });

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return result;
  }, [products, searchQuery, filters, sortBy]);

  return (
    <div className="product-search">
      {/* Search Header */}
      <div className="search-header">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search bikes by name, brand, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button
          className="btn-filter-mobile"
          onClick={() => setFilterOpen(!filterOpen)}
        >
          <Sliders size={20} />
          Filter
        </button>
      </div>

      <div className="search-controls">
        <div className="sort-control">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
            <option value="relevance">Relevance</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
        <p className="results-count">
          Found {filteredProducts.length} products
        </p>
      </div>

      <div className="search-container">
        {/* Sidebar Filter (Desktop) */}
        <div className="filter-sidebar">
          <ProductFilter
            onFilterChange={setFilters}
            isOpen={true}
            onClose={() => setFilterOpen(false)}
          />
        </div>

        {/* Mobile Filter */}
        {filterOpen && (
          <div className="filter-modal">
            <div className="filter-modal-content">
              <ProductFilter
                onFilterChange={setFilters}
                isOpen={true}
                onClose={() => setFilterOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="products-container">
          {filteredProducts.length === 0 ? (
            <div className="no-results">
              <Search size={48} />
              <p>No products found matching your criteria</p>
              <button
                className="btn-reset"
                onClick={() => {
                  setSearchQuery('');
                  setFilters({
                    priceRange: [0, 10000000],
                    brands: [],
                    conditions: [],
                    materials: [],
                    sizes: [],
                  });
                }}
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="product-card"
                  onClick={() => onSelectProduct(product)}
                >
                  <div className="product-image">
                    <span className="image-icon">{product.image}</span>
                    <span className="condition-badge">{product.condition}</span>
                  </div>
                  <div className="product-info">
                    <h3 title={product.name}>{product.name}</h3>
                    <p className="brand">{product.brand}</p>
                    <div className="rating">
                      <span className="stars">⭐ {product.rating}</span>
                      <span className="reviews">({product.reviews})</span>
                    </div>
                    <p className="price">
                      {(product.price / 1000000).toFixed(1)}M VND
                    </p>
                    <p className="seller">{product.seller}</p>
                    <button className="btn-view-detail">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductSearch;
