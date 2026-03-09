// src/components/auth/Login.tsx
import { useState } from "react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  X,
  Bike,
  Loader2,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Vui lòng nhập email hoặc tên đăng nhập");
      return;
    }

    if (!password.trim()) {
      setError("Vui lòng nhập mật khẩu");
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
            className="absolute top-6 right-6 rounded-full p-2 text-slate-400 transition-all hover:text-red-500 z-10"
          >
            <X size={20} />
          </button>
        )}

        <div className="flex w-full flex-col items-center antialiased">
          <div className="mb-8 text-center">
            <div className="mb-6 inline-flex rounded-3xl bg-gradient-to-br from-green-600 to-emerald-600 p-4 shadow-2xl shadow-green-200">
              <Bike size={32} className="text-white" />
            </div>
            <h2 className="mb-2 text-3xl font-black uppercase tracking-tight text-slate-900">
              Chào mừng trở lại
            </h2>
            <p className="text-sm font-medium text-slate-600">
              Đăng nhập để tiếp tục trải nghiệm{" "}
              <span className="font-bold text-green-600">BikeHub</span>
            </p>
          </div>

          {error && (
            <div className="mb-6 flex w-full items-start gap-3 rounded-2xl border-2 border-red-100 bg-red-50 p-4 animate-in slide-in-from-top-2 duration-300">
              <AlertTriangle
                size={18}
                className="mt-0.5 flex-shrink-0 text-red-500"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">{error}</p>
                <p className="mt-1 text-xs text-red-600">
                  Kiểm tra lại thông tin đăng nhập của bạn
                </p>
              </div>
            </div>
          )}

          <form className="w-full space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <User size={16} className="text-green-600" />
                Email hoặc Tên đăng nhập
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  className="w-full rounded-2xl border-2 border-slate-200 bg-white py-4 pl-12 pr-4 text-sm font-medium transition-all focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
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
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Lock size={16} className="text-green-600" />
                Mật khẩu
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  className="w-full rounded-2xl border-2 border-slate-200 bg-white py-4 pl-12 pr-12 text-sm font-medium transition-all focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 transition-colors hover:text-green-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <label className="group flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-2 border-slate-300 text-green-600 focus:ring-2 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800">
                  Ghi nhớ đăng nhập
                </span>
              </label>
              <button
                type="button"
                className="text-sm font-medium text-green-600 transition-colors hover:text-green-700"
              >
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-xl shadow-green-200 transition-all hover:from-green-700 hover:to-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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
            <div className="mb-4 flex items-center justify-center gap-2 text-sm text-slate-600">
              <span>Chưa có tài khoản?</span>
              <button
                onClick={() =>
                  onSwitchToRegister
                    ? onSwitchToRegister()
                    : navigate("/register")
                }
                className="font-bold text-green-600 underline underline-offset-2 transition-colors hover:text-green-700"
              >
                Đăng ký ngay
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Bằng việc đăng nhập, bạn đồng ý với
              <a href="#" className="mx-1 text-green-600 hover:underline">
                Điều khoản sử dụng
              </a>
              và
              <a href="#" className="mx-1 text-green-600 hover:underline">
                Chính sách bảo mật
              </a>
            </p>
          </div>
        </div>
      </AuthCard>
    </AuthOverlay>
  );
}
