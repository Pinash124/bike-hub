// src/pages/ForgotPasswordPage.tsx
// Flow: Email → Gửi OTP → Nhập OTP (verify) → Nhập mật khẩu mới → Done
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../config/api";
import { Loader2, Mail, KeyRound, Lock, CheckCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";

type Step = "email" | "otp" | "newPassword" | "done";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await api.post(API_ENDPOINTS.SEND_FORGOT_OTP, { email });
      setStep("otp");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể gửi OTP. Vui lòng kiểm tra email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await api.post(API_ENDPOINTS.VERIFY_OTP, { otp });
      if (response.data?.code === 1000) {
        setVerificationToken(response.data.result.verificationToken);
        setStep("newPassword");
      } else {
        setError("OTP không hợp lệ hoặc đã hết hạn.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "OTP không đúng. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    setIsLoading(true);
    try {
      await api.put(API_ENDPOINTS.FORGOT_PASSWORD, { verificationToken, password });
      setStep("done");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const stepConfig = {
    email: { label: "Nhập email", step: 1 },
    otp: { label: "Xác nhận OTP", step: 2 },
    newPassword: { label: "Mật khẩu mới", step: 3 },
    done: { label: "Hoàn tất", step: 4 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Back button */}
          <button onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={16} /> Quay lại đăng nhập
          </button>

          {/* Progress dots */}
          <div className="flex items-center gap-2 mb-8">
            {["email", "otp", "newPassword", "done"].map((s, idx) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${
                idx < stepConfig[step].step ? "bg-green-500" : "bg-white/20"
              }`} />
            ))}
          </div>

          {step !== "done" && (
            <div className="mb-6">
              <h1 className="text-2xl font-black text-white">Quên mật khẩu</h1>
              <p className="text-slate-400 text-sm mt-1">
                {step === "email" && "Nhập email để nhận mã OTP xác nhận"}
                {step === "otp" && `Chúng tôi đã gửi OTP đến ${email}`}
                {step === "newPassword" && "Tạo mật khẩu mới cho tài khoản của bạn"}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Step 1: Email */}
          {step === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2 block">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="taikhoan@email.com"
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30"
                  />
                </div>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                {isLoading ? "Đang gửi..." : "Gửi mã OTP"}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2 block">Mã OTP</label>
                <div className="relative">
                  <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text" required value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="Nhập mã OTP"
                    maxLength={6}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30 tracking-widest text-center text-xl font-bold"
                  />
                </div>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                {isLoading ? "Đang xác nhận..." : "Xác nhận OTP"}
              </button>
              <button type="button" onClick={() => setStep("email")}
                className="w-full py-2 text-sm text-slate-400 hover:text-slate-300"
              >
                Gửi lại OTP
              </button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === "newPassword" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2 block">Mật khẩu mới</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"} required value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Ít nhất 6 ký tự"
                    className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30"
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2 block">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"} required value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                {isLoading ? "Đang lưu..." : "Đặt lại mật khẩu"}
              </button>
            </form>
          )}

          {/* Step 4: Done */}
          {step === "done" && (
            <div className="text-center py-6">
              <div className="mx-auto mb-6 w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle size={40} className="text-green-400" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Đặt lại thành công!</h2>
              <p className="text-slate-400 mb-8">Mật khẩu đã được cập nhật. Hãy đăng nhập lại.</p>
              <button onClick={() => navigate("/login")}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700"
              >
                Đăng nhập ngay
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
