import { Search, Plus, User, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import '../styles/Header.css'

export default function Header() {
  const navigate = useNavigate()
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
      // Navigate to buyer dashboard by default
      navigate('/buyer/dashboard')
    } else {
      navigate('/login')
    }
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <h1>🚴 BikeHub</h1>
          <p>Mua - Bán Xe Đạp Cũ Uy Tín</p>
        </div>
        
        <div className="search-bar">
          <Search size={20} />
          <input type="text" placeholder="Tìm kiếm xe đạp, hãng, giá..." />
        </div>

        <div className="header-actions">
          <button className="btn-sell">
            <Plus size={20} />
            Đăng Bán
          </button>
          {user ? (
            <div className="user-menu">
              <button className="btn-account" onClick={handleAccountClick}>
                <User size={20} />
                {user.name}
              </button>
              <button className="btn-logout" onClick={handleLogout} title="Đăng xuất">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="btn-login" onClick={() => navigate('/login')}>
                Đăng Nhập
              </button>
              <button className="btn-register" onClick={() => navigate('/register')}>
                Đăng Ký
              </button>
            </div>
          )}
        </div>
      </div>

      <nav className="nav-menu">
        <a href="#" className="nav-item active">Trang Chủ</a>
        <a href="#" className="nav-item">Xe Đạp Thường</a>
        <a href="#" className="nav-item">Xe Đạp Địa Hình</a>
        <a href="#" className="nav-item">Xe Đạp Tốc Độ</a>
        <a href="#" className="nav-item">Xe Đạp Điện</a>
        <a href="#" className="nav-item">Phụ Tùng</a>
        <a href="#" className="nav-item">Tin Tức</a>
      </nav>
    </header>
  )
}
