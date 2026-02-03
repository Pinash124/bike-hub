// src/components/sections/FilterSection.tsx
import { Filter, X, ChevronDown, RotateCcw } from 'lucide-react'
import { useState, useMemo } from 'react'
import BikeCard from './BikeCard'

// 1. ĐỊNH NGHĨA DỮ LIỆU MẪU ĐẦY ĐỦ (Fix lỗi thiếu thuộc tính)
const initialBikes = [
  { 
    id: 1, 
    image: 'https://images.unsplash.com/photo-1532298229144-0ee050c99d2b?q=80&w=800', 
    title: 'Trek X-Caliber 8', 
    price: 25000000, 
    discipline: 'MTB', 
    brand: 'Trek', 
    condition: 'New',
    year: 2023, 
    location: 'Hà Nội', 
    mileage: 0 
  },
  { 
    id: 2, 
    image: 'https://images.unsplash.com/photo-1576433734880-5fbd380eb13c?q=80&w=800', 
    title: 'Giant Escape 3', 
    price: 8500000, 
    discipline: 'Road', 
    brand: 'Giant', 
    condition: 'Used',
    year: 2022, 
    location: 'TP.HCM', 
    mileage: 1500 
  },
  { 
    id: 3, 
    image: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?q=80&w=800', 
    title: 'Specialized Rockhopper', 
    price: 18000000, 
    discipline: 'MTB', 
    brand: 'Specialized', 
    condition: 'New',
    year: 2023, 
    location: 'Đà Nẵng', 
    mileage: 0 
  },
  { 
    id: 4, 
    image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?q=80&w=800', 
    title: 'Scott Speedster', 
    price: 35000000, 
    discipline: 'Road', 
    brand: 'Scott', 
    condition: 'New',
    year: 2024, 
    location: 'Hải Phòng', 
    mileage: 200 
  },
  { 
    id: 5, 
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=800', 
    title: 'Cannondale Topstone', 
    price: 42000000, 
    discipline: 'Gravel', 
    brand: 'Cannondale', 
    condition: 'Refurbished',
    year: 2021, 
    location: 'Cần Thơ', 
    mileage: 3200 
  }
];

export default function FilterSection() {
  const [showFilters, setShowFilters] = useState(false)
  
  // 2. TRẠNG THÁI BỘ LỌC
  const [filters, setFilters] = useState({
    discipline: 'All',
    brand: 'All Brands',
    condition: 'All',
    maxPrice: 60000000 // Mặc định để mức cao
  })

  // 3. LOGIC LỌC DỮ LIỆU THỰC THỜI
  const filteredBikes = useMemo(() => {
    return initialBikes.filter(bike => {
      const matchDiscipline = filters.discipline === 'All' || bike.discipline === filters.discipline;
      const matchBrand = filters.brand === 'All Brands' || bike.brand === filters.brand;
      const matchCondition = filters.condition === 'All' || bike.condition === filters.condition;
      const matchPrice = bike.price <= filters.maxPrice;
      
      return matchDiscipline && matchBrand && matchCondition && matchPrice;
    });
  }, [filters]);

  const resetFilters = () => setFilters({
    discipline: 'All',
    brand: 'All Brands',
    condition: 'All',
    maxPrice: 60000000
  });

  return (
    <section className="bg-white py-12 border-b border-slate-50">
      <div className="content-layout px-4 md:px-8 max-w-[1440px] mx-auto">
        
        {/* ACTION BAR: Điều khiển bộ lọc */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-sm ${
                showFilters 
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                : 'bg-white border border-slate-100 text-slate-500 hover:border-green-500 hover:text-green-600'
              }`}
            >
              <Filter size={14} className={showFilters ? 'animate-pulse' : ''} />
              <span>{showFilters ? 'Đóng bộ lọc' : 'Lọc xe đạp'}</span>
              <ChevronDown size={14} className={`transition-transform duration-500 ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Tags hiển thị nhanh */}
            {!showFilters && filters.discipline !== 'All' && (
              <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                <span className="bg-green-50 text-green-600 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-100">
                  {filters.discipline}
                </span>
                <button onClick={resetFilters} className="p-2 text-slate-300 hover:text-red-500"><RotateCcw size={14}/></button>
              </div>
            )}
          </div>

          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Tìm thấy <span className="text-slate-900 font-black">{filteredBikes.length}</span> sản phẩm phù hợp
          </p>
        </div>

        {/* BẢNG ĐIỀU KHIỂN CHI TIẾT (Glassmorphism Light) */}
        {showFilters && (
          <div className="mb-16 p-10 bg-slate-50/40 backdrop-blur-sm border border-slate-100 rounded-[3rem] animate-in fade-in slide-in-from-top-6 duration-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              
              {/* Select Groups */}
              {[
                { key: 'discipline', label: 'Dòng xe', options: ['All', 'MTB', 'Road', 'Gravel', 'E-Bike'] },
                { key: 'brand', label: 'Thương hiệu', options: ['All Brands', 'Trek', 'Giant', 'Specialized', 'Scott', 'Cannondale'] },
                { key: 'condition', label: 'Tình trạng', options: ['All', 'New', 'Refurbished', 'Used'] }
              ].map((group) => (
                <div key={group.key} className="space-y-3">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-5">
                    {group.label}
                  </label>
                  <div className="relative group">
                    <select 
                      value={filters[group.key as keyof typeof filters]}
                      onChange={(e) => setFilters({...filters, [group.key]: e.target.value})}
                      className="w-full bg-white border border-slate-100 rounded-full px-6 py-4 text-[11px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-green-500/5 focus:border-green-500 transition-all appearance-none cursor-pointer"
                    >
                      {group.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-green-500 transition-colors" />
                  </div>
                </div>
              ))}

              {/* Price Range */}
              <div className="space-y-3">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-5 flex justify-between">
                  <span>Giá tối đa</span>
                  <span className="text-green-600 font-black">{(filters.maxPrice / 1000000).toFixed(0)} Triệu</span>
                </label>
                <div className="px-2 pt-4">
                    <input 
                        type="range" 
                        min="0" 
                        max="100000000" 
                        step="1000000"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({...filters, maxPrice: parseInt(e.target.value)})}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600 transition-all" 
                    />
                    <div className="flex justify-between mt-3 text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                        <span>0 VND</span>
                        <span>100M VND</span>
                    </div>
                </div>
              </div>
            </div>

            {/* Footer của Filter */}
            <div className="mt-10 pt-8 border-t border-slate-100/60 flex items-center justify-between">
                <p className="text-[9px] text-slate-300 font-medium italic">* Kết quả tự động cập nhật khi bạn thay đổi bộ lọc.</p>
                <button 
                  onClick={resetFilters}
                  className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-[0.2em] transition-all group"
                >
                  <RotateCcw size={14} className="group-hover:rotate-[-120deg] transition-transform" />
                  Làm mới tất cả
                </button>
            </div>
          </div>
        )}

        {/* KẾT QUẢ HIỂN THỊ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {filteredBikes.length > 0 ? (
            filteredBikes.map((bike) => (
              <div key={bike.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <BikeCard {...bike} />
              </div>
            ))
          ) : (
            <div className="col-span-full py-24 flex flex-col items-center justify-center animate-in fade-in duration-700">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <X size={40} className="text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Rất tiếc, không tìm thấy xe</h3>
                <p className="text-[11px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Hãy thử nới rộng khoảng giá hoặc chọn hãng khác bạn nhé!</p>
                <button 
                  onClick={resetFilters}
                  className="mt-8 px-8 py-3 bg-green-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all"
                >
                  Reset bộ lọc
                </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}