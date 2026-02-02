import { Filter, X } from 'lucide-react'
import { useState } from 'react'
import '../../styles/sections/FilterSection.css'

export default function FilterSection() {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <section className="filter-section">
      <div className="filter-container">
        <button 
          className="filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          <span>Filters</span>
          {showFilters && <X size={18} />}
        </button>

        {showFilters && (
          <div className="filters">
            <div className="filter-group">
              <label>Discipline</label>
              <select>
                <option>All</option>
                <option>MTB</option>
                <option>Road</option>
                <option>E-Bike</option>
                <option>City</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Brand</label>
              <select>
                <option>All Brands</option>
                <option>Trek</option>
                <option>Giant</option>
                <option>Specialized</option>
                <option>Merida</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Condition</label>
              <select>
                <option>All</option>
                <option>New</option>
                <option>Refurbished</option>
                <option>Used</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range</label>
              <input type="range" min="0" max="10000" />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
