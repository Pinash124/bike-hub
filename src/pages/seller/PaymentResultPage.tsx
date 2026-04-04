// src/pages/seller/PaymentResultPage.tsx
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Home, FileText, Loader2 } from "lucide-react";
import { paymentService } from "../../services/payment.service";

const PAID_LISTING_IDS_KEY = "paidListingIds";
const SCHEDULED_LISTING_IDS_KEY = "scheduledInspectionListingIds";

const readListByKey = (key: string): string[] => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed.map((id) => String(id)) : [];
  } catch {
    return [];
  }
};

const removeListingFromKey = (key: string, listingId?: string | null) => {
  if (!listingId) return;
  const normalizedId = String(listingId);
  const filtered = readListByKey(key).filter((id) => id !== normalizedId);
  localStorage.setItem(key, JSON.stringify(filtered));
};

const markListingAsPaid = (listingId?: string | null) => {
  if (!listingId) return;
  try {
    const raw = localStorage.getItem(PAID_LISTING_IDS_KEY);
    const current = raw ? (JSON.parse(raw) as string[]) : [];
    if (!Array.isArray(current)) return;
    if (!current.includes(listingId)) {
      localStorage.setItem(
        PAID_LISTING_IDS_KEY,
        JSON.stringify([...current, listingId]),
      );
    }
    removeListingFromKey(SCHEDULED_LISTING_IDS_KEY, listingId);
  } catch {
    // Ignore local storage parse errors.
  }
};

export default function PaymentResultPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialSearchParamsRef = useRef<URLSearchParams | null>(null);
  if (!initialSearchParamsRef.current) {
    initialSearchParamsRef.current = new URLSearchParams(location.search);
  }
  const searchParams = initialSearchParamsRef.current;

  // PayOS thường trả các tham số qua URL redirect:
  // ?code=00&id=123&cancel=false&status=PAID&orderCode=123
  const paymentStatus = searchParams.get("status");
  const isCancel = searchParams.get("cancel") === "true";
  const hasCode = searchParams.get("code");
  const orderCode = searchParams.get("orderCode");
  const orderId = searchParams.get("orderId"); // Passed from frontend payload
  const flowRef = useRef<{
    pendingSubscriptionId: string | null;
    pendingListingId: string | null;
    pendingOrderListingId: string | null;
  } | null>(null);
  if (!flowRef.current) {
    flowRef.current = {
      pendingSubscriptionId: localStorage.getItem("pendingSubscriptionId"),
      pendingListingId: localStorage.getItem("pendingListingId"),
      pendingOrderListingId: localStorage.getItem("pendingOrderListingId"),
    };
  }

  const pendingSubscriptionId = flowRef.current.pendingSubscriptionId;
  const pendingListingId = flowRef.current.pendingListingId;
  const pendingOrderListingId = flowRef.current.pendingOrderListingId;

  const isSubscriptionFlow = !!pendingSubscriptionId || !!pendingListingId;
  const isOrderFlow = !isSubscriptionFlow || !!pendingOrderListingId;

  // Xác định trạng thái thành công nhanh dựa trên query params
  const baseSuccess = (() => {
    if (paymentStatus === "PAID" && !isCancel) return true;
    if (hasCode === "00" && !isCancel) return true;
    return false;
  })();

  const [displayStatus, setDisplayStatus] = useState<
    "success" | "failed" | "pending"
  >(baseSuccess ? "success" : isCancel ? "failed" : "pending");
  const canProceedAfterPayment = displayStatus === "success";

  useEffect(() => {
    // Chỉ đọc params ở lần đầu, sau đó làm sạch URL cho gọn
    if (location.search) {
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    let isMounted = true;

    const verifyFromPayments = async () => {
      // Nếu đã biết thành công từ query params thì không cần gọi API nữa
      if (baseSuccess) {
        if (pendingListingId) {
          markListingAsPaid(pendingListingId);
        }
        if (pendingSubscriptionId) {
          localStorage.removeItem("pendingSubscriptionId");
        }
        if (pendingListingId) {
          localStorage.removeItem("pendingListingId");
        }
        if (pendingOrderListingId) {
          localStorage.removeItem("pendingOrderListingId");
        }
        if (isMounted) setDisplayStatus("success");
        return;
      }
      if (isCancel) {
        if (isMounted) setDisplayStatus("failed");
        return;
      }

      try {
        // Trường hợp chưa rõ: gọi API để kiểm tra lịch sử thanh toán
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
          if (pendingListingId) {
            markListingAsPaid(pendingListingId);
          }
          localStorage.removeItem("pendingSubscriptionId");
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
  }, [baseSuccess, isCancel, pendingOrderListingId, pendingSubscriptionId]);

  useEffect(() => {
    if (displayStatus !== "success") return;
    const timer = window.setTimeout(() => {
      if (isSubscriptionFlow) {
        const schedulePath = pendingListingId
          ? `/seller/schedule?listingId=${encodeURIComponent(pendingListingId)}`
          : "/seller/dashboard";
        navigate(schedulePath, { replace: true });
        return;
      }

      navigate("/buyer/orders", { replace: true });
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [displayStatus, isSubscriptionFlow, navigate, pendingListingId]);

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
                ? "Thanh toán gói thành công. Bước tiếp theo là đặt lịch kiểm định bắt buộc cho bài đăng của bạn."
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
              onClick={() => {
                if (isSubscriptionFlow) {
                  localStorage.removeItem("pendingSubscriptionId");
                  localStorage.removeItem("pendingListingId");

                  if (canProceedAfterPayment) {
                    const schedulePath = pendingListingId
                      ? `/seller/schedule?listingId=${encodeURIComponent(pendingListingId)}`
                      : "/seller/dashboard";
                    navigate(schedulePath);
                    return;
                  }

                  const choosePlanPath = pendingListingId
                    ? `/seller/choose-plan/${encodeURIComponent(pendingListingId)}`
                    : "/seller/dashboard";
                  navigate(choosePlanPath);
                  return;
                }

                localStorage.removeItem("pendingOrderListingId");
                navigate("/buyer/orders");
              }}
              className="w-full py-4 text-sm font-black text-white uppercase tracking-widest rounded-2xl bg-slate-900 hover:bg-slate-800 transition flex items-center justify-center gap-2"
            >
              <FileText size={18} />{" "}
              {isSubscriptionFlow
                ? canProceedAfterPayment
                  ? "Đặt lịch kiểm định"
                  : "Quay lại thanh toán"
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
