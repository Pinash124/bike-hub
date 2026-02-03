// src/components/sections/Categories.tsx
import { 
  Mountain, 
  Bike, 
  Zap, 
  Compass, 
  Orbit, 
  LayoutGrid,
  ChevronRight
} from 'lucide-react'

const categories = [
  { id: 1, name: 'Mountain', label: 'Xe địa hình', icon: <Mountain size={16} /> },
  { id: 2, name: 'Road', label: 'Xe đua', icon: <Bike size={16} /> },
  { id: 3, name: 'Gravel', label: 'Xe đường trường', icon: <Compass size={16} /> },
  { id: 4, name: 'Electric', label: 'Xe trợ lực', icon: <Zap size={16} /> },
  { id: 5, name: 'City', label: 'Xe đường phố', icon: <Orbit size={16} /> },
  { id: 6, name: 'All', label: 'Tất cả dòng xe', icon: <LayoutGrid size={16} /> },
]

interface CategoriesProps {
  onSelectCategory: (name: string) => void;
  selectedCategory: string;
}

export default function Categories({ onSelectCategory, selectedCategory }: CategoriesProps) {
  return (
    // 1. NỀN SECTION: Sử dụng slate-50/50 để đồng bộ với phần FeaturedBikes
    <section className="bg-[#f8fafc] py-20 border-b border-slate-100">
      
      {/* 2. LAYOUT: Đồng bộ max-width và padding với FilterSection */}
      <div className="content-layout px-4 md:px-8 max-w-[1440px] mx-auto">
        
        {/* 3. HEADER: Phong cách Editorial với đường kẻ xanh đặc trưng */}
        <div className="mb-12 space-y-4">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-green-500"></span>
            <span className="text-[10px] font-black text-green-600 uppercase tracking-[0.4em]">
              Bộ sưu tập
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">
              Khám phá <br className="md:hidden" /> theo dòng xe
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] max-w-[200px] leading-relaxed">
              * Lựa chọn dòng xe phù hợp với hành trình của bạn.
            </p>
          </div>
        </div>
        
        {/* 4. CATEGORY PILLS: Style nút bấm lấy trực tiếp từ "Form của Filter" */}
        <div className="flex gap-4 flex-wrap items-center">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.name)}
                className={`group flex items-center gap-3 px-8 py-3.5 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-500 active:scale-95 shadow-sm
                  ${isActive 
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 -translate-y-1' 
                    : 'bg-white border border-slate-100 text-slate-500 hover:border-green-500 hover:text-green-600 hover:shadow-md'
                  }`}
              >
                <span className={`transition-colors duration-300 ${isActive ? 'text-green-400' : 'text-slate-300 group-hover:text-green-600'}`}>
                  {cat.icon}
                </span>
                <span className="whitespace-nowrap">{cat.label}</span>
                
                {/* Icon mũi tên nhỏ chỉ hiện khi Active (giống phong cách nút bấm Premium) */}
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