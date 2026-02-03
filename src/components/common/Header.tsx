import { Search, ShoppingCart, ChevronDown, PlusCircle, Bike } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCart } from '../../contexts/CartContext'
import LoginModal from '../auth/Login'
import { Container } from './Container' // Đảm bảo bạn đã tạo file Container.tsx

export default function Header() {
  const navigate = useNavigate()
  const { items } = useCart()
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  // Xử lý hiệu ứng cuộn trang
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Kiểm tra user từ localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) setUser(JSON.parse(userStr))
  }, [])

  return (
    <>
      <header 
        className={`sticky top-0 z-[1000] w-full transition-all duration-500 flex items-center ${
          isScrolled 
            ? 'h-20 bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100' 
            : 'h-20 bg-green-600' 
        }`}
      >
        {/* Sử dụng Container thay thế cho content-layout để thụt lề 2 bên chuẩn xác */}
        <Container className="w-full flex items-center justify-between gap-12">
          
          {/* 1. LOGO AREA */}
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-4 cursor-pointer group flex-shrink-0"
          >
            <div className={`p-3 rounded-2xl shadow-lg transition-all duration-300 ${
              isScrolled ? 'bg-green-600 text-white' : 'bg-white text-green-600'
            }`}>
              <Bike size={32} strokeWidth={2} />
            </div>
            
            <div className="flex flex-col leading-tight">
              <span className={`text-xl font-bold tracking-tight uppercase transition-colors ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}>
                Bike<span className={isScrolled ? 'text-green-600' : 'text-green-200'}>Hub</span>
              </span>
              <span className={`text-[9px] font-bold tracking-[0.3em] uppercase opacity-60 ${
                isScrolled ? 'text-gray-500' : 'text-green-100'
              }`}>
                Premium Ecosystem
              </span>
            </div>
          </div>

          {/* 2. SEARCH BAR - Tinh chỉnh py-3.5 để cân đối với chiều cao mới */}
          <div className="hidden md:flex flex-1 max-w-xl relative group items-center">
            <Search 
              size={18} 
              className={`absolute left-6 transition-colors ${
                isScrolled ? 'text-gray-400' : 'text-white/50'
              }`} 
            />
            <input 
              type="text" 
              placeholder="Tìm kiếm mẫu xe, phụ kiện..." 
              className={`w-full rounded-full py-3.5 pl-14 pr-8 outline-none transition-all font-medium text-sm
                ${isScrolled 
                  ? 'bg-gray-100 border-transparent focus:bg-white focus:ring-4 focus:ring-green-500/10 text-gray-900' 
                  : 'bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:bg-white focus:text-gray-900 focus:placeholder:text-gray-400 focus:ring-4 focus:ring-white/20'
                }`}
            />
          </div>

          {/* 3. ACTIONS AREA */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/seller/dashboard')}
              className={`hidden lg:flex items-center gap-2 px-7 py-3 text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95 rounded-full ${
                isScrolled 
                  ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20' 
                  : 'bg-white text-green-700 hover:bg-green-50 shadow-xl shadow-black/5'
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
              <ShoppingCart size={26} strokeWidth={2} />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm">
                  {items.length}
                </span>
              )}
            </button>

            <div className={`w-px h-8 hidden sm:block ${isScrolled ? 'bg-gray-200' : 'bg-white/20'}`}></div>

            {user ? (
              <div 
                onClick={() => navigate('/buyer/dashboard')} 
                className={`flex items-center gap-3 p-1.5 pr-4 cursor-pointer transition-all border rounded-full ${
                  isScrolled ? 'bg-gray-50 border-gray-100 hover:border-green-200' : 'bg-white/10 border-white/10 hover:bg-white/20'
                }`}
              >
                <div className="w-9 h-9 bg-gradient-to-tr from-green-400 to-green-600 flex items-center justify-center font-bold text-white text-xs shadow-inner rounded-full">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <ChevronDown size={14} className={isScrolled ? 'text-gray-400' : 'text-white/50'} />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsLoginOpen(true)} 
                  className={`px-6 py-3 font-bold text-[11px] uppercase tracking-widest transition-all rounded-full ${
                    isScrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                  }`}
                >
                  Đăng nhập
                </button>
                <button 
                  onClick={() => navigate('/register')} 
                  className={`px-7 py-3.5 font-bold text-[11px] uppercase tracking-widest transition-all active:scale-95 rounded-full ${
                    isScrolled 
                      ? 'bg-gray-900 text-white hover:bg-black' 
                      : 'border-2 border-white text-white hover:bg-white hover:text-green-600'
                  }`}
                >
                  Đăng ký
                </button>
              </div>
            )}
          </div>
        </Container>
      </header>

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
    </>
  )
}