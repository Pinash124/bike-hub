import { Facebook, Mail, Bike, ShieldCheck, PlusCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-green-600 text-white mt-40 border-t border-white/10 w-full">
      <div className="w-full py-40">
        <div className="max-w-[1200px] mx-auto px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 items-start text-left">
            
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-10">
                <div className="bg-white p-2 rounded-xl">
                  <Bike size={32} className="text-green-600" />
                </div>
                <h4 className="text-2xl font-black tracking-tighter uppercase leading-none">
                  BIKE<span className="text-green-200">HUB</span>
                </h4>
              </div>
              <div className="space-y-4 text-[12px] leading-relaxed text-white/80 font-medium">
                <p className="font-black text-[13px] text-white uppercase tracking-wider">CÔNG TY CỔ PHẦN BIKEHUB VIỆT NAM</p>
                <p>Nền tảng giao dịch xe đạp trực tuyến - Không bán hàng</p>
                <p>Trụ sở chính: Tòa nhà BikeHub, Số 01 Đại lộ Thống Nhất, TP. Hồ Chí Minh</p>
                <p>Giấy chứng nhận đăng ký kinh doanh số 0106373516, cấp ngày 01/01/2024</p>
              </div>
              <div className="flex items-center gap-3 pt-8">
                <div className="bg-red-600 text-white px-3 py-2 rounded flex items-center gap-2 text-[10px] font-black uppercase border border-white/20 shadow-lg">
                  <div className="w-3 h-3 border-2 border-white rounded-full"></div>
                  BỘ CÔNG THƯƠNG
                </div>
                <div className="bg-[#1a1a1a] text-white px-3 py-2 rounded flex items-center gap-2 text-[10px] font-black uppercase border border-white/10">
                  <ShieldCheck size={14} className="text-green-400" />
                  DMCA PROTECTED
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <h5 className="font-bold text-[16px] text-white border-b border-white/10 pb-2 inline-block">Hỗ trợ khách hàng</h5>
              <div className="space-y-3 text-[13px]">
                <p className="opacity-80">Hotline: <span className="font-black text-white">1900 1234</span></p>
                <p className="opacity-80">Email: <span className="font-black text-white">hello@bikehub.vn</span></p>
              </div>
              <ul className="space-y-4 text-[13px] list-none p-0 text-white/70 font-medium">
                {['Các câu hỏi thường gặp', 'Chính sách bán hàng', 'Miễn trừ trách nhiệm', 'Chính sách bảo mật', 'Quy chế hoạt động sàn TMĐT'].map(item => (
                  <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            <div className="space-y-10">
              <h5 className="font-bold text-[16px] text-white border-b border-white/10 pb-2 inline-block">Hợp tác và liên kết</h5>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white py-4 px-5 rounded-xl flex items-center justify-center gap-4 transition-all shadow-xl group border border-white/10">
                <div className="bg-white/20 p-2 rounded-full group-hover:rotate-12 transition-transform">
                  <PlusCircle size={18} />
                </div>
                <div className="flex flex-col items-start leading-none text-left">
                  <span className="text-[11px] font-bold opacity-80 uppercase">Bán hàng cùng</span>
                  <span className="text-[15px] font-black uppercase tracking-tighter">BIKEHUB</span>
                </div>
              </button>
              <ul className="space-y-4 text-[13px] list-none p-0 text-white/70 font-medium pt-4">
                {['Giới thiệu về BikeHub', 'Tin tức', 'Kênh đối tác bán hàng'].map(item => (
                  <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            <div className="space-y-10">
              <h5 className="font-bold text-[16px] text-white border-b border-white/10 pb-2 inline-block">Kết nối với chúng tôi</h5>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors shadow-lg border border-white/10">
                  <Facebook size={26} fill="white" stroke="none" />
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors shadow-lg border border-white/10">
                  <Mail size={22} />
                </div>
              </div>
              <ul className="space-y-4 text-[13px] list-none p-0 text-white/70 font-medium pt-6">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">RSS Feed</a></li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      <div className="py-12 bg-black/10 border-t border-white/5">
        <div className="max-w-[1200px] mx-auto px-10">
          <p className="text-[12px] text-white/40 font-medium text-center tracking-widest uppercase">
            © 2024 - 2026 Bản quyền thuộc về Công ty cổ phần BikeHub Việt Nam
          </p>
        </div>
      </div>
    </footer>
  )
}