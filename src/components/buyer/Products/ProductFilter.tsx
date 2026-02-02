import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import '../../../styles/ProductFilter.css';

export interface FilterCriteria {
  priceRange: [number, number];
  brands: string[];
  conditions: string[];
  materials: string[];
  sizes: string[];
}

interface ProductFilterProps {
  onFilterChange: (filters: FilterCriteria) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const BRANDS = ['Trek', 'Giant', 'Specialized', 'Cannondale', 'Scott', 'Cube', 'Other'];
const CONDITIONS = ['New', 'Like New (99%)', 'Good (90%)', 'Fair (75%)', 'Used'];
const MATERIALS = ['Aluminum', 'Carbon', 'Steel', 'Titanium'];
const SIZES = ['S (49cm)', 'M (52cm)', 'L (54cm)', 'XL (56cm)', 'XXL (58cm+)'];

export const ProductFilter: React.FC<ProductFilterProps> = ({
  onFilterChange,
  isOpen = true,
  onClose,
}) => {
  const [filters, setFilters] = useState<FilterCriteria>({
    priceRange: [0, 10000000],
    brands: [],
    conditions: [],
    materials: [],
    sizes: [],
  });

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRange: [number, number] = [
      parseInt(e.target.dataset.index || '0') === 0
        ? parseInt(e.target.value)
        : filters.priceRange[0],
      parseInt(e.target.dataset.index || '0') === 1
        ? parseInt(e.target.value)
        : filters.priceRange[1],
    ];
    
    const newFilters = { ...filters, priceRange: newRange };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCheckboxChange = (
    category: 'brands' | 'conditions' | 'materials' | 'sizes',
    value: string
  ) => {
    const updated = filters[category].includes(value)
      ? filters[category].filter((item) => item !== value)
      : [...filters[category], value];

    const newFilters = { ...filters, [category]: updated };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const defaultFilters: FilterCriteria = {
      priceRange: [0, 10000000],
      brands: [],
      conditions: [],
      materials: [],
      sizes: [],
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="product-filter">
      <div className="filter-header">
        <h3>
          <Filter size={20} /> Filters
        </h3>
        <button className="btn-close" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      {/* Price Range */}
      <div className="filter-section">
        <h4>Price Range</h4>
        <div className="price-range-inputs">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceRange[0]}
            onChange={handlePriceChange}
            data-index="0"
            min="0"
            max="10000000"
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.priceRange[1]}
            onChange={handlePriceChange}
            data-index="1"
            min="0"
            max="10000000"
          />
        </div>
        <p className="price-display">
          {(filters.priceRange[0] / 1000000).toFixed(1)}M - {(filters.priceRange[1] / 1000000).toFixed(1)}M VND
        </p>
      </div>

      {/* Brands */}
      <div className="filter-section">
        <h4>Brand</h4>
        <div className="filter-options">
          {BRANDS.map((brand) => (
            <label key={brand} className="filter-option">
              <input
                type="checkbox"
                checked={filters.brands.includes(brand)}
                onChange={() => handleCheckboxChange('brands', brand)}
              />
              <span>{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div className="filter-section">
        <h4>Condition</h4>
        <div className="filter-options">
          {CONDITIONS.map((condition) => (
            <label key={condition} className="filter-option">
              <input
                type="checkbox"
                checked={filters.conditions.includes(condition)}
                onChange={() => handleCheckboxChange('conditions', condition)}
              />
              <span>{condition}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Material */}
      <div className="filter-section">
        <h4>Frame Material</h4>
        <div className="filter-options">
          {MATERIALS.map((material) => (
            <label key={material} className="filter-option">
              <input
                type="checkbox"
                checked={filters.materials.includes(material)}
                onChange={() => handleCheckboxChange('materials', material)}
              />
              <span>{material}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="filter-section">
        <h4>Frame Size</h4>
        <div className="filter-options">
          {SIZES.map((size) => (
            <label key={size} className="filter-option">
              <input
                type="checkbox"
                checked={filters.sizes.includes(size)}
                onChange={() => handleCheckboxChange('sizes', size)}
              />
              <span>{size}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <button className="btn-reset" onClick={handleReset}>
        Reset Filters
      </button>
    </div>
  );
};

export default ProductFilter;
