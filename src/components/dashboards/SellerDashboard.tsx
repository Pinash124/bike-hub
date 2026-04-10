// src/components/dashboards/SellerDashboard.tsx
// Role: SELLER — shows real listings from API + inspection status
import {
  Plus,
  TrendingUp,
  Package,
  CreditCard,
  Bike,
  Calendar,
  RefreshCw,
  Search,
  Trash2,
  BarChart3,
  DollarSign,
  CheckCircle2,
  XCircle,
  MapPin,
  User,
  Phone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { listingService, type Listing } from "../../services/listing.service";
import { orderService, type Order } from "../../services/order.service";
import {
  inspectionService,
  type InspectionTask,
} from "../../services/inspection.service";
import { subscriptionService } from "../../services/subscription.service";
import { planService } from "../../services/plan.service";
import {
  paymentService,
  type PaymentResponse,
} from "../../services/payment.service";

const parseApiDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const trimmed = value.trim();
  const m = trimmed.match(
    /^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );
  if (m) {
    const [, dd, mm, yyyy, hh, min, ss] = m;
    const iso = `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss ?? "00"}`;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d;
};

const toMonthKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const isRevenueOrder = (order: Order): boolean => {
  const normalizedStatus = String(order.orderStatus || "").toUpperCase();
  if (
    ["IN_TRANSIT", "DELIVERED", "COMPLETE", "COMPLETED", "CONFIRMED"].includes(
      normalizedStatus,
    )
  ) {
    return true;
  }

  // PAID orders only count as revenue after seller has accepted processing.
  return normalizedStatus === "PAID" && order.sellerStatus === "ACCEPTED";
};

const PAID_LISTING_IDS_KEY = "paidListingIds";
const SCHEDULED_LISTING_IDS_KEY = "scheduledInspectionListingIds";

type SubscriptionFlowStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "PENDING_PAYMENT"
  | "PENDING"
  | null;

const readListingIdsByKey = (key: string): Set<string> => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.map((v) => String(v)));
  } catch {
    return new Set();
  }
};

const syncFlowMarkers = (listings: Listing[]) => {
  try {
    const flowIds = new Set(
      listings
        .filter(
          (listing) => listing.status === "DRAFT" || listing.status === "PAID",
        )
        .map((listing) => String(listing.id)),
    );

    const paidIds = Array.from(
      readListingIdsByKey(PAID_LISTING_IDS_KEY),
    ).filter((id) => flowIds.has(id));
    localStorage.setItem(PAID_LISTING_IDS_KEY, JSON.stringify(paidIds));

    const scheduledIds = Array.from(
      readListingIdsByKey(SCHEDULED_LISTING_IDS_KEY),
    ).filter((id) => flowIds.has(id));
    localStorage.setItem(
      SCHEDULED_LISTING_IDS_KEY,
      JSON.stringify(scheduledIds),
    );
  } catch {
    // Ignore marker sync errors.
  }
};

const getEffectiveListingStatus = (
  listing: Listing,
): Listing["status"] | "PLAN_PURCHASED" | "INSPECTION_PENDING" => {
  if (listing.status === "SCHEDULED") {
    return "INSPECTION_PENDING";
  }

  if (listing.status === "PAID") {
    return "PLAN_PURCHASED";
  }

  return listing.status;
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  DRAFT: {
    label: "Nháp",
    color: "text-slate-700",
    bg: "bg-slate-100",
    border: "border-slate-200",
    icon: "📝",
  },
  REJECT: {
    label: "Từ chối",
    color: "text-red-700",
    bg: "bg-red-100",
    border: "border-red-200",
    icon: "❌",
  },
  PENDING: {
    label: "Chờ duyệt",
    color: "text-amber-700",
    bg: "bg-amber-100",
    border: "border-amber-200",
    icon: "⏳",
  },
  RESERVED: {
    label: "Đã đặt cọc",
    color: "text-blue-700",
    bg: "bg-blue-100",
    border: "border-blue-200",
    icon: "💰",
  },
  PLAN_PURCHASED: {
    label: "Đã mua gói",
    color: "text-sky-700",
    bg: "bg-sky-100",
    border: "border-sky-200",
    icon: "💳",
  },
  INSPECTION_PENDING: {
    label: "Chờ kiểm định",
    color: "text-cyan-700",
    bg: "bg-cyan-100",
    border: "border-cyan-200",
    icon: "🛠️",
  },
  INSPECTED: {
    label: "Đã kiểm định",
    color: "text-violet-700",
    bg: "bg-violet-100",
    border: "border-violet-200",
    icon: "🔍",
  },
  REJECTED: {
    label: "Bị từ chối",
    color: "text-red-700",
    bg: "bg-red-100",
    border: "border-red-200",
    icon: "❌",
  },
  APPROVED: {
    label: "Đã duyệt",
    color: "text-indigo-700",
    bg: "bg-indigo-100",
    border: "border-indigo-200",
    icon: "✅",
  },
  LIVE: {
    label: "Đang bán",
    color: "text-emerald-700",
    bg: "bg-emerald-100",
    border: "border-emerald-200",
    icon: "🚀",
  },
  SOLD: {
    label: "Đã bán",
    color: "text-slate-500",
    bg: "bg-slate-100",
    border: "border-slate-200",
    icon: "🎉",
  },
};

/** Format API date strings like "02-04-2026 00:36" to display format */
const formatApiDate = (dateStr?: string): string => {
  if (!dateStr) return "";
  const trimmed = dateStr.trim();
  const m = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2}))?$/);
  if (m) {
    const [, dd, mm, yyyy] = m;
    return `${dd}-${mm}-${yyyy}`;
  }
  return dateStr;
};

const formatApiDateTime = (dateStr?: string): string => {
  if (!dateStr) return "Chưa có lịch";
  const parsed = parseApiDate(dateStr);
  if (!parsed) return dateStr;
  return parsed.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export default function SellerDashboard() {
  const navigate = useNavigate();
  const user = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "{}"),
    [],
  );
  const [listings, setListings] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [activeTab, setActiveTab] = useState<
    "listings" | "orders" | "payments" | "payouts" | "revenue"
  >("listings");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState<
    "all" | "pending" | "completed"
  >("all");
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high">(
    "newest",
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [paidListingIds, setPaidListingIds] = useState<Set<string>>(() =>
    readListingIdsByKey(PAID_LISTING_IDS_KEY),
  );
  const [scheduledListingIds, setScheduledListingIds] = useState<Set<string>>(
    () => readListingIdsByKey(SCHEDULED_LISTING_IDS_KEY),
  );
  const [subscriptionStatusByListing, setSubscriptionStatusByListing] =
    useState<Record<string, SubscriptionFlowStatus>>({});
  const [inspectionByListing, setInspectionByListing] = useState<
    Record<string, InspectionTask | null>
  >({});
  const [isDeliverModalOpen, setIsDeliverModalOpen] = useState(false);
  const [deliverOrderId, setDeliverOrderId] = useState<string | null>(null);
  const [deliverFile, setDeliverFile] = useState<File | null>(null);
  const [deliverPreviewUrl, setDeliverPreviewUrl] = useState<string | null>(
    null,
  );
  const [deliverError, setDeliverError] = useState<string | null>(null);
  const [isDelivering, setIsDelivering] = useState(false);
  const deliverInputRef = useRef<HTMLInputElement | null>(null);
  const [monthFilter, setMonthFilter] = useState(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${mm}`;
  });

  const fetchAllData = async () => {
    try {
      const [listingsData, ordersData] = await Promise.all([
        listingService.getMyListings(),
        orderService.getMyOrders(),
      ]);

      const myPayments = await paymentService.getMyPayments().catch(() => []);

      const paymentFlowListingIds = listingsData
        .filter(
          (listing) => listing.status === "DRAFT" || listing.status === "PAID",
        )
        .map((listing) => String(listing.id));

      if (paymentFlowListingIds.length > 0) {
        const subscriptionChecks = await Promise.all(
          paymentFlowListingIds.map(async (listingId) => {
            const sub = await subscriptionService
              .getSubscriptionByListingId(listingId)
              .catch(() => null);
            return {
              listingId,
              subStatus: (sub?.status as SubscriptionFlowStatus) ?? null,
            };
          }),
        );

        setSubscriptionStatusByListing(
          subscriptionChecks.reduce<Record<string, SubscriptionFlowStatus>>(
            (acc, row) => {
              acc[row.listingId] = row.subStatus;
              return acc;
            },
            {},
          ),
        );

        const purchasedBySubscription = new Set(
          subscriptionChecks
            .filter(
              (row) => String(row.subStatus || "").toUpperCase() === "ACTIVE",
            )
            .map((row) => row.listingId),
        );

        if (purchasedBySubscription.size > 0) {
          const mergedPaid = new Set([
            ...Array.from(readListingIdsByKey(PAID_LISTING_IDS_KEY)),
            ...Array.from(purchasedBySubscription),
          ]);
          localStorage.setItem(
            PAID_LISTING_IDS_KEY,
            JSON.stringify(Array.from(mergedPaid)),
          );
        }
      } else {
        setSubscriptionStatusByListing({});
      }

      // Fetch subscriptions for LIVE listings to display plan info
      const liveListings = listingsData.filter(
        (listing) => listing.status === "LIVE",
      );
      if (liveListings.length > 0) {
        const plans = await planService.getAllPlans().catch(() => []);

        await Promise.all(
          liveListings.map(async (listing) => {
            const sub = await subscriptionService
              .getSubscriptionByListingId(String(listing.id))
              .catch(() => null);

            if (sub) {
              const enrichedSub = sub as typeof sub & {
                plan?: { id?: number | string; name?: string };
                expiredDate?: string;
              };
              const safePlanId = Number(
                enrichedSub.plan?.id || enrichedSub.planId,
              );
              const plan =
                enrichedSub.plan ||
                plans.find((p) => Number(p.id) === safePlanId);

              listing.subscription = {
                ...enrichedSub,
                expiredDate: enrichedSub.endDate || enrichedSub.expiredDate,
                plan: plan || {
                  name: `Gói Đăng Ký ${safePlanId ? "#" + safePlanId : ""}`,
                },
              } as any;
            }
          }),
        );
      }

      const scheduledListings = listingsData.filter(
        (listing) => listing.status === "SCHEDULED",
      );
      if (scheduledListings.length > 0) {
        const inspectionRows = await Promise.all(
          scheduledListings.map(async (listing) => {
            const listingId = String(listing.id);
            const inspection = await inspectionService
              .getInspectionByListing(listingId)
              .catch(() => null);
            return { listingId, inspection };
          }),
        );

        setInspectionByListing(
          inspectionRows.reduce<Record<string, InspectionTask | null>>(
            (acc, row) => {
              acc[row.listingId] = row.inspection;
              return acc;
            },
            {},
          ),
        );
      } else {
        setInspectionByListing({});
      }

      syncFlowMarkers(listingsData);
      setListings(listingsData);
      setPaidListingIds(readListingIdsByKey(PAID_LISTING_IDS_KEY));
      setScheduledListingIds(readListingIdsByKey(SCHEDULED_LISTING_IDS_KEY));
      // Filter orders where current user is seller
      setOrders(ordersData.filter((o) => o.seller?.id === user.id));
      setPayments(myPayments);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setPaidListingIds(readListingIdsByKey(PAID_LISTING_IDS_KEY));
    setScheduledListingIds(readListingIdsByKey(SCHEDULED_LISTING_IDS_KEY));
    setIsRefreshing(true);
    await fetchAllData();
    setIsRefreshing(false);
  };

  const resetDeliverState = () => {
    if (deliverPreviewUrl) {
      URL.revokeObjectURL(deliverPreviewUrl);
    }
    setDeliverFile(null);
    setDeliverPreviewUrl(null);
    setDeliverError(null);
    setIsDelivering(false);
    setDeliverOrderId(null);
  };

  const openDeliverModal = (orderId: string) => {
    resetDeliverState();
    setDeliverOrderId(orderId);
    setIsDeliverModalOpen(true);
  };

  const closeDeliverModal = () => {
    setIsDeliverModalOpen(false);
    resetDeliverState();
  };

  const handleDeliverFile = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setDeliverError("Vui lòng chọn file ảnh (JPG, PNG, WEBP).");
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setDeliverError("Ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.");
      return;
    }
    if (deliverPreviewUrl) {
      URL.revokeObjectURL(deliverPreviewUrl);
    }
    setDeliverError(null);
    setDeliverFile(file);
    setDeliverPreviewUrl(URL.createObjectURL(file));
  };

  const handleDeliverSubmit = async () => {
    if (!deliverOrderId || !deliverFile) {
      setDeliverError("Bạn cần tải lên ảnh trước khi xác nhận.");
      return;
    }
    try {
      setIsDelivering(true);
      await orderService.deliverOrder(deliverOrderId, deliverFile);
      await handleRefresh();
      closeDeliverModal();
    } catch (err) {
      console.error("Deliver order failed:", err);
      setDeliverError("Tải ảnh thất bại. Vui lòng thử lại.");
      setIsDelivering(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    setPaidListingIds(readListingIdsByKey(PAID_LISTING_IDS_KEY));
    setScheduledListingIds(readListingIdsByKey(SCHEDULED_LISTING_IDS_KEY));
  }, []);

  const filteredAndSortedListings = useMemo(() => {
    let filtered = listings;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (l) =>
          getEffectiveListingStatus(l) ===
          (statusFilter as
            | Listing["status"]
            | "PLAN_PURCHASED"
            | "INSPECTION_PENDING"),
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (l) =>
          l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.brand?.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Sort
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "newest":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });
  }, [
    listings,
    paidListingIds,
    scheduledListingIds,
    subscriptionStatusByListing,
    statusFilter,
    searchQuery,
    sortBy,
  ]);

  const liveCount = listings.filter((l) => l.status === "LIVE").length;
  const soldCount = orders.filter((o) => isRevenueOrder(o)).length;
  const totalRevenue = orders
    .filter((o) => isRevenueOrder(o))
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const pendingOrdersCount = orders.filter(
    (o) =>
      o.sellerStatus === "PENDING" ||
      (o.orderStatus === "PAID" &&
        o.sellerStatus !== "ACCEPTED" &&
        o.sellerStatus !== "REJECTED" &&
        o.sellerStatus !== "CANCELLED"),
  ).length;

  const selectedMonthRevenue = useMemo(() => {
    return orders
      .filter((o) => {
        const orderDate = parseApiDate(o.createdAt);
        if (!orderDate) return false;
        return toMonthKey(orderDate) === monthFilter && isRevenueOrder(o);
      })
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  }, [monthFilter, orders]);

  const lastSixMonthsRevenue = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }).map((_, idx) => {
      const offset = 5 - idx;
      const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const monthKey = toMonthKey(monthDate);
      const monthLabel = `T${monthDate.getMonth() + 1}`;

      const monthValue = orders
        .filter((o) => {
          const orderDate = parseApiDate(o.createdAt);
          if (!orderDate) return false;
          return toMonthKey(orderDate) === monthKey && isRevenueOrder(o);
        })
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      return { label: monthLabel, value: monthValue, key: monthKey };
    });
  }, [orders]);

  const maxSixMonthRevenue = useMemo(() => {
    return Math.max(...lastSixMonthsRevenue.map((item) => item.value), 1);
  }, [lastSixMonthsRevenue]);

  const subscriptionPayments = payments.filter(
    (payment) =>
      payment.referenceType === "SUBSCRIPTION" && payment.type === "PAYMENT",
  );

  const payoutPayments = payments.filter(
    (payment) => payment.type === "PAYOUT",
  );

  const sellerCompletedPackageAmount = subscriptionPayments
    .filter((payment) =>
      ["SUCCESS", "PAID", "COMPLETED"].includes(
        String(payment.status || "").toUpperCase(),
      ),
    )
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);

  const sellerReceivedPayoutAmount = payoutPayments
    .filter((payment) =>
      ["SUCCESS", "PAID", "COMPLETED"].includes(
        String(payment.status || "").toUpperCase(),
      ),
    )
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);

  const getPaymentStatusLabel = (status?: string) => {
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

  const getPaymentStatusClass = (status?: string) => {
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

  const getOrderStatusLabel = (status?: string) => {
    switch ((status || "").toUpperCase()) {
      case "IN_TRANSIT":
        return "Đang giao xe";
      case "DELIVERED":
        return "Đã giao - chờ buyer xác nhận";
      case "CONFIRMED":
      case "COMPLETE":
      case "COMPLETED":
        return "Hoàn tất";
      case "PAID":
        return "Đã thanh toán - chờ giao";
      case "PENDING":
        return "Chờ seller xác nhận";
      case "REJECT":
      case "REJECTED":
        return "Đã từ chối";
      case "EXPIRED":
        return "Hết hạn";
      case "REFUND":
        return "Đã hoàn tiền";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status || "—";
    }
  };

  const stats = [
    {
      label: "Xe đang bán",
      value: liveCount.toString(),
      icon: Package,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      targetTab: "listings" as const,
      targetFilter: "LIVE",
    },
    {
      label: "Yêu cầu đặt cọc",
      value: pendingOrdersCount.toString(),
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-100",
      targetTab: "orders" as const,
      targetFilter: "pending",
    },
    {
      label: "Xe đã bán",
      value: soldCount.toString(),
      icon: TrendingUp,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
      targetTab: "listings" as const, // We use listings tab for "Xe đã bán" based on soldCount logic
      targetFilter: "SOLD",
    },
    {
      label: "Doanh thu",
      value: `${totalRevenue.toLocaleString("vi-VN")} ₫`,
      icon: DollarSign,
      color: "text-purple-600",
      bg: "bg-purple-100",
      targetTab: "revenue" as const,
      targetFilter: "all",
    },
  ];

  const handleStatClick = (stat: (typeof stats)[0]) => {
    setActiveTab(stat.targetTab);
    if (stat.targetTab === "listings") {
      setStatusFilter(stat.targetFilter);
    } else if (stat.targetTab === "orders") {
      setOrderStatusFilter(stat.targetFilter as any);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 pb-32 pt-8 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <BarChart3 size={24} className="text-white" />
                </div>
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                  Seller Dashboard
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-2">
                Bảng Điều Khiển
              </h1>
              <p className="text-green-100 text-lg font-medium">
                Chào mừng trở lại,{" "}
                <span className="font-bold text-white">
                  {user.name || "Người bán"}
                </span>
                ! 👋
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
              >
                <RefreshCw
                  size={18}
                  className={isRefreshing ? "animate-spin" : ""}
                />
                Làm mới
              </button>
              <button
                className="flex items-center gap-2 bg-white hover:bg-green-50 text-green-700 px-6 py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-green-900/20 transition-all active:scale-95"
                onClick={() => navigate("/seller/new-bike")}
              >
                <Plus size={18} strokeWidth={2.5} />
                Đăng Tin Mới
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 space-y-8 relative z-10">
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const isActive = activeTab === stat.targetTab;
            return (
              <div
                key={stat.label}
                onClick={() => handleStatClick(stat)}
                className={`group cursor-pointer rounded-3xl p-6 shadow-lg border transition-all duration-300 hover:-translate-y-1 ${
                  isActive
                    ? "bg-white border-green-500 ring-2 ring-green-500/10 shadow-green-900/5 scale-[1.02]"
                    : "bg-white border-slate-100 hover:shadow-xl hover:border-green-200"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon size={28} className={stat.color} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-black text-slate-800">
                    {isLoading ? "..." : stat.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Listings Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex gap-4 border-b-2 border-slate-100 w-full mb-4">
                <button
                  onClick={() => setActiveTab("listings")}
                  className={`pb-3 text-lg font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === "listings" ? "border-green-600 text-green-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                >
                  <Bike size={24} /> Bài đăng của tôi
                </button>
                <button
                  onClick={() => setActiveTab("revenue")}
                  className={`pb-3 text-lg font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === "revenue" ? "border-green-600 text-green-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                >
                  <BarChart3 size={24} /> Doanh Thu
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`pb-3 text-lg font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === "orders" ? "border-green-600 text-green-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                >
                  <Package size={24} /> Quản Lý Đơn Hàng
                  {pendingOrdersCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {pendingOrdersCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("payments")}
                  className={`pb-3 text-lg font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === "payments" ? "border-green-600 text-green-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                >
                  <CreditCard size={24} /> Lịch Sử Mua Gói
                </button>
                <button
                  onClick={() => setActiveTab("payouts")}
                  className={`pb-3 text-lg font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === "payouts" ? "border-green-600 text-green-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                >
                  <DollarSign size={24} /> Lịch Sử Nhận Tiền
                </button>
              </div>
            </div>

            {activeTab === "listings" && (
              <>
                {/* Search and Filters */}
                <div className="mt-6 flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm theo tên xe, thương hiệu..."
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="LIVE">Đang bán</option>
                      <option value="SOLD">Đã bán</option>
                      <option value="PENDING">Chờ duyệt</option>
                      <option value="REJECT">Từ chối</option>
                      <option value="PLAN_PURCHASED">Đã mua gói</option>
                      <option value="INSPECTION_PENDING">Chờ kiểm định</option>
                      <option value="APPROVED">Đã duyệt</option>
                      <option value="DRAFT">Nháp</option>
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                    >
                      <option value="newest">Mới nhất</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="p-8">
            {activeTab === "listings" && (
              <>
                {isLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-4 border-green-200 animate-spin"></div>
                      <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-green-600 animate-spin"></div>
                    </div>
                    <p className="text-base font-medium text-slate-600">
                      Đang tải danh sách xe...
                    </p>
                  </div>
                ) : filteredAndSortedListings.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                      <Bike size={48} className="text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-3">
                      {searchQuery || statusFilter !== "all"
                        ? "Không tìm thấy xe nào"
                        : "Chưa có xe nào được đăng"}
                    </h3>
                    <p className="text-slate-600 text-base mt-2 max-w-md leading-relaxed">
                      {searchQuery || statusFilter !== "all"
                        ? "Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác."
                        : "Hãy bắt đầu hành trình bán hàng của bạn bằng cách đăng chiếc xe đầu tiên lên BikeHub."}
                    </p>
                    <button
                      onClick={() => navigate("/seller/new-bike")}
                      className="mt-8 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl font-bold text-sm uppercase tracking-wider transition-all shadow-lg hover:shadow-xl"
                    >
                      Đăng xe đầu tiên
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredAndSortedListings.map((listing) => {
                      const thumbnail = listing.images?.[0]?.secureUrl;
                      const effectiveStatus =
                        getEffectiveListingStatus(listing);
                      const config =
                        STATUS_CONFIG[effectiveStatus] || STATUS_CONFIG.DRAFT;
                      const needsPayment = effectiveStatus === "DRAFT";
                      const needsInspectionSchedule =
                        effectiveStatus === "PLAN_PURCHASED";
                      const waitingInspection =
                        effectiveStatus === "INSPECTION_PENDING";
                      const inspectionDetail =
                        inspectionByListing[String(listing.id)] || null;

                      return (
                        <div
                          key={listing.id}
                          className="group border border-slate-200 rounded-3xl overflow-hidden hover:border-green-300 hover:shadow-2xl transition-all duration-300 bg-white"
                        >
                          {/* Image Section */}
                          <div className="relative h-48 bg-slate-100 overflow-hidden">
                            {thumbnail ? (
                              <img
                                src={thumbnail}
                                alt={listing.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-slate-100 to-slate-200">
                                🚴
                              </div>
                            )}

                            {/* Status Badge */}
                            <div className="absolute top-4 left-4">
                              <span
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-sm ${config.bg} ${config.color} ${config.border}`}
                              >
                                <span className="text-lg">{config.icon}</span>
                                {config.label}
                              </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white transition-colors shadow-lg">
                                <Trash2 size={16} className="text-red-500" />
                              </button>
                            </div>

                            {listing.status === "SOLD" && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="bg-slate-800 text-white text-sm font-bold px-4 py-2 rounded-full uppercase tracking-widest">
                                  Đã bán
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Content Section */}
                          <div className="p-6">
                            <div className="mb-4">
                              <h3
                                className="font-bold text-lg text-slate-800 mb-2 line-clamp-2"
                                title={listing.title}
                              >
                                {listing.title}
                              </h3>
                              <div className="flex items-center justify-between">
                                <p className="text-2xl font-black text-green-600">
                                  {listing.price.toLocaleString("vi-VN")} ₫
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                              <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600">
                                <Package size={12} className="text-slate-400" />
                                {listing.brand?.name || "Khác"}
                              </span>
                              {listing.usageDuration != null && (
                                <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600">
                                  <Calendar
                                    size={12}
                                    className="text-slate-400"
                                  />
                                  {listing.usageDuration} năm
                                </span>
                              )}
                            </div>

                            {/* Subscription plan info for LIVE listings */}
                            {listing.status === "LIVE" &&
                              listing.subscription && (
                                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-emerald-600 text-sm">
                                      ✨
                                    </span>
                                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                                      Gói đang hoạt động
                                    </span>
                                    {listing.subscription.status ===
                                      "ACTIVE" && (
                                      <span className="ml-auto text-[10px] font-black bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                                        Active
                                      </span>
                                    )}
                                  </div>
                                  {listing.subscription.plan?.name && (
                                    <p className="text-sm font-semibold text-slate-800">
                                      {listing.subscription.plan.name}
                                      {listing.subscription.plan
                                        .durationDays && (
                                        <span className="text-xs font-normal text-slate-500 ml-1">
                                          (
                                          {
                                            listing.subscription.plan
                                              .durationDays
                                          }{" "}
                                          ngày)
                                        </span>
                                      )}
                                    </p>
                                  )}
                                  {listing.subscription.expiredDate && (
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      <span className="font-medium text-red-600">
                                        Expired:
                                      </span>{" "}
                                      {formatApiDate(
                                        listing.subscription.expiredDate,
                                      )}
                                    </p>
                                  )}
                                </div>
                              )}

                            {needsPayment && (
                              <div className="border-t border-amber-100 pt-4">
                                <div className="mb-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-700 font-medium">
                                  Vui lòng mua gói để kích hoạt bài đăng.
                                </div>
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/seller/choose-plan/${listing.id}`,
                                      { state: { listing } },
                                    )
                                  }
                                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                >
                                  Đăng bài
                                </button>
                              </div>
                            )}

                            {needsInspectionSchedule && (
                              <div className="border-t border-cyan-100 pt-4">
                                <div className="mb-3 p-3 bg-cyan-50 rounded-xl border border-cyan-200 text-xs text-cyan-700 font-medium">
                                  ✅ Tin đã mua gói thành công. Vui lòng đặt
                                  lịch kiểm định để chuyển sang bước tiếp theo.
                                </div>
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/seller/schedule?listingId=${encodeURIComponent(String(listing.id))}`,
                                      {
                                        state: {
                                          listingId: String(listing.id),
                                        },
                                      },
                                    )
                                  }
                                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-700 hover:to-sky-700 text-white font-bold rounded-xl text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                >
                                  Chọn Lịch Kiểm Định
                                </button>
                              </div>
                            )}

                            {waitingInspection && (
                              <div className="border-t border-indigo-100 pt-4">
                                {(inspectionDetail?.scheduledAt ||
                                  inspectionDetail?.location?.addressLine) && (
                                  <div className="space-y-2 rounded-xl border border-indigo-200 bg-white p-3 text-xs text-slate-700">
                                    {inspectionDetail?.scheduledAt && (
                                      <div className="flex items-start gap-2">
                                        <Calendar
                                          size={14}
                                          className="mt-0.5 text-indigo-500"
                                        />
                                        <span>
                                          <span className="font-semibold text-slate-800">
                                            Thời gian kiểm định:
                                          </span>{" "}
                                          {formatApiDateTime(
                                            inspectionDetail.scheduledAt,
                                          )}
                                        </span>
                                      </div>
                                    )}

                                    {inspectionDetail?.location
                                      ?.addressLine && (
                                      <div className="flex items-start gap-2">
                                        <MapPin
                                          size={14}
                                          className="mt-0.5 text-indigo-500"
                                        />
                                        <span>
                                          <span className="font-semibold text-slate-800">
                                            Địa chỉ kiểm định:
                                          </span>{" "}
                                          {
                                            inspectionDetail.location
                                              .addressLine
                                          }
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {activeTab === "orders" && (
              <div className="space-y-4">
                {/* Orders Filter */}
                <div className="flex items-center gap-4 mb-2 overflow-x-auto pb-2">
                  {[
                    { id: "all", label: "Tất cả đơn" },
                    { id: "pending", label: "Cần xử lý" },
                    { id: "completed", label: "Đã hoàn tất" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setOrderStatusFilter(f.id as any)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        orderStatusFilter === f.id
                          ? "bg-green-600 text-white shadow-md"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {orders.filter((o) => {
                  if (orderStatusFilter === "all") return true;
                  if (orderStatusFilter === "pending") {
                    return (
                      o.sellerStatus === "PENDING" ||
                      (o.orderStatus === "PAID" &&
                        o.sellerStatus !== "ACCEPTED" &&
                        o.sellerStatus !== "REJECTED" &&
                        o.sellerStatus !== "CANCELLED")
                    );
                  }
                  if (orderStatusFilter === "completed") {
                    return ["COMPLETED", "COMPLETE", "CONFIRMED"].includes(
                      o.orderStatus as any,
                    );
                  }
                  return true;
                }).length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    Chưa có đơn hàng nào trong mục này.
                  </div>
                ) : (
                  orders
                    .filter((o) => {
                      if (orderStatusFilter === "all") return true;
                      if (orderStatusFilter === "pending") {
                        return (
                          o.sellerStatus === "PENDING" ||
                          (o.orderStatus === "PAID" &&
                            o.sellerStatus !== "ACCEPTED" &&
                            o.sellerStatus !== "REJECTED" &&
                            o.sellerStatus !== "CANCELLED")
                        );
                      }
                      if (orderStatusFilter === "completed") {
                        return ["COMPLETED", "COMPLETE", "CONFIRMED"].includes(
                          o.orderStatus as any,
                        );
                      }
                      return true;
                    })
                    .map((order) => {
                      const isActionRequired =
                        order.sellerStatus === "PENDING" ||
                        (order.orderStatus === "PAID" &&
                          order.sellerStatus !== "ACCEPTED" &&
                          order.sellerStatus !== "REJECTED");

                      return (
                        <div
                          key={order.id}
                          className={`relative border rounded-3xl p-6 transition-all duration-300 ${
                            isActionRequired
                              ? "border-amber-200 bg-amber-50/30 shadow-lg shadow-amber-900/5 ring-1 ring-amber-100"
                              : "border-slate-100 bg-white hover:border-green-200"
                          }`}
                        >
                          {isActionRequired && (
                            <div className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                              Cần xử lý
                            </div>
                          )}
                          <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                            <div>
                              <p className="text-sm text-slate-400">
                                Mã đơn:{" "}
                                <strong className="text-slate-700">
                                  {order.id.slice(0, 8).toUpperCase()}
                                </strong>
                              </p>
                              <p className="text-lg font-bold text-slate-800 mt-1">
                                {order.listing?.title || "Xe đạp"}
                              </p>
                              <p className="text-sm text-slate-500 mt-1">
                                Ngày mua:{" "}
                                {parseApiDate(
                                  order.createdAt,
                                )?.toLocaleDateString("vi-VN") || "—"}
                              </p>
                              <p className="text-sm text-slate-500 mt-1">
                                Trạng thái đơn:{" "}
                                <span className="font-semibold text-slate-700">
                                  {getOrderStatusLabel(order.orderStatus)}
                                </span>
                              </p>
                              <div className="mt-3 space-y-1.5">
                                <p className="text-sm text-slate-500 flex items-start gap-2">
                                  <MapPin
                                    size={14}
                                    className="text-slate-400 mt-0.5 shrink-0"
                                  />
                                  <span>
                                    Địa chỉ giao xe:{" "}
                                    <span className="font-semibold text-slate-700">
                                      {order.orderLocation?.addressLine ||
                                        "Chưa có địa chỉ"}
                                    </span>
                                  </span>
                                </p>
                                {order.orderLocation?.nameContact && (
                                  <p className="text-sm text-slate-500 flex items-center gap-2">
                                    <User
                                      size={14}
                                      className="text-slate-400"
                                    />
                                    <span>
                                      Người nhận:{" "}
                                      <span className="font-semibold text-slate-700">
                                        {order.orderLocation.nameContact}
                                      </span>
                                    </span>
                                  </p>
                                )}
                                {order.orderLocation?.phoneContact && (
                                  <p className="text-sm text-slate-500 flex items-center gap-2">
                                    <Phone
                                      size={14}
                                      className="text-slate-400"
                                    />
                                    <span>
                                      SĐT nhận:{" "}
                                      <span className="font-semibold text-slate-700">
                                        {order.orderLocation.phoneContact}
                                      </span>
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-black text-green-600">
                                {(order.totalPrice / 1000000).toFixed(1)}M
                              </p>
                              <p className="text-sm font-bold mt-1 text-slate-500">
                                Status:{" "}
                                <span className="text-blue-600 uppercase">
                                  {order.sellerStatus || order.status}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3 justify-end items-center">
                            {(order.sellerStatus === "PENDING" ||
                              (order.orderStatus === "PAID" &&
                                order.sellerStatus !== "ACCEPTED" &&
                                order.sellerStatus !== "REJECTED")) && (
                              <>
                                <div className="flex-1 w-full sm:w-auto h-px bg-slate-100 hidden sm:block"></div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                  <button
                                    onClick={async () => {
                                      if (
                                        await orderService.acceptOrder(order.id)
                                      )
                                        handleRefresh();
                                    }}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg shadow-emerald-900/10 active:scale-95"
                                  >
                                    <CheckCircle2 size={18} />
                                    Chấp nhận
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (
                                        await orderService.rejectOrder(order.id)
                                      )
                                        handleRefresh();
                                    }}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-red-600 border-2 border-red-50 px-6 py-2.5 rounded-xl font-bold hover:bg-red-50 transition-all active:scale-95"
                                  >
                                    <XCircle size={18} />
                                    Từ chối
                                  </button>
                                </div>
                              </>
                            )}
                            {order.orderStatus === "IN_TRANSIT" && (
                              <button
                                onClick={() => openDeliverModal(order.id)}
                                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-700"
                              >
                                Xác nhận đã giao xe
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            )}

            {activeTab === "payments" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-indigo-700">
                      Lịch sử mua gói
                    </p>
                    <p className="mt-2 text-2xl font-black text-indigo-900">
                      {subscriptionPayments.length} giao dịch
                    </p>
                  </div>
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-green-700">
                      Tiền gói đã hoàn thành
                    </p>
                    <p className="mt-2 text-2xl font-black text-green-900">
                      {sellerCompletedPackageAmount.toLocaleString("vi-VN")} ₫
                    </p>
                  </div>
                </div>

                {subscriptionPayments.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    Chưa có giao dịch mua gói nào.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">
                            Mã GD
                          </th>
                          <th className="px-4 py-3 text-left font-semibold">
                            Loại
                          </th>
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
                        {subscriptionPayments.map((payment) => (
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
                              {(payment.amount || 0).toLocaleString("vi-VN")} ₫
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getPaymentStatusClass(payment.status)}`}
                              >
                                {getPaymentStatusLabel(payment.status)}
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

            {activeTab === "payouts" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
                      Lịch sử nhận tiền
                    </p>
                    <p className="mt-2 text-2xl font-black text-emerald-900">
                      {payoutPayments.length} giao dịch
                    </p>
                  </div>
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-green-700">
                      Tiền đã nhận
                    </p>
                    <p className="mt-2 text-2xl font-black text-green-900">
                      {sellerReceivedPayoutAmount.toLocaleString("vi-VN")} ₫
                    </p>
                  </div>
                </div>

                {payoutPayments.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    Chưa có giao dịch nhận tiền nào.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">
                            Mã GD
                          </th>
                          <th className="px-4 py-3 text-left font-semibold">
                            Nguồn
                          </th>
                          <th className="px-4 py-3 text-left font-semibold">
                            Số tiền
                          </th>
                          <th className="px-4 py-3 text-left font-semibold">
                            Trạng thái
                          </th>
                          <th className="px-4 py-3 text-left font-semibold">
                            Thời gian nhận
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {payoutPayments.map((payment) => (
                          <tr
                            key={payment.paymentId}
                            className="border-t border-slate-100"
                          >
                            <td className="px-4 py-3 font-medium text-slate-800">
                              #{payment.paymentId}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {payment.referenceType || "ORDER"}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-900">
                              {(payment.amount || 0).toLocaleString("vi-VN")} ₫
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getPaymentStatusClass(payment.status)}`}
                              >
                                {getPaymentStatusLabel(payment.status)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {payment.paidAt || payment.createAt || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "revenue" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Monthly Revenue Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 mb-1">
                      Phân Tích Doanh Thu
                    </h2>
                    <p className="text-sm text-slate-500 font-medium tracking-tight">
                      Xem chi tiết hiệu quả bán hàng theo thời gian
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Chọn tháng xem:
                      </span>
                      <input
                        type="month"
                        value={monthFilter}
                        onChange={(e) => setMonthFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 font-black text-slate-700 transition-all cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* All-time */}
                  <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 p-8 rounded-[2rem] text-white shadow-xl shadow-green-900/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 group-hover:scale-125 transition-transform duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full -ml-16 -mb-16"></div>
                    <div className="relative">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                        <TrendingUp size={24} className="text-white" />
                      </div>
                      <p className="text-green-100 text-xs font-black uppercase tracking-[0.2em] mb-2">
                        Tổng doanh thu (All-time)
                      </p>
                      <h3 className="text-5xl font-black tracking-tighter">
                        {totalRevenue.toLocaleString("vi-VN")}
                        <span className="text-2xl ml-1 text-green-200">₫</span>
                      </h3>
                      <div className="mt-8 flex items-center gap-3">
                        <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold">
                          {soldCount} xe đã bán
                        </div>
                        <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold">
                          Tăng trưởng ổn định
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selected Month */}
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-full -mr-24 -mt-24 group-hover:scale-125 transition-transform duration-700"></div>
                    <div className="relative">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                        <Calendar size={24} className="text-indigo-600" />
                      </div>
                      <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-2">
                        Doanh thu tháng {monthFilter}
                      </p>
                      <h3 className="text-5xl font-black text-slate-800 tracking-tighter">
                        {selectedMonthRevenue.toLocaleString("vi-VN")}
                        <span className="text-2xl ml-1 text-slate-300">₫</span>
                      </h3>
                      <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-xs font-bold text-slate-500 leading-relaxed">
                          ⚡️ Doanh thu tháng này dựa trên các giao dịch đã thanh
                          toán và hoàn tất trong hệ thống.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simple Bar Chart Visualization */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">
                      Xu hướng 6 tháng gần nhất
                    </h3>
                    <div className="flex items-center gap-5 text-xs font-bold">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-gradient-to-r from-green-600 to-emerald-400 rounded-full"></div>
                        <span className="text-slate-600">Tháng đang chọn</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-slate-600">
                          Tháng có doanh thu
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                        <span className="text-slate-600">
                          Không có doanh thu
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end justify-between h-64 gap-3 md:gap-6 px-4">
                    {lastSixMonthsRevenue.map((item, idx) => {
                      const heightPercent =
                        (item.value / maxSixMonthRevenue) * 100;
                      const isCurrent = item.key === monthFilter;
                      const hasRevenue = item.value > 0;
                      const barColorClass = isCurrent
                        ? "bg-gradient-to-t from-green-600 to-emerald-400 shadow-lg shadow-green-500/25"
                        : hasRevenue
                          ? "bg-gradient-to-t from-blue-600 to-sky-400 shadow-md shadow-blue-500/20"
                          : "bg-slate-200";

                      return (
                        <div
                          key={idx}
                          className="flex-1 flex h-full flex-col items-center gap-3 group"
                        >
                          <div className="relative flex w-full flex-1 items-end justify-center">
                            <div
                              className={`w-full max-w-[40px] rounded-t-xl transition-all duration-1000 ease-out relative group-hover:brightness-110 ${barColorClass}`}
                              style={{
                                height: `${Math.max(heightPercent, 5)}%`,
                                minHeight: "10px",
                              }}
                            >
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {(item.value / 1000000).toFixed(1)}M
                              </div>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest ${
                              isCurrent ? "text-green-600" : "text-slate-400"
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isDeliverModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Quản Lý Đơn Hàng
                </p>
                <h3 className="text-xl font-black text-slate-800">
                  Xác nhận đã giao xe
                </h3>
              </div>
              <button
                onClick={closeDeliverModal}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl"
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-6 space-y-5">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
                Vui lòng tải ảnh bằng chứng giao xe. Ảnh rõ nét giúp xử lý nhanh
                nếu có tranh chấp.
              </div>

              <div
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                  deliverFile
                    ? "border-green-300 bg-green-50/40"
                    : "border-slate-200 hover:border-green-300 hover:bg-slate-50"
                }`}
                onClick={() => deliverInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDeliverFile(e.dataTransfer.files?.[0]);
                }}
              >
                <input
                  ref={deliverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleDeliverFile(e.target.files?.[0])}
                />

                {!deliverFile ? (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-600">
                      Kéo thả ảnh vào đây hoặc bấm để chọn
                    </p>
                    <p className="text-xs text-slate-400">
                      Hỗ trợ JPG, PNG, WEBP · Tối đa 5MB
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    {deliverPreviewUrl && (
                      <img
                        src={deliverPreviewUrl}
                        alt="Ảnh bằng chứng"
                        className="w-48 h-48 object-cover rounded-2xl shadow"
                      />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        {deliverFile.name}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deliverInputRef.current?.click();
                        }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 mt-2"
                      >
                        Đổi ảnh
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-xs text-slate-500">
                Gợi ý: chụp xe đã giao + người nhận (hoặc địa điểm bàn giao) để
                làm bằng chứng.
              </div>

              {deliverError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                  {deliverError}
                </div>
              )}
            </div>

            <div className="px-6 py-5 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={closeDeliverModal}
                className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                disabled={isDelivering}
              >
                Hủy
              </button>
              <button
                onClick={handleDeliverSubmit}
                className={`px-5 py-2 rounded-xl font-bold text-white transition-all ${
                  deliverFile
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-slate-300 cursor-not-allowed"
                }`}
                disabled={!deliverFile || isDelivering}
              >
                {isDelivering ? "Đang tải ảnh..." : "Xác nhận giao xe"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
