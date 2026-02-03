// src/components/sections/Banner.tsx
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function BannerLeft() {
  const navigate = useNavigate()
  
  return (
    <section className="m-4 md:m-6 relative h-[500px] md:h-[600px] rounded-[2.5rem] overflow-hidden shadow-2xl group isolate">
      {/* 1. HÌNH NỀN: Zoom nhẹ khi hover */}
      <img
        src="https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=2000"
        alt="Bicycle Banner"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 -z-10"
      />
      
      {/* 2. GRADIENT TRÁI QUA PHẢI: Tạo "vùng tối" hoàn hảo cho chữ ở bên trái */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent -z-10" />
      
      {/* 3. NỘI DUNG: Căn trái hoàn toàn */}
      <div className="relative h-full flex flex-col justify-center items-start text-left px-10 md:px-20 lg:px-32 max-w-4xl">
        
        {/* Badge nhỏ làm điểm nhấn */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full mb-6 animate-fade-in">
          <Sparkles size={14} className="text-green-400" />
          <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Bộ sưu tập 2026</span>
        </div>

        {/* TIÊU ĐỀ: Font Black, Drop shadow sâu để không bị chìm */}
        <h2 className="text-4xl md:text-7xl font-black text-white mb-6 leading-[1.1] drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] tracking-tighter">
          Tìm Kiếm <br/>
          Chiếc Xe <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-300 drop-shadow-none">
            Hoàn Hảo
          </span>
        </h2>

        {/* MÔ TẢ: Slate-200 để dịu mắt nhưng vẫn cực kỳ rõ trên nền đen */}
        <p className="text-slate-200 text-lg md:text-xl mb-12 max-w-md font-medium leading-relaxed drop-shadow-md">
          Khám phá hàng ngàn xe đạp chất lượng từ những người bán uy tín nhất trên toàn quốc.
        </p>
        
        {/* NÚT BẤM: Giữ phong cách tròn "xịn" nhưng đặt ở góc trái */}
        <div className="flex items-center gap-6 group/btn cursor-pointer">
            <button 
                onClick={() => navigate('/search')}
                className="relative bg-green-600 hover:bg-green-500 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-[0_10px_30px_-5px_rgba(34,197,94,0.5)] transition-all hover:-translate-y-2 active:scale-95 ring-4 ring-white/10 group-hover/btn:ring-green-400/40"
            >
                <ArrowRight 
                  size={32} 
                  strokeWidth={3} 
                  className="transition-transform duration-300 group-hover/btn:translate-x-1" 
                />
            </button>
            
            <div className="flex flex-col">
              <span className="text-white font-black text-sm uppercase tracking-[0.2em]">Khám phá ngay</span>
              <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Xem tất cả mẫu xe</span>
            </div>
        </div>
      </div>
    </section>
  )
}