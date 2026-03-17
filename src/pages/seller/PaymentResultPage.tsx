// src/pages/seller/PaymentResultPage.tsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Home, FileText, Loader2 } from "lucide-react";
import { paymentService } from "../../services/payment.service";

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // PayOS usually returns these in the URL redirect:
  // ?code=00&id=123&cancel=false&status=PAID&orderCode=123
  const paymentStatus = searchParams.get("status");
  const isCancel = searchParams.get("cancel") === "true";
  const hasCode = searchParams.get("code");
  const orderCode = searchParams.get("orderCode");
  const orderId = searchParams.get("orderId"); // Passed from frontend payload
  const pendingSubscriptionId = localStorage.getItem("pendingSubscriptionId");
  const pendingOrderListingId = localStorage.getItem("pendingOrderListingId");
  const isSubscriptionFlow = !!pendingSubscriptionId;
  const isOrderFlow = !isSubscriptionFlow || !!pendingOrderListingId;

  const baseSuccess = (() => {
    if (paymentStatus === "PAID" && !isCancel) return true;
    if (hasCode === "00" && !isCancel) return true;
    return false;
  })();

  const [displayStatus, setDisplayStatus] = useState<
    "success" | "failed" | "pending"
  >(baseSuccess ? "success" : isCancel ? "failed" : "pending");

  useEffect(() => {
    let isMounted = true;

    const verifyFromPayments = async () => {
      if (baseSuccess) {
        if (isMounted) setDisplayStatus("success");
        return;
      }
      if (isCancel) {
        if (isMounted) setDisplayStatus("failed");
        return;
      }

      try {
        const payments = await paymentService.getMyPayments();
        const match = pendingSubscriptionId
          ? payments.find(
              (p) => String(p.referenceId || "") === pendingSubscriptionId,
            )
          : payments.find((p) => p.type === "PAYMENT");

        const status = String(match?.status || "").toUpperCase();
        const isSuccessStatus = ["PAID", "SUCCESS", "COMPLETED"].includes(
          status,
        );
        const isFailedStatus = [
          "FAILED",
          "CANCELLED",
          "CANCELED",
          "REFUNDED",
          "EXPIRED",
        ].includes(status);

        if (!isMounted) return;

        if (isSuccessStatus) {
          setDisplayStatus("success");
          localStorage.removeItem("pendingSubscriptionId");
          localStorage.removeItem("pendingListingId");
          localStorage.removeItem("pendingOrderListingId");
        } else if (isFailedStatus) {
          setDisplayStatus("failed");
        } else {
          setDisplayStatus("pending");
        }
      } catch {
        if (isMounted) setDisplayStatus("pending");
      }
    };

    verifyFromPayments();
    return () => {
      isMounted = false;
    };
  }, [baseSuccess, isCancel]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div
        className={`w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border-t-8 ${displayStatus === "success" ? "border-green-500 shadow-green-500/10" : displayStatus === "failed" ? "border-red-500 shadow-red-500/10" : "border-amber-500 shadow-amber-500/10"}`}
      >
        <div className="p-10 text-center">
          <div
            className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6 animate-in zoom-in duration-500 ${displayStatus === "success" ? "bg-green-100 text-green-600" : displayStatus === "failed" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}
          >
            {displayStatus === "success" ? (
              <CheckCircle2 size={48} strokeWidth={2.5} />
            ) : displayStatus === "failed" ? (
              <XCircle size={48} strokeWidth={2.5} />
            ) : (
              <Loader2 size={48} className="animate-spin" />
            )}
          </div>

          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
            {displayStatus === "success"
              ? "Thanh toán thành công! 🎉"
              : displayStatus === "failed"
                ? "Thanh toán thất bại"
                : "Đang xác nhận thanh toán"}
          </h1>

          <p className="text-slate-500 font-medium text-lg mb-4">
            {displayStatus === "success"
              ? isSubscriptionFlow
                ? "Cảm ơn bạn đã thanh toán! Bài đăng đã được gửi đến Admin để xử lý kiểm định trước khi hiển thị."
                : "Thanh toán đặt cọc thành công. Bạn có thể theo dõi tiến trình giao dịch tại trang đơn hàng của tôi."
              : displayStatus === "failed"
                ? isSubscriptionFlow
                  ? "Giao dịch đã bị hủy hoặc xảy ra lỗi. Hệ thống chưa ghi nhận gói cước của bài đăng."
                  : "Giao dịch đặt cọc thất bại hoặc đã bị hủy. Vui lòng thử lại từ trang sản phẩm."
                : isOrderFlow
                  ? "Hệ thống đang xác nhận thanh toán đặt cọc. Bạn có thể chờ thêm hoặc vào trang đơn hàng để kiểm tra."
                  : isSubscriptionFlow
                    ? "Hệ thống đang xác nhận thanh toán. Bạn có thể chờ vài giây hoặc quay lại Dashboard để kiểm tra trạng thái."
                    : "Hệ thống đang xác nhận giao dịch."}
          </p>

          <div className="flex flex-col gap-2 mb-8">
            {orderId && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Mã đơn hàng
                </p>
                <p className="text-sm font-bold text-slate-700">{orderId}</p>
              </div>
            )}
            {orderCode && !orderId && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Mã giao dịch PayOS
                </p>
                <p className="text-sm font-bold text-slate-700">{orderCode}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() =>
                navigate(
                  isSubscriptionFlow ? "/seller/dashboard" : "/buyer/orders",
                )
              }
              className="w-full py-4 text-sm font-black text-white uppercase tracking-widest rounded-2xl bg-slate-900 hover:bg-slate-800 transition flex items-center justify-center gap-2"
            >
              <FileText size={18} />{" "}
              {isSubscriptionFlow
                ? "Quản lý xe của tôi"
                : "Xem đơn hàng của tôi"}
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full py-4 text-sm font-black text-slate-600 uppercase tracking-widest rounded-2xl bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center gap-2"
            >
              <Home size={18} /> Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
