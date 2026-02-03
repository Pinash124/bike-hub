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
          ? 'h-15 bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100' 
          : 'h-15 bg-green-600' 
      }`}
    >
      {/* Container thụt lùi 2 bên đồng nhất */}
      <div className="content-layout w-full flex items-center justify-between gap-12">
        
        {/* LOGO AREA */}
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-4 cursor-pointer group flex-shrink-0"
        >
          <div className={`p-3 rounded-full shadow-sm transition-all duration-300 ${
            isScrolled ? 'bg-green-600 text-white' : 'bg-white text-green-600'
          }`}>
            <Bike size={34} strokeWidth={2.5} />
          </div>
          
          <div className="flex flex-col leading-tight">
            {/* GIẢM kích thước chữ xuống text-lg */}
            <span className={`text-lg font-black tracking-tighter uppercase transition-colors ${
              isScrolled ? 'text-gray-900' : 'text-white'
            }`}>
              Bike<span className={isScrolled ? 'text-green-600' : 'text-green-200'}>Hub</span>
            </span>
            {/* GIẢM kích thước chữ xuống text-[8px] */}
            <span className={`text-[8px] font-black tracking-[0.3em] uppercase opacity-50 ${
              isScrolled ? 'text-gray-500' : 'text-green-100'
            }`}>
              Premium Marketplace
            </span>
          </div>
        </div>

        {/* SEARCH BAR - Tăng chiều cao lên py-7 */}
        <div className="hidden md:flex flex-1 max-w-2xl relative group items-center">

          <input 
            type="text" 
            placeholder="Tìm kiếm mẫu xe, phụ kiện..." 
            // Bo góc full (rounded-full) và tăng padding dọc (py-7)
            className={`w-full border rounded-full py-7 pl-16 pr-8 outline-none transition-all font-bold text-sm
              ${isScrolled 
                ? 'bg-gray-100 border-transparent focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/20 text-gray-900' 
                : 'bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white focus:text-gray-900 focus:placeholder:text-gray-400 focus:ring-4 focus:ring-white/20 shadow-inner'
              }`}
          />
        </div>

        {/* ACTIONS AREA */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/seller/dashboard')}
            className={`hidden lg:flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest transition-all active:scale-95 border rounded-full ${
              isScrolled 
                ? 'bg-green-600 border-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20' 
                : 'bg-white/10 border-white/20 text-white hover:bg-white hover:text-green-700'
            }`}
          >
            <PlusCircle size={18} /> Đăng bán
          </button>
          
          <button 
            onClick={() => navigate('/buyer/dashboard?tab=cart')} 
            className={`relative p-3 transition-all rounded-full ${
              isScrolled ? 'text-gray-800 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            }`}
          >
            <ShoppingCart size={28} />
            {items.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black border-2 border-white shadow-md">
                {items.length}
              </span>
            )}
          </button>

          <div className={`w-px h-10 hidden sm:block ${isScrolled ? 'bg-gray-200' : 'bg-white/20'}`}></div>

          {user ? (
            <div 
              onClick={() => navigate('/buyer/dashboard')} 
              className={`flex items-center gap-3 p-2 pr-5 cursor-pointer transition-all border rounded-full ${
                isScrolled ? 'bg-gray-50 border-gray-100 hover:border-green-200' : 'bg-white/10 border-white/10 hover:bg-white/20'
              }`}
            >
              <div className="w-10 h-10 bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center font-black text-white text-sm shadow-inner rounded-full">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <ChevronDown size={14} className={isScrolled ? 'text-gray-400' : 'text-white/50'} />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/login')} 
                className={`hidden sm:block font-black px-4 py-2 text-[11px] uppercase tracking-widest transition-colors ${
                  isScrolled ? 'text-gray-600 hover:text-green-600' : 'text-white hover:text-green-100'
                }`}
              >
                Đăng nhập
              </button>
              <button 
                onClick={() => navigate('/register')} 
                className={`px-7 py-3.5 font-black text-[11px] uppercase tracking-widest shadow-xl transition-all active:scale-95 rounded-full ${
                  isScrolled 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-white text-green-700 hover:bg-green-50'
                }`}
              >
                Đăng ký
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}