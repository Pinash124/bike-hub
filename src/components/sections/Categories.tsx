// src/components/sections/Categories.tsx
import {
  Bike,
  ChevronRight,
  LayoutGrid
} from 'lucide-react'
import type { Brand } from '../../services/brand.service';

interface CategoriesProps {
  brands: Brand[];
  onSelectBrand: (name: string) => void;
  selectedBrand: string;
}

export default function Categories({ brands, onSelectBrand, selectedBrand }: CategoriesProps) {
  return (
    <section className="bg-[#f8fafc] py-20 border-b border-slate-100">
      <div className="content-layout px-4 md:px-8 max-w-[1440px] mx-auto">
        <div className="mb-12 space-y-4">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-green-500"></span>
            <span className="text-[10px] font-black text-green-600 uppercase tracking-[0.4em]">
              Bộ sưu tập
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">
              Khám phá <br className="md:hidden" /> theo thương hiệu
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] max-w-[200px] leading-relaxed">
              * Lựa chọn thương hiệu phù hợp với phong cách của bạn.
            </p>
          </div>
        </div>

        <div className="flex gap-4 flex-wrap items-center">
          <button
            onClick={() => onSelectBrand('Tất cả')}
            className={`group flex items-center gap-3 px-8 py-3.5 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-500 active:scale-95 shadow-sm
              ${selectedBrand === 'Tất cả'
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 -translate-y-1'
                : 'bg-white border border-slate-100 text-slate-500 hover:border-green-500 hover:text-green-600 hover:shadow-md'
              }`}
          >
            <span className={`transition-colors duration-300 ${selectedBrand === 'Tất cả' ? 'text-green-400' : 'text-slate-300 group-hover:text-green-600'}`}>
              <LayoutGrid size={16} />
            </span>
            <span className="whitespace-nowrap">Tất cả xe</span>
            <ChevronRight
              size={12}
              className={`transition-all duration-500 ${selectedBrand === 'Tất cả' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}
            />
          </button>

          {Array.isArray(brands) && brands.map((brand) => {
            const isActive = selectedBrand === brand.name;
            return (
              <button
                key={brand.id}
                onClick={() => onSelectBrand(brand.name)}
                className={`group flex items-center gap-3 px-8 py-3.5 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-500 active:scale-95 shadow-sm
                  ${isActive
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 -translate-y-1'
                    : 'bg-white border border-slate-100 text-slate-500 hover:border-green-500 hover:text-green-600 hover:shadow-md'
                  }`}
              >
                <span className={`transition-colors duration-300 ${isActive ? 'text-green-400' : 'text-slate-300 group-hover:text-green-600'}`}>
                  <Bike size={16} />
                </span>
                <span className="whitespace-nowrap">{brand.name}</span>
                <ChevronRight
                  size={12}
                  className={`transition-all duration-500 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  )
}
