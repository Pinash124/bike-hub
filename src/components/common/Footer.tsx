import { Facebook, Bike, ShieldCheck, PlusCircle, Instagram, Youtube, Linkedin, ArrowRight } from 'lucide-react'
import { Container } from './Container' // Đảm bảo đường dẫn này đúng với project của bạn

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white mt-40 border-t border-white/5 w-full font-sans">
      
      {/* Sử dụng Container để thụt lề 2 bên chuẩn xác. 
          py-32 tạo khoảng trống trên dưới mênh mông, sang trọng.
      */}
      <Container className="py-32">
        
        {/* Grid nội dung với gap-20 để các cột cách xa nhau thoáng đạt */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 items-start">
          
          {/* CỘT 1: Thương hiệu & Pháp lý */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="bg-green-600 p-3 rounded-2xl shadow-xl shadow-green-900/40">
                <Bike size={30} strokeWidth={2} className="text-white" />
              </div>
              <h4 className="text-xl font-bold tracking-tight uppercase leading-none">
                BIKE<span className="text-green-500">HUB</span>
              </h4>
            </div>
            
            <div className="space-y-6 text-[14px] leading-relaxed text-gray-400 font-medium">
              <p className="font-bold text-white text-base tracking-wide">BikeHub Vietnam Corp.</p>
              <p className="opacity-80">
                Nền tảng giao dịch xe đạp trực tuyến hàng đầu - Nơi kết nối đam mê.
              </p>
              <div className="space-y-3 pt-2">
                <p className="flex flex-col gap-1.5">
                  <span className="text-green-500 text-[10px] font-bold uppercase tracking-[0.2em]">Trụ sở chính</span>
                  <span className="text-sm">Tòa tháp Innovation, Quận 12, TP. Hồ Chí Minh</span>
                </p>
              </div>
            </div>

            <div className="pt-2">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-semibold text-gray-400 tracking-wider uppercase">
                <ShieldCheck size={14} className="text-green-500" />
                Verified by Government
              </div>
            </div>
          </div>

          {/* CỘT 2: Hỗ trợ khách hàng */}
          <div className="space-y-14 lg:pl-10">
            <h5 className="font-bold text-[12px] text-green-500 uppercase tracking-[0.3em] pl-7">
              Hỗ trợ khách hàng
            </h5>
            
            <div className="space-y-14">
              <div className="pl-7">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-2 tracking-widest opacity-60">Hotline 24/7</p>
                <p className="font-bold text-white text-2xl tracking-tight">1900 1234</p>
              </div>

              <ul className="space-y-5 text-[14px] text-gray-400 font-medium">
                {['Câu hỏi thường gặp', 'Chính sách bảo hành', 'Quy trình kiểm định', 'Chính sách bảo mật'].map(item => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-all duration-300 flex items-center gap-3 group">
                      <div className="w-4 flex-shrink-0 flex items-center justify-center">
                        <ArrowRight 
                          size={12} 
                          className="text-green-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" 
                        />
                      </div>
                      <span className="transition-colors group-hover:text-white">{item}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CỘT 3: Cơ hội hợp tác */}
          <div className="space-y-10 lg:pl-10">
            <h5 className="font-bold text-[12px] text-green-500 uppercase tracking-[0.3em]">Cơ hội hợp tác</h5>
            
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 group cursor-pointer hover:bg-white/10 transition-all duration-500">
              <div className="flex justify-between items-start mb-8">
                <PlusCircle size={28} className="text-green-500 group-hover:rotate-90 transition-transform duration-500" />
              </div>
              
              <div className="inline-block bg-green-600/10 px-4 py-2 rounded-full mb-4">
                <h6 className="text-[12px] font-bold text-green-500 uppercase tracking-tight">Trở thành đối tác bán hàng</h6>
              </div>
              
              <p className="text-xs text-gray-400 mb-8 leading-relaxed">Tiếp cận hàng triệu khách hàng tiềm năng trên toàn quốc ngay hôm nay.</p>
              
              <div className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-7 py-3 rounded-full font-bold text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-green-600/20">
                Bắt đầu ngay <ArrowRight size={14} />
              </div>
            </div>
          </div>

          {/* CỘT 4: Kết nối cộng đồng */}
          <div className="space-y-10 lg:pl-10">
            <h5 className="font-bold text-[12px] text-green-500 uppercase tracking-[0.3em]">Kết nối cộng đồng</h5>
            
            <div className="flex flex-wrap gap-3">
              {[Facebook, Instagram, Youtube, Linkedin].map((Icon, i) => (
                <div key={i} className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center cursor-pointer hover:bg-green-600 hover:text-white transition-all border border-white/5">
                  <Icon size={20} strokeWidth={1.5} />
                </div>
              ))}
            </div>
            
            <div className="pt-8 border-t border-white/5 space-y-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Tải ứng dụng BikeHub</p>
              <div className="flex flex-col gap-2.5">
                <div className="w-full h-11 bg-black rounded-xl border border-white/10 flex items-center justify-center text-[10px] font-bold tracking-widest hover:bg-gray-900 cursor-pointer transition-all uppercase">App Store</div>
                <div className="w-full h-11 bg-black rounded-xl border border-white/10 flex items-center justify-center text-[10px] font-bold tracking-widest hover:bg-gray-900 cursor-pointer transition-all uppercase">Google Play</div>
              </div>
            </div>
          </div>

        </div>
      </Container>

      {/* Phần Copyright - Sử dụng Container để gióng hàng thẳng tắp với phía trên.
          py-8 tạo độ cao vừa vặn, tinh tế.
      */}
      <div className="py-8 bg-black/40 border-t border-white/5">
        <Container className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] text-gray-500 font-bold tracking-[0.3em] uppercase">
            © 2024 - 2026 BIKEHUB • PREMIUM ECOSYSTEM
          </p>
          <div className="flex gap-10 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-green-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-green-500 transition-colors">Terms</a>
            <a href="#" className="hover:text-green-500 transition-colors">Cookies</a>
          </div>
        </Container>
      </div>
    </footer>
  )
}