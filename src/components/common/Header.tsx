import { Search, User, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import '../../styles/common/Header.css'

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
          <span className="logo-icon">🚴</span>
          <span className="logo-text">BikeHub</span>
        </div>
        
        <div className="search-bar">
          <Search size={18} />
          <input type="text" placeholder="Search bikes, brands..." />
        </div>

        <div className="header-actions">
          <button className="btn-sell">
            Sell
          </button>
          {user ? (
            <div className="user-menu">
              <button className="btn-account" onClick={handleAccountClick}>
                <User size={18} />
                <span>{user.name}</span>
              </button>
              <button className="btn-logout" onClick={handleLogout} title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="btn-login" onClick={() => navigate('/login')}>
                Login
              </button>
              <button className="btn-register" onClick={() => navigate('/register')}>
                Sign up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
