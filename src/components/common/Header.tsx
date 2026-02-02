import { Search, User, LogOut, ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCart } from '../../contexts/CartContext'

export default function Header() {
  const navigate = useNavigate()
  const { items } = useCart()
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      setUser(JSON.parse(userStr))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  const handleAccountClick = () => {
    if (user) {
      navigate('/buyer/dashboard')
    } else {
      navigate('/login')
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 py-3 sticky top-0 z-1000">
      <div className="max-w-[1400px] mx-auto px-6 md:px-4 flex items-center justify-between gap-4">
        
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 cursor-pointer flex-shrink-0"
        >
          <span className="text-2xl">🚴</span>
          <span className="text-xl font-semibold text-green-600 hidden sm:inline">BikeHub</span>
        </div>

        <div className="flex-1 max-w-[400px] md:max-w-[300px] flex items-center gap-2 bg-green-50 rounded px-4 py-2">
          <Search size={18} className="text-green-600 flex-shrink-0" />
          <input 
            type="text" 
            placeholder="Search bikes..." 
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-500"
          />
        </div>

        <div className="flex gap-2 items-center flex-shrink-0">
          <button className="bg-green-600 text-white border-none px-4 py-2 rounded text-sm font-medium cursor-pointer hover:bg-green-700 transition">
            Sell
          </button>
          
          {user ? (
            <>
              <button 
                onClick={() => navigate('/buyer/dashboard?tab=cart')}
                title="Shopping Cart"
                className="relative border-none bg-transparent p-2 cursor-pointer text-green-600 flex items-center hover:text-green-700 transition"
              >
                <ShoppingCart size={18} />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold border-2 border-white shadow">
                    {items.length}
                  </span>
                )}
              </button>

              <div className="flex gap-2 items-center">
                <button 
                  onClick={handleAccountClick}
                  className="flex items-center gap-2 px-3 py-2 border-none bg-transparent cursor-pointer text-green-600 hover:text-green-700 transition"
                >
                  <User size={18} />
                  <span className="hidden sm:inline text-sm">{user.name}</span>
                </button>
                <button 
                  onClick={handleLogout}
                  title="Logout"
                  className="bg-transparent border-none p-2 cursor-pointer text-gray-500 flex items-center hover:text-gray-700 transition"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={() => navigate('/login')}
                className="px-3 py-2 border-none bg-transparent text-green-600 cursor-pointer hover:text-green-700 transition text-sm font-medium"
              >
                Login
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="px-3 py-2 border-none bg-transparent text-green-600 cursor-pointer hover:text-green-700 transition text-sm font-medium"
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
