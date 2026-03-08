// src/components/auth/Login.tsx
import { useState } from "react";
import { User, Lock, Eye, EyeOff, X, Bike, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthOverlay, AuthCard } from "./AuthLayout";
import { useAuth } from "../../contexts/AuthContext";

interface LoginModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginModal({
  isOpen = true,
  onClose,
  onSwitchToRegister,
}: LoginModalProps) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Early return AFTER tất cả hooks
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!username.trim()) {
      setError("Vui lòng nhập email hoặc tên đăng nhập");
      return;
    }

    if (!password.trim()) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    try {
      setIsSubmitting(true);
      await login(username, password);

      await new Promise((resolve) => setTimeout(resolve, 100));

      if (onClose) onClose();

      const currentRole = localStorage.getItem("role")?.toLowerCase();
      let finalPath = "/";

      if (currentRole === "seller") {
        finalPath = "/seller/dashboard";
      } else if (currentRole === "buyer") {
        finalPath = "/profile";
      } else if (currentRole === "admin") {
        finalPath = "/admin/dashboard";
      } else if (currentRole === "inspector") {
        finalPath = "/inspector/dashboard";
      }

      navigate(finalPath, { replace: true });
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthOverlay>
      <AuthCard>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-red-500 rounded-full transition-all z-10"
          >
            <X size={20} />
          </button>
        )}

        <div className="flex flex-col items-center w-full antialiased">
          <div className="text-center mb-8">
            <div className="inline-flex bg-gradient-to-br from-green-600 to-emerald-600 p-4 rounded-3xl shadow-2xl shadow-green-200 mb-6">
              <Bike size={32} className="text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">
              Chào mừng trở lại
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Đăng nhập để tiếp tục trải nghiệm <span className="text-green-600 font-bold">BikeHub</span>
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="w-full mb-6 p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
              <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">{error}</p>
                <p className="text-xs text-red-600 mt-1">Kiểm tra lại thông tin đăng nhập của bạn</p>
              </div>
            </div>
          )}

          <form className="w-full space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                <User size={16} className="text-green-600" />
                Email hoặc Tên đăng nhập
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm font-medium"
                  type="text"
                  placeholder="Nhập email hoặc tên đăng nhập"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError("");
                  }}
                />
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Lock size={16} className="text-green-600" />
                Mật khẩu
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm font-medium"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu của bạn"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                />
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-green-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-2 border-slate-300 rounded focus:ring-green-500 focus:ring-2"
                />
                <span className="text-sm text-slate-600 font-medium group-hover:text-slate-800">
                  Ghi nhớ đăng nhập
                </span>
              </label>
              <button
                type="button"
                className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-wide shadow-xl shadow-green-200 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={20} />
                  <span>Đăng nhập ngay</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 w-full text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-600 mb-4">
              <span>Chưa có tài khoản?</span>
              <button
                onClick={() =>
                  onSwitchToRegister
                    ? onSwitchToRegister()
                    : navigate("/register")
                }
                className="text-green-600 hover:text-green-700 font-bold transition-colors underline underline-offset-2"
              >
                Đăng ký ngay
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Bằng việc đăng nhập, bạn đồng ý với 
              <a href="#" className="text-green-600 hover:underline mx-1">Điều khoản sử dụng</a>
              và 
              <a href="#" className="text-green-600 hover:underline mx-1">Chính sách bảo mật</a>
            </p>
          </div>
        </div>
      </AuthCard>
    </AuthOverlay>
  );
}
