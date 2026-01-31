import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../Header'
import Footer from '../Footer'

export default function SignUp() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function sendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email không hợp lệ')
      return
    }
    // TODO: Call API gửi OTP tới email
    setStep(2)
  }

  function verifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!otp || otp.length < 4) {
      setError('OTP không hợp lệ')
      return
    }
    // TODO: Gọi API xác minh OTP
    setStep(3)
  }

  function createPassword(e: React.FormEvent) {
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
    // TODO: Gọi API tạo tài khoản với email + password
    navigate('/login')
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
              <button type="submit" style={{ marginTop: 8, padding: '10px 14px', background: '#0ea5e9', color: 'white', border: 0, borderRadius: 6, cursor: 'pointer' }}>
                Gửi mã OTP
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
              <button type="submit" style={{ marginTop: 8, padding: '10px 14px', background: '#0ea5e9', color: 'white', border: 0, borderRadius: 6, cursor: 'pointer' }}>
                Xác minh
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
                <div style={{ marginBottom: 6 }}>Tạo mật khẩu</div>
                <input value={password} onChange={e => setPassword(e.target.value)} type="password" required placeholder="••••••••" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 6 }} />
              </label>
              <label>
                <div style={{ marginBottom: 6 }}>Xác nhận mật khẩu</div>
                <input value={confirm} onChange={e => setConfirm(e.target.value)} type="password" required placeholder="••••••••" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 6 }} />
              </label>
              <button type="submit" style={{ marginTop: 8, padding: '10px 14px', background: '#16a34a', color: 'white', border: 0, borderRadius: 6, cursor: 'pointer' }}>
                Tạo tài khoản
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
