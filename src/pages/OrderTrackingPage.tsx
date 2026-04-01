import { useState, useEffect } from "react";
import OrderTracking from "../components/buyer/Orders/OrderTracking";
import type { Order as TrackingOrder } from "../components/buyer/Orders/OrderTracking";
import { orderService } from "../services/order.service";
import {
  paymentService,
  type PaymentResponse,
} from "../services/payment.service";
import { CreditCard, RefreshCw } from "lucide-react";

const toIsoDate = (value?: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();

  // Format: DD-MM-YYYY HH:mm
  const m = trimmed.match(
    /^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );
  if (m) {
    const [, dd, mm, yyyy, hh, min, ss] = m;
    const iso = `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss ?? "00"}`;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }

  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const mapOrderStatus = (
  status?: string,
  sellerStatus?: string,
): TrackingOrder["status"] => {
  const normalizedSeller = (sellerStatus || "").toUpperCase();
  const normalizedStatus = (status || "").toUpperCase();

  if (normalizedSeller === "REJECTED") {
    return normalizedStatus === "REFUND" ? "refunded" : "cancelled";
  }

  switch (normalizedStatus) {
    case "PENDING":
    case "PAID":
      return "processing";
    case "IN_TRANSIT":
      return "shipping";
    case "DELIVERED":
      return "pending_confirmation";
    case "CONFIRMED":
    case "COMPLETE":
      return "completed";
    case "REFUND":
      return "refunded";
    case "EXPIRED":
    case "CANCELLED":
    default:
      return "cancelled";
  }
};

const formatDeliveryAddress = (orderLocation?: {
  addressLine?: string;
  nameContact?: string;
  phoneContact?: string;
} | null) => {
  if (!orderLocation) return "Chưa có địa chỉ giao hàng";

  const lines = [
    orderLocation.nameContact?.trim(),
    orderLocation.phoneContact?.trim(),
    orderLocation.addressLine?.trim(),
  ].filter(Boolean);

  return lines.length > 0
    ? lines.join(" - ")
    : "Chưa có địa chỉ giao hàng";
};

export default function OrderTrackingPage() {
  const [orders, setOrders] = useState<TrackingOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "payments">("orders");
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const isPaymentSuccess = (status?: string) =>
    ["SUCCESS", "PAID", "COMPLETED"].includes(
      String(status || "").toUpperCase(),
    );

  const buyerPayments = payments.filter(
    (payment) =>
      payment.referenceType !== "SUBSCRIPTION" && payment.type !== "PAYOUT",
  );

  const totalSpent = buyerPayments
    .filter(
      (payment) =>
        payment.type === "PAYMENT" && isPaymentSuccess(payment.status),
    )
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);

  const totalRefunded = buyerPayments
    .filter(
      (payment) =>
        (payment.type === "REFUND" ||
          String(payment.status || "").toUpperCase() === "REFUNDED") &&
        ["SUCCESS", "REFUNDED", "PAID", "COMPLETED"].includes(
          String(payment.status || "").toUpperCase(),
        ),
    )
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);

  const getStatusLabel = (status?: string) => {
    switch (String(status || "").toUpperCase()) {
      case "SUCCESS":
      case "PAID":
      case "COMPLETED":
        return "Thành công";
      case "PENDING":
        return "Đang xử lý";
      case "REFUNDED":
        return "Đã hoàn";
      default:
        return "Thất bại";
    }
  };

  const getStatusClass = (status?: string) => {
    const normalized = String(status || "").toUpperCase();
    if (["SUCCESS", "PAID", "COMPLETED"].includes(normalized)) {
      return "bg-green-50 text-green-700 border border-green-200";
    }
    if (normalized === "PENDING") {
      return "bg-amber-50 text-amber-700 border border-amber-200";
    }
    if (normalized === "REFUNDED") {
      return "bg-sky-50 text-sky-700 border border-sky-200";
    }
    return "bg-red-50 text-red-700 border border-red-200";
  };

  const formatMoney = (amount: number) => `${amount.toLocaleString("vi-VN")} ₫`;

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const myOrders = await orderService.getMyOrders();

      const enrichedOrders: TrackingOrder[] = myOrders.map((order) => {
        const listing = order.listing;
        const bikeTitle =
          listing?.title || `Order #${order.id.slice(0, 8).toUpperCase()}`;
        const bikeImage = listing?.images?.[0]?.secureUrl || "";
        const total =
          typeof order.totalPrice === "number"
            ? order.totalPrice
            : listing?.price || 0;

        return {
          id: order.id,
          items: [
            {
              productName: bikeTitle,
              price: total,
              quantity: 1,
              image: bikeImage,
            },
          ],
          status: mapOrderStatus(
            order.orderStatus || order.status,
            order.sellerStatus,
          ),
          totalAmount: total,
          deliveryAddress: formatDeliveryAddress(order.orderLocation),
          createdAt: toIsoDate(order.createdAt) ?? new Date().toISOString(),
          estimatedDelivery:
            toIsoDate(order.expiresAt || order.createdAt) ??
            toIsoDate(order.createdAt) ??
            new Date().toISOString(),
        };
      });

      const sortedOrders = [...enrichedOrders].sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return timeB - timeA;
      });

      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders for tracking:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchPayments = async () => {
      setIsLoadingPayments(true);
      setPaymentError("");
      try {
        const data = await paymentService.getMyPayments();
        if (!mounted) return;
        setPayments(data);
      } catch (error) {
        console.error("Error fetching payment history:", error);
        if (mounted) {
          setPaymentError("Không thể tải lịch sử giao dịch.");
        }
      } finally {
        if (mounted) {
          setIsLoadingPayments(false);
        }
      }
    };

    fetchPayments();
    return () => {
      mounted = false;
    };
  }, []);

  const handleConfirmReceipt = async (orderId: string) => {
    try {
      await orderService.claimOrder(orderId);
      fetchOrders();
      alert("Đã xác nhận nhận hàng thành công!");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Xác nhận nhận hàng thất bại.";
      alert(message);
    }
  };

  const handleRequestReturn = (orderId: string) => {
    console.log("Requesting return for order:", orderId);
    alert("Yêu cầu trả hàng đã được gửi. Quản trị viên sẽ xem xét.");
  };

  if (isLoading && activeTab === "orders") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-slate-400 font-bold animate-pulse">
          ĐANG TẢI ĐƠN HÀNG...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-3 border border-slate-200 inline-flex gap-2">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 rounded-2xl text-sm font-bold transition-colors ${
            activeTab === "orders"
              ? "bg-green-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Lịch sử đơn hàng
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          className={`px-4 py-2 rounded-2xl text-sm font-bold transition-colors ${
            activeTab === "payments"
              ? "bg-green-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Lịch sử giao dịch
        </button>
      </div>

      {activeTab === "orders" ? (
        <OrderTracking
          orders={orders}
          onConfirmReceipt={handleConfirmReceipt}
          onRequestReturn={handleRequestReturn}
        />
      ) : (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard size={24} className="text-green-600" />
            <h2 className="text-2xl font-black text-green-600">
              Lịch sử giao dịch
            </h2>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
                Tiền mua hàng
              </p>
              <p className="mt-2 text-2xl font-black text-emerald-900">
                {formatMoney(totalSpent)}
              </p>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-sky-700">
                Tiền đã hoàn
              </p>
              <p className="mt-2 text-2xl font-black text-sky-900">
                {formatMoney(totalRefunded)}
              </p>
            </div>
          </div>

          {paymentError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {paymentError}
            </div>
          )}

          {isLoadingPayments ? (
            <div className="flex items-center justify-center py-12 text-slate-500">
              <RefreshCw size={18} className="mr-2 animate-spin" />
              Đang tải lịch sử giao dịch...
            </div>
          ) : buyerPayments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
              Chưa có giao dịch phù hợp.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Mã GD</th>
                    <th className="px-4 py-3 text-left font-semibold">Loại</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Số tiền
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Thời gian tạo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {buyerPayments.map((payment) => (
                    <tr
                      key={payment.paymentId}
                      className="border-t border-slate-100"
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">
                        #{payment.paymentId}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {payment.type}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {formatMoney(payment.amount || 0)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(payment.status)}`}
                        >
                          {getStatusLabel(payment.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {payment.createAt || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
