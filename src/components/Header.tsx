import { Search, Plus, User } from 'lucide-react'
import '../styles/Header.css'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const navigate = useNavigate()
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
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
          <button className="btn-account" onClick={() => navigate('/login')}>
            <User size={20} />
            Tài Khoản
          </button>
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
