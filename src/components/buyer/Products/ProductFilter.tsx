import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';

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
    <div className="bg-white border-2 border-gray-200 rounded-lg p-6 w-full max-w-xs h-fit lg:max-w-xs md:mb-8 md:p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="m-0 text-green-500 flex items-center gap-2 text-lg font-semibold">
          <Filter size={20} /> Filters
        </h3>
        <button
          onClick={onClose}
          className="bg-transparent border-none text-gray-600 cursor-pointer p-0 flex items-center transition-colors duration-200 hover:text-green-500"
        >
          <X size={20} />
        </button>
      </div>

      {/* Price Range Section */}
      <div className="mb-8 pb-6 border-b border-gray-200 last:border-b-0 last:mb-0 last:pb-0">
        <h4 className="m-0 mb-4 text-green-500 text-sm font-semibold uppercase">Price Range</h4>
        <div className="flex gap-2 items-center mb-3">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceRange[0]}
            onChange={handlePriceChange}
            data-index="0"
            min={0}
            max={10000000}
            className="flex-1 px-2 py-2 border-2 border-gray-200 rounded focus:outline-none focus:border-green-500"
          />
          <span className="text-gray-600 font-semibold">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.priceRange[1]}
            onChange={handlePriceChange}
            data-index="1"
            min={0}
            max={10000000}
            className="flex-1 px-2 py-2 border-2 border-gray-200 rounded focus:outline-none focus:border-green-500"
          />
        </div>
        <p className="text-gray-600 text-sm">
          {(filters.priceRange[0] / 1000000).toFixed(1)}M - {(filters.priceRange[1] / 1000000).toFixed(1)}M VND
        </p>
      </div>

      {/* Brand Section */}
      <div className="mb-8 pb-6 border-b border-gray-200 last:border-b-0 last:mb-0 last:pb-0">
        <h4 className="m-0 mb-4 text-green-500 text-sm font-semibold uppercase">Brand</h4>
        <div className="flex flex-col gap-3">
          {BRANDS.map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-3 cursor-pointer select-none hover:text-green-500"
            >
              <input
                type="checkbox"
                checked={filters.brands.includes(brand)}
                onChange={() => handleCheckboxChange('brands', brand)}
                className="w-4.5 h-4.5 cursor-pointer accent-green-500 flex-shrink-0"
              />
              <span className="text-gray-900 text-sm">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Condition Section */}
      <div className="mb-8 pb-6 border-b border-gray-200 last:border-b-0 last:mb-0 last:pb-0">
        <h4 className="m-0 mb-4 text-green-500 text-sm font-semibold uppercase">Condition</h4>
        <div className="flex flex-col gap-3">
          {CONDITIONS.map((condition) => (
            <label
              key={condition}
              className="flex items-center gap-3 cursor-pointer select-none hover:text-green-500"
            >
              <input
                type="checkbox"
                checked={filters.conditions.includes(condition)}
                onChange={() => handleCheckboxChange('conditions', condition)}
                className="w-4.5 h-4.5 cursor-pointer accent-green-500 flex-shrink-0"
              />
              <span className="text-gray-900 text-sm">{condition}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Frame Material Section */}
      <div className="mb-8 pb-6 border-b border-gray-200 last:border-b-0 last:mb-0 last:pb-0">
        <h4 className="m-0 mb-4 text-green-500 text-sm font-semibold uppercase">Frame Material</h4>
        <div className="flex flex-col gap-3">
          {MATERIALS.map((material) => (
            <label
              key={material}
              className="flex items-center gap-3 cursor-pointer select-none hover:text-green-500"
            >
              <input
                type="checkbox"
                checked={filters.materials.includes(material)}
                onChange={() => handleCheckboxChange('materials', material)}
                className="w-4.5 h-4.5 cursor-pointer accent-green-500 flex-shrink-0"
              />
              <span className="text-gray-900 text-sm">{material}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Frame Size Section */}
      <div className="mb-8 pb-6 border-b border-gray-200 last:border-b-0 last:mb-0 last:pb-0">
        <h4 className="m-0 mb-4 text-green-500 text-sm font-semibold uppercase">Frame Size</h4>
        <div className="flex flex-col gap-3">
          {SIZES.map((size) => (
            <label
              key={size}
              className="flex items-center gap-3 cursor-pointer select-none hover:text-green-500"
            >
              <input
                type="checkbox"
                checked={filters.sizes.includes(size)}
                onChange={() => handleCheckboxChange('sizes', size)}
                className="w-4.5 h-4.5 cursor-pointer accent-green-500 flex-shrink-0"
              />
              <span className="text-gray-900 text-sm">{size}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="w-full bg-green-50 text-green-500 border-2 border-green-500 px-3 py-3 rounded font-semibold mt-4 cursor-pointer transition-all hover:bg-green-500 hover:text-white"
      >
        Reset Filters
      </button>
    </div>
  );
};

export default ProductFilter;
