import { Filter, X } from 'lucide-react'
import { useState } from 'react'

export default function FilterSection() {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <section className="bg-white py-4 border-b border-gray-100">
      <div className="max-w-[1440px] mx-auto px-6">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 border border-green-200 px-4 py-2 rounded-xl text-green-600 font-bold hover:bg-green-50 transition-all active:scale-95"
        >
          <Filter size={18} />
          <span>Filters</span>
          {showFilters && <X size={16} />}
        </button>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 p-6 bg-gray-50 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
            {[
              { label: 'Discipline', options: ['All', 'MTB', 'Road', 'E-Bike'] },
              { label: 'Brand', options: ['All Brands', 'Trek', 'Giant', 'Specialized'] },
              { label: 'Condition', options: ['All', 'New', 'Refurbished', 'Used'] }
            ].map((group) => (
              <div key={group.label} className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{group.label}</label>
                <select className="bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-green-500/20 transition-all">
                  {group.options.map(opt => <option key={opt}>{opt}</option>)}
                </select>
              </div>
            ))}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Price Range</label>
              <input type="range" className="accent-green-600 h-10" />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}