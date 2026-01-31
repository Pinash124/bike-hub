import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../Header'
import Footer from '../Footer'
import { API_ENDPOINTS } from '../../api'

export default function SignUp() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [fullName, setFullName] = useState('')
  const [verificationToken, setVerificationToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      navigate('/user-info')
    }
  }, [navigate])

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email không hợp lệ')
      return
    }
    setLoading(true)
    try {
      const response = await fetch(API_ENDPOINTS.SEND_OTP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      if (!response.ok) {
        throw new Error('Không thể gửi OTP')
      }
      setStep(2)
    } catch (err) {
      setError('Lỗi khi gửi OTP. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!otp || otp.length < 4) {
      setError('OTP không hợp lệ')
      return
    }
    setLoading(true)
    try {
      const response = await fetch(API_ENDPOINTS.VERIFY_OTP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp }),
      })
      if (!response.ok) {
        throw new Error('OTP không đúng')
      }
      const data = await response.json()
      setVerificationToken(data.verificationToken) // Giả sử response có verificationToken
      setVerificationToken(data.result.verificationToken)
      setStep(3)
    } catch (err) {
      setError('Lỗi khi xác minh OTP. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  async function createPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Mật khẩu tối thiểu 6 ký tự')
      return
    }
    if (password !== confirm) {
      setError('Xác nhận mật khẩu không khớp')
      return
    }
    if (!fullName.trim()) {
      setError('Vui lòng nhập họ tên')
      return
    }
    setLoading(true)
    try {
      const response = await fetch(API_ENDPOINTS.REGISTRATION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationToken,
          password,
          fullName,
          role: 'BUYER',
        }),
      })
      if (!response.ok) {
        throw new Error('Không thể tạo tài khoản')
      }
      navigate('/login')
    } catch (err) {
      setError('Lỗi khi tạo tài khoản. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div style={{ maxWidth: 420, margin: '40px auto', padding: 20, border: '1px solid #eee', borderRadius: 8 }}>
        <h2 style={{ marginBottom: 6 }}>Đăng ký</h2>
        <div style={{ color: '#666', fontSize: 13, marginBottom: 16 }}>
          Bước {step}/3
        </div>
        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '8px 10px', borderRadius: 6, marginBottom: 12 }}>
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={sendOtp}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label>
                <div style={{ marginBottom: 6 }}>Nhập email</div>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="you@example.com" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 6 }} />
              </label>
              <button type="submit" disabled={loading} style={{ marginTop: 8, padding: '10px 14px', background: '#0ea5e9', color: 'white', border: 0, borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={verifyOtp}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label>
                <div style={{ marginBottom: 6 }}>Nhập mã OTP đã gửi tới {email}</div>
                <input value={otp} onChange={e => setOtp(e.target.value)} type="text" inputMode="numeric" placeholder="Nhập OTP" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 6 }} />
              </label>
              <button type="submit" disabled={loading} style={{ marginTop: 8, padding: '10px 14px', background: '#0ea5e9', color: 'white', border: 0, borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Đang xác minh...' : 'Xác minh'}
              </button>
              <button type="button" onClick={() => setStep(1)} style={{ padding: '8px 10px', background: 'transparent', color: '#0ea5e9', border: 'none', cursor: 'pointer' }}>
                Quay lại nhập email
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={createPassword}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label>
                <div style={{ marginBottom: 6 }}>Họ tên</div>
                <input value={fullName} onChange={e => setFullName(e.target.value)} type="text" required placeholder="Nhập họ tên" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 6 }} />
              </label>
              <label>
                <div style={{ marginBottom: 6 }}>Tạo mật khẩu</div>
                <input value={password} onChange={e => setPassword(e.target.value)} type="password" required placeholder="••••••••" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 6 }} />
              </label>
              <label>
                <div style={{ marginBottom: 6 }}>Xác nhận mật khẩu</div>
                <input value={confirm} onChange={e => setConfirm(e.target.value)} type="password" required placeholder="••••••••" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 6 }} />
              </label>
              <button type="submit" disabled={loading} style={{ marginTop: 8, padding: '10px 14px', background: '#16a34a', color: 'white', border: 0, borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
              </button>
            </div>
          </form>
        )}

        <div style={{ marginTop: 12 }}>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
      <Footer />
    </>
  )
}
