import { Search, ShoppingCart, ChevronDown, PlusCircle, Bike } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCart } from '../../contexts/CartContext'

export default function Header() {
  const navigate = useNavigate()
  const { items } = useCart()
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) setUser(JSON.parse(userStr))
  }, [])

  return (
    <header 
      className={`sticky top-0 z-[1000] w-full transition-all duration-500 flex items-center ${
        isScrolled 
          ? 'h-15 bg-green-700/95 backdrop-blur-md shadow-lg' 
          : 'h-15 bg-green-600' 
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-10 w-full flex items-center justify-between gap-12">
        
        {/* LOGO AREA - Kích thước cố định */}
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-5 cursor-pointer group flex-shrink-0"
        >
          <div className="bg-white p-4 rounded-3xl shadow-md transition-transform group-hover:scale-105">
            <Bike size={48} className="text-green-600" />
          </div>
          
          <div className="flex flex-col leading-tight">
            <span className="text-base font-black text-white tracking-tight uppercase">
              Bike<span className="text-green-200">Hub</span>
            </span>
            <span className="text-[7px] text-green-100 font-bold tracking-[0.3em] uppercase opacity-70">
              Premium Marketplace
            </span>
          </div>
        </div>

        {/* SEARCH BAR - Tinh chỉnh icon và cỡ chữ */}
        <div className="flex-1 max-w-2xl relative group">
          {/* Icon kính lúp đặt sát lề trái */}
          <Search 
            size={24} 
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-green-600 transition-colors z-10" 
          />
          
          <input 
            type="text" 
            placeholder="tìm kiếm mẫu xe, phụ kiện..." 
            className="w-full bg-white/10 border border-white/10 rounded-2xl py-6 pl-16 pr-8 text-white outline-none focus:bg-white focus:text-gray-900 transition-all font-black shadow-inner
                       text-3xl 
                       placeholder:text-xs placeholder:font-bold placeholder:text-white/40 placeholder:uppercase placeholder:tracking-widest"
          />
          {/* Giải thích các lớp mới:
            - text-3xl: Chữ bạn gõ vào sẽ cực to và rõ nét.
            - placeholder:text-xs: Chữ gợi ý nhỏ lại hẳn so với chữ gõ.
            - pl-16: Tạo khoảng trống vừa đủ để icon kính lúp nằm ngay cạnh chữ gợi ý.
            - placeholder:uppercase: Làm chữ gợi ý thanh thoát hơn.
          */}
        </div>

        {/* ACTIONS AREA */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/seller/dashboard')}
            className="hidden lg:flex items-center gap-2 bg-white/10 hover:bg-white text-white hover:text-green-700 px-6 py-3 rounded-xl text-xs font-bold border border-white/10 transition-all active:scale-95"
          >
            <PlusCircle size={18} /> Đăng bán
          </button>
          
          <button 
            onClick={() => navigate('/buyer/dashboard?tab=cart')} 
            className="relative text-white p-3 hover:bg-white/10 rounded-xl transition-all"
          >
            <ShoppingCart size={28} />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-md px-2 py-0.5 text-[10px] font-bold border-2 border-green-600 shadow-sm">
                {items.length}
              </span>
            )}
          </button>

          <div className="w-px h-12 bg-white/20 mx-2 hidden sm:block"></div>

          {user ? (
            <div 
              onClick={() => navigate('/buyer/dashboard')} 
              className="flex items-center gap-3 bg-white/10 p-2 pr-5 rounded-full cursor-pointer hover:bg-white/20 border border-white/5 transition-all"
            >
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center font-black text-white text-sm shadow-inner">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <ChevronDown size={16} className="text-white/50" />
            </div>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => navigate('/login')} className="text-white font-bold px-4 py-3 text-xs hover:text-green-100 transition-colors">
                Đăng nhập
              </button>
              <button onClick={() => navigate('/register')} className="bg-white text-green-700 px-6 py-3.5 rounded-xl font-bold text-xs shadow-lg hover:shadow-xl transition-all">
                Đăng ký
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}