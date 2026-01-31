import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { API_ENDPOINTS, refreshToken } from '../api'

interface UserInfo {
  id: string
  username: string
  name: string
  roles: Array<{
    name: string
    description: string
  }>
}

export default function UserInfo() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    // Load from localStorage first
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setLoading(false)
    }

    async function fetchUserInfo() {
      try {
        let response = await fetch(API_ENDPOINTS.MY_INFO, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        if (response.status === 401) {
          // Try refresh token
          const newToken = await refreshToken()
          if (newToken) {
            response = await fetch(API_ENDPOINTS.MY_INFO, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${newToken}`,
              },
            })
          }
        }
        if (!response.ok) {
          throw new Error('Không thể lấy thông tin người dùng')
        }
        const data = await response.json()
        setUser(data.result)
        localStorage.setItem('userInfo', JSON.stringify(data.result))
        localStorage.setItem('user', JSON.stringify(data.result))
      } catch (err) {
        // If fetch fails, keep the stored user if available
        if (!storedUser) {
          setError('Lỗi khi tải thông tin người dùng')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
  }, [navigate])

  async function handleLogout() {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        await fetch(API_ENDPOINTS.LOGOUT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })
      } catch (err) {
        // Ignore logout errors
      }
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userInfo')
    navigate('/login')
  }

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</div>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <div style={{ maxWidth: 420, margin: '40px auto', padding: 20, border: '1px solid #eee', borderRadius: 8 }}>
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '8px 10px', borderRadius: 6, marginBottom: 12 }}>
            {error}
          </div>
          <button onClick={() => navigate('/login')} style={{ padding: '10px 14px', background: '#0ea5e9', color: 'white', border: 0, borderRadius: 6, cursor: 'pointer' }}>
            Quay lại đăng nhập
          </button>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div style={{ maxWidth: 600, margin: '40px auto', padding: 20, border: '1px solid #eee', borderRadius: 8 }}>
        <h2 style={{ marginBottom: 16 }}>Thông tin người dùng</h2>
        {user && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><strong>ID:</strong> {user.id}</div>
            <div><strong>Username:</strong> {user.username}</div>
            <div><strong>Họ tên:</strong> {user.name}</div>
            <div><strong>Vai trò:</strong>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {user.roles.map((role, index) => (
                  <li key={index}>{role.name} - {role.description}</li>
                ))}
              </ul>
            </div>
            <button onClick={handleLogout} style={{ marginTop: 16, padding: '10px 14px', background: '#dc2626', color: 'white', border: 0, borderRadius: 6, cursor: 'pointer' }}>
              Đăng xuất
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}