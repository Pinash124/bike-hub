// src/components/auth/Register.tsx
import { useState } from "react";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Phone,
  ShoppingBag,
  Store,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthCard, AuthOverlay } from "./AuthLayout";
import api from "../../api/axiosConfig";
import { useAuth } from "../../contexts/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // State mới cho việc chọn vai trò
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [stage, setStage] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError("Mật khẩu xác nhận không khớp");
    }

    try {
      setIsLoading(true);
      setError("");
      // Bước 1: Gọi API gửi OTP tới email (Swagger: POST /auth/send-otp)
      await api.post("/auth/send-otp", { email: formData.email });
      setSentEmail(formData.email);
      setStage("otp");
    } catch (err: any) {
      setError(err.response?.data?.message || "Gửi mã OTP thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return setError("Vui lòng nhập mã OTP");

    try {
      setOtpLoading(true);
      setError("");

      // Bước 2: Xác thực OTP (Swagger: POST /auth/verify-otp)
      const verifyResp = await api.post("/auth/verify-otp", { otp });
      const verificationToken = verifyResp?.data?.result?.verificationToken;
      if (!verificationToken)
        throw new Error("Không nhận được verification token từ server");

      // Bước 3: Sau khi OTP hợp lệ, tạo tài khoản (Swagger: POST /auth/registration)
      const roleMapping = role === "buyer" ? "BUYER" : "SELLER";
      await api.post("/auth/registration", {
        verificationToken,
        password: formData.password,
        fullName: formData.name,
        role: roleMapping,
      });

      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Xác thực OTP thất bại");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      setError("");
      await api.post("/auth/send-otp", { email: sentEmail || formData.email });
      setSentEmail(sentEmail || formData.email);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gửi lại mã OTP thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthOverlay>
      <AuthCard>
        <div className="flex flex-col items-center w-full antialiased">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-slate-900 uppercase">
              Đăng ký tài khoản
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              Chọn vai trò của bạn trên BikeHub
            </p>
          </div>

          {/* UI CHỌN VAI TRÒ */}
          <div className="grid grid-cols-2 gap-4 w-full mb-6">
            <button
              type="button"
              onClick={() => setRole("buyer")}
              className={`flex flex-col items-center p-4 rounded-3xl border-2 transition-all ${
                role === "buyer"
                  ? "border-green-500 bg-green-50 shadow-lg"
                  : "border-slate-100 bg-slate-50 opacity-60"
              }`}
            >
              <ShoppingBag
                size={20}
                className={
                  role === "buyer" ? "text-green-600" : "text-slate-400"
                }
              />
              <span
                className={`text-[10px] font-bold uppercase mt-2 ${role === "buyer" ? "text-green-700" : "text-slate-400"}`}
              >
                Người mua
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole("seller")}
              className={`flex flex-col items-center p-4 rounded-3xl border-2 transition-all ${
                role === "seller"
                  ? "border-green-500 bg-green-50 shadow-lg"
                  : "border-slate-100 bg-slate-50 opacity-60"
              }`}
            >
              <Store
                size={20}
                className={
                  role === "seller" ? "text-green-600" : "text-slate-400"
                }
              />
              <span
                className={`text-[10px] font-bold uppercase mt-2 ${role === "seller" ? "text-green-700" : "text-slate-400"}`}
              >
                Người bán
              </span>
            </button>
          </div>

          {error && (
            <div className="w-full mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold rounded-xl text-center uppercase">
              {error}
            </div>
          )}

          {stage === "form" && (
            <form className="w-full space-y-4" onSubmit={handleRegister}>
              <div className="flex items-center gap-4 bg-slate-50 border-2 border-transparent px-6 py-3.5 rounded-full focus-within:bg-white focus-within:border-green-500 transition-all group">
                <User
                  size={18}
                  className="text-slate-300 group-focus-within:text-green-500"
                />
                <input
                  value={formData.name}
                  className="flex-1 bg-transparent outline-none text-sm font-bold"
                  placeholder="Họ và tên"
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center gap-4 bg-slate-50 border-2 border-transparent px-6 py-3.5 rounded-full focus-within:bg-white focus-within:border-green-500 transition-all group">
                <Mail
                  size={18}
                  className="text-slate-300 group-focus-within:text-green-500"
                />
                <input
                  value={formData.email}
                  type="email"
                  className="flex-1 bg-transparent outline-none text-sm font-bold"
                  placeholder="Email"
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center gap-4 bg-slate-50 border-2 border-transparent px-6 py-3.5 rounded-full focus-within:bg-white focus-within:border-green-500 transition-all group">
                <Phone
                  size={18}
                  className="text-slate-300 group-focus-within:text-green-500"
                />
                <input
                  value={formData.phone}
                  className="flex-1 bg-transparent outline-none text-sm font-bold"
                  placeholder="Số điện thoại"
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center gap-4 bg-slate-50 border-2 border-transparent px-6 py-3.5 rounded-full focus-within:bg-white focus-within:border-green-500 transition-all group">
                <Lock
                  size={18}
                  className="text-slate-300 group-focus-within:text-green-500"
                />
                <input
                  value={formData.password}
                  type={showPassword ? "text" : "password"}
                  className="flex-1 bg-transparent outline-none text-sm font-bold"
                  placeholder="Mật khẩu"
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 border-2 border-transparent px-6 py-3.5 rounded-full focus-within:bg-white focus-within:border-green-500 transition-all group">
                <Lock
                  size={18}
                  className="text-slate-300 group-focus-within:text-green-500"
                />
                <input
                  value={formData.confirmPassword}
                  type="password"
                  className="flex-1 bg-transparent outline-none text-sm font-bold"
                  placeholder="Xác nhận mật khẩu"
                  required
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>

              <button
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-4 rounded-full font-black text-[11px] uppercase tracking-widest shadow-lg active:scale-95 transition-all flex justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Gửi mã xác thực qua email"
                )}
              </button>
            </form>
          )}

          {stage === "otp" && (
            <form className="w-full space-y-4" onSubmit={handleVerifyOtp}>
              <div className="text-sm text-slate-600 text-center">
                Mã xác thực đã được gửi tới <strong>{sentEmail}</strong>. Vui
                lòng kiểm tra email của bạn.
              </div>
              <div className="flex items-center gap-4 bg-slate-50 border-2 border-transparent px-6 py-3.5 rounded-full transition-all">
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm font-bold text-center"
                  placeholder="Nhập mã OTP"
                />
              </div>

              <button
                disabled={otpLoading}
                className="w-full bg-green-600 text-white py-4 rounded-full font-black text-[11px] uppercase tracking-widest shadow-lg active:scale-95 transition-all flex justify-center gap-2"
              >
                {otpLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Xác thực OTP và hoàn tất đăng ký"
                )}
              </button>

              <div className="flex gap-2 justify-center text-[12px]">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-green-600 font-bold"
                >
                  Gửi lại mã
                </button>
                <button
                  type="button"
                  onClick={() => setStage("form")}
                  className="text-slate-500"
                >
                  Chỉnh sửa thông tin
                </button>
              </div>
            </form>
          )}
        </div>
      </AuthCard>
    </AuthOverlay>
  );
}
