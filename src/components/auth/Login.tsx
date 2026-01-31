import { Link, useNavigate } from 'react-router-dom'
import Header from '../Header'
import Footer from '../Footer'

export default function Login() {
  const navigate = useNavigate()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: integrate real auth. For now, redirect to home after login success.
    navigate('/')
  }

  function handleGoogleLogin() {
    // TODO: integrate Google OAuth (e.g., Firebase/Auth or Google Identity Services)
    // For now, just simulate success and redirect
    navigate('/')
  }

  return (
    <>
      <Header />
      <div style={{ maxWidth: 420, margin: '40px auto', padding: 20, border: '1px solid #eee', borderRadius: 8 }}>
        <h2 style={{ marginBottom: 16 }}>Đăng nhập</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label>
              <div style={{ marginBottom: 6 }}>Email</div>
              <input type="email" required placeholder="you@example.com" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 6 }} />
            </label>
            <label>
              <div style={{ marginBottom: 6 }}>Mật khẩu</div>
              <input type="password" required placeholder="••••••••" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 6 }} />
            </label>
            <button type="submit" style={{ marginTop: 8, padding: '10px 14px', background: '#0ea5e9', color: 'white', border: 0, borderRadius: 6, cursor: 'pointer' }}>
              Đăng nhập
            </button>
          </div>
        </form>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '16px 0' }}>
          <div style={{ height: 1, background: '#eee', flex: 1 }} />
          <span style={{ color: '#888', fontSize: 12 }}>hoặc</span>
          <div style={{ height: 1, background: '#eee', flex: 1 }} />
        </div>
        <button onClick={handleGoogleLogin} style={{ width: '100%', padding: '10px 14px', background: 'white', color: '#333', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <img alt="Google" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width={18} height={18} />
          Đăng nhập với Google
        </button>
        <div style={{ marginTop: 12 }}>
          Chưa có tài khoản? <Link to="/signup">Đăng ký</Link>
        </div>
      </div>
      <Footer />
    </>
  )
}
