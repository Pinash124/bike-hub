import { Facebook, Bike, ShieldCheck, PlusCircle, Instagram, Youtube, Linkedin, ArrowRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white mt-40 border-t border-white/5 w-full font-sans">
      
      {/* Sử dụng class .content-layout để thụt lùi 2 bên gióng thẳng hàng với Header.
         Tăng py-24 để tạo không gian thoáng đãng cho phần nội dung chính.
      */}
      <div className="content-layout py-60">
        
        {/* Grid với gap-16 tạo khoảng cách rộng rãi giữa các cột */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 items-start">
          
          {/* CỘT 1: Thương hiệu & Pháp lý */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="bg-green-600 p-3.5 rounded-3xl shadow-2xl shadow-green-900/40">
                <Bike size={34} strokeWidth={2.5} className="text-white" />
              </div>
              <h4 className="text-2xl font-black tracking-tighter uppercase leading-none">
                BIKE<span className="text-green-500">HUB</span>
              </h4>
            </div>
            
            <div className="space-y-6 text-[14px] leading-relaxed text-gray-400 font-medium">
              <p className="font-black text-white text-base uppercase tracking-wider">BikeHub Vietnam Corp.</p>
              <p className="opacity-80">
                Nền tảng giao dịch xe đạp trực tuyến hàng đầu - Nơi kết nối những tâm hồn đam mê tốc độ và sự bền bỉ.
              </p>
              <div className="space-y-4 pt-2">
                <p className="flex flex-col gap-1.5">
                  <span className="text-green-500 text-[10px] font-black uppercase tracking-[0.3em]">Trụ sở chính</span>
                  <span className="text-sm leading-snug">Tòa tháp Innovation, Công viên phần mềm Quang Trung, Quận 12, TP. Hồ Chí Minh</span>
                </p>
              </div>
            </div>

            <div className="pt-4">
              <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl text-[10px] font-black text-gray-400 tracking-widest uppercase shadow-inner">
                <ShieldCheck size={16} className="text-green-500" />
                Verified by Government
              </div>
            </div>
          </div>

          {/* CỘT 2: Hỗ trợ khách hàng */}
          <div className="space-y-10 lg:pl-10">
            <h5 className="font-black text-[11px] text-green-500 uppercase tracking-[0.4em]">Hỗ trợ khách hàng</h5>
            <div className="space-y-8">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-black mb-2 tracking-widest opacity-60">Hotline 24/7</p>
                <p className="font-black text-white text-3xl tracking-tighter">1900 1234</p>
              </div>
              <ul className="space-y-5 text-[14px] text-gray-400 font-medium">
                {['Câu hỏi thường gặp', 'Chính sách bảo hành', 'Quy trình kiểm định', 'Chính sách bảo mật'].map(item => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-all duration-300 flex items-center gap-3 group">
                      <ArrowRight size={14} className="text-green-600 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CỘT 3: Cơ hội hợp tác */}
          <div className="space-y-10 lg:pl-10">
            <h5 className="font-black text-[11px] text-green-500 uppercase tracking-[0.4em]">Cơ hội hợp tác</h5>
            <div className="bg-gradient-to-br from-green-600 to-green-700 p-8 rounded-[2.5rem] shadow-2xl shadow-green-900/20 group cursor-pointer hover:-translate-y-2 transition-all duration-500 border border-white/10">
              <div className="flex justify-between items-start mb-6">
                <PlusCircle size={30} className="text-white group-hover:rotate-90 transition-transform duration-500" />
                <span className="bg-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">New Partner</span>
              </div>
              <h6 className="text-lg font-black mb-2 leading-tight uppercase tracking-tight">Trở thành đối tác bán hàng</h6>
              <p className="text-xs text-green-100/70 mb-6 leading-relaxed">Tiếp cận hàng triệu khách hàng tiềm năng trên toàn quốc ngay hôm nay.</p>
              <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                Bắt đầu ngay <ArrowRight size={14} />
              </div>
            </div>
          </div>

          {/* CỘT 4: Kết nối cộng đồng */}
          <div className="space-y-10 lg:pl-10">
            <h5 className="font-black text-[11px] text-green-500 uppercase tracking-[0.4em]">Kết nối cộng đồng</h5>
            <div className="grid grid-cols-2 gap-3">
              {[Facebook, Instagram, Youtube, Linkedin].map((Icon, i) => (
                <div key={i} className="w-full h-16 bg-white/5 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-white hover:text-[#0f172a] transition-all duration-300 border border-white/5 group">
                  <Icon size={22} className="group-hover:scale-110 transition-transform" />
                </div>
              ))}
            </div>
            
            <div className="pt-8 border-t border-white/5 space-y-5">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Tải ứng dụng BikeHub</p>
              <div className="grid grid-cols-1 gap-3">
                <div className="w-full h-12 bg-black rounded-xl border border-white/10 flex items-center justify-center text-[10px] font-black tracking-widest hover:bg-gray-900 cursor-pointer transition-all uppercase">App Store</div>
                <div className="w-full h-12 bg-black rounded-xl border border-white/10 flex items-center justify-center text-[10px] font-black tracking-widest hover:bg-gray-900 cursor-pointer transition-all uppercase">Google Play</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Phần Copyright - Cũng thụt lùi đồng bộ */}
      <div className="py-10 bg-black/30 border-t border-white/5">
        <div className="content-layout flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] text-gray-500 font-black tracking-[0.4em] uppercase">
            © 2024 - 2026 BIKEHUB • PREMIUM ECOSYSTEM
          </p>
          <div className="flex gap-10 text-[9px] text-gray-600 font-black uppercase tracking-widest">
            <a href="#" className="hover:text-green-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-green-500 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-green-500 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}