import React, { useState, useMemo } from 'react';
import { Search, Sliders } from 'lucide-react';
import { ProductFilter } from './ProductFilter';
import type { FilterCriteria } from './ProductFilter';

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


export const ProductSearch: React.FC<ProductSearchProps> = ({
  products,
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
    <div className="min-h-[calc(100vh-80px)] bg-gray-100 p-8 md:p-4">
      {/* Search Header */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {/* Search Bar */}
        <div className="flex-1 min-w-64 flex items-center gap-3 bg-white border-2 border-green-300 rounded-lg px-4 py-3 shadow-sm">
          <Search size={20} className="text-green-500" />
          <input
            type="text"
            placeholder="Search bikes by name, brand, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-none bg-transparent flex-1 text-base text-gray-900 outline-none placeholder:text-gray-600"
          />
        </div>

        {/* Filter Mobile Button */}
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="hidden lg:hidden md:flex bg-green-500 text-white border-none px-6 py-3 rounded-lg cursor-pointer font-semibold gap-2 items-center hover:bg-green-600 hover:translate-y-[-2px]"
        >
          <Sliders size={20} /> Filter
        </button>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center bg-white px-4 py-4 rounded-lg mb-8 shadow-sm">
        <div className="flex items-center gap-3">
          <label className="font-semibold text-gray-900">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border-2 border-gray-200 rounded"
          >
            <option value="relevance">Relevance</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
        <p className="m-0 text-gray-600 text-sm">Found {filteredProducts.length} products</p>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-[280px_1fr] gap-8 lg:grid-cols-1">
        {/* Sidebar */}
        <div className="block lg:hidden">
          <ProductFilter onFilterChange={setFilters} isOpen={true} onClose={() => setFilterOpen(false)} />
        </div>

        {/* Mobile Modal */}
        {filterOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto p-4 lg:hidden">
            <div className="bg-white rounded-lg max-w-xl mx-auto mt-8">
              <ProductFilter onFilterChange={setFilters} isOpen={true} onClose={() => setFilterOpen(false)} />
            </div>
          </div>
        )}

        {/* Products Column */}
        <div className="flex flex-col">
          {filteredProducts.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-green-300 rounded-lg p-16 text-center">
              <Search size={48} className="text-green-500 mx-auto mb-4 opacity-50" />
              <p className="text-gray-600 text-lg m-4">No products found matching your criteria</p>
              <button
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
                className="bg-white border border-gray-200 px-4 py-2 rounded cursor-pointer"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 flex flex-col hover:border-green-300 hover:shadow-2xl hover:shadow-green-500/15 hover:-translate-y-1"
                >
                  {/* Product Image */}
                  <div className="relative w-full aspect-square bg-gray-100 flex items-center justify-center border-b-2 border-gray-200 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1532298229144-0ee050c99d2b?q=80&w=800';
                      }}
                    />
                    <span className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded text-xs font-semibold">
                      {product.condition}
                    </span>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <h3
                      title={product.name}
                      className="m-0 text-sm text-gray-900 font-semibold leading-snug line-clamp-2 transition-colors duration-200"
                    >
                      {product.name}
                    </h3>
                    <p className="text-green-500 font-medium text-xs uppercase m-0">
                      {product.brand}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-700">⭐ {product.rating}</span>
                      <span className="text-gray-500">({product.reviews})</span>
                    </div>
                    <p className="font-bold text-green-500 text-lg m-0 mt-auto">
                      {(product.price / 1000000).toFixed(1)}M VND
                    </p>
                    <p className="text-xs text-gray-400 m-0">{product.seller}</p>
                    <button className="bg-green-500 text-white border-none px-4 py-2 rounded text-xs font-semibold cursor-pointer transition-colors duration-200 hover:bg-green-600 mt-1">
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
