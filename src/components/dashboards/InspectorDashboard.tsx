// src/components/dashboards/InspectorDashboard.tsx
import { CheckCircle, XCircle, AlertCircle, Edit, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import {
  inspectionService,
  type InspectionTask,
} from "../../services/inspection.service";
import {
  locationService,
  type InspectionLocation,
} from "../../services/location.service";
import { listingService, type Listing } from "../../services/listing.service";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Hàng chờ",
  PENDING_ASSIGNED: "Đã phân công",
  ASSIGNED: "Đã phân công",
  IN_PROGRESS: "Đang kiểm tra",
  COMPLETED: "Hoàn thành",
  REJECTED: "Từ chối",
  EXPIRED: "Hết hạn",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PENDING_ASSIGNED: "bg-blue-100 text-blue-800",
  ASSIGNED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  EXPIRED: "bg-orange-100 text-orange-800",
};

type ScoreImageType = "LEFT_VIEW" | "RIGHT_VIEW" | "FRONT_VIEW" | "REAR_VIEW";

const SCORE_IMAGE_ORDER: { key: ScoreImageType; label: string }[] = [
  { key: "LEFT_VIEW", label: "Góc trái (LEFT_VIEW)" },
  { key: "RIGHT_VIEW", label: "Góc phải (RIGHT_VIEW)" },
  { key: "FRONT_VIEW", label: "Góc trước (FRONT_VIEW)" },
  { key: "REAR_VIEW", label: "Góc sau (REAR_VIEW)" },
];

const LISTING_IMAGE_PLACEHOLDER =
  "https://images.unsplash.com/photo-1532298229144-0ee050c99d2b?q=80&w=800";

const EMPTY_SCORE_IMAGES: Record<ScoreImageType, File | null> = {
  LEFT_VIEW: null,
  RIGHT_VIEW: null,
  FRONT_VIEW: null,
  REAR_VIEW: null,
};

const EMPTY_SCORE_PREVIEWS: Record<ScoreImageType, string | null> = {
  LEFT_VIEW: null,
  RIGHT_VIEW: null,
  FRONT_VIEW: null,
  REAR_VIEW: null,
};

/**
 * Handle both ISO strings and Java LocalDateTime arrays [y, m, d, h, i, s, n]
 */
function formatDateTime(
  val: any,
  options: { onlyDate?: boolean } = {},
): string {
  if (!val) return "—";
  try {
    let date: Date;
    if (Array.isArray(val)) {
      const [y, m, d, h = 0, i = 0, s = 0] = val;
      date = new Date(y, m - 1, d, h, i, s);
    } else if (typeof val === "string") {
      const trimmed = val.trim();
      const dmyMatch = trimmed.match(
        /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/,
      );
      if (dmyMatch) {
        const [_, d, m, y, h = 0, i = 0, s = 0] = dmyMatch;
        date = new Date(
          Number(y),
          Number(m) - 1,
          Number(d),
          Number(h),
          Number(i),
          Number(s),
        );
      } else {
        date = new Date(trimmed);
      }
    } else {
      date = new Date(val);
    }
    if (isNaN(date.getTime())) return "—";

    const DD = date.getDate().toString().padStart(2, "0");
    const MM = (date.getMonth() + 1).toString().padStart(2, "0");
    const YYYY = date.getFullYear();
    const HH = date.getHours().toString().padStart(2, "0");
    const II = date.getMinutes().toString().padStart(2, "0");

    if (options.onlyDate) {
      return `${DD}/${MM}/${YYYY}`;
    }
    return `${HH}:${II} ${DD}/${MM}/${YYYY}`;
  } catch (e) {
    return "—";
  }
}

export default function InspectorDashboard() {
  const [myTasks, setMyTasks] = useState<InspectionTask[]>([]);
  const [isLoadingMy, setIsLoadingMy] = useState(true);

  // Filter and Sort State
  const [sortBy, setSortBy] = useState<"earliest" | "latest" | "status">(
    "latest",
  );
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<string>("ALL");

  // Scoring Modal
  const [isScoring, setIsScoring] = useState(false);
  const [currentTask, setCurrentTask] = useState<InspectionTask | null>(null);
  const [scoreValue, setScoreValue] = useState("");
  const [comment, setComment] = useState("");
  const [scoreImages, setScoreImages] =
    useState<Record<ScoreImageType, File | null>>(EMPTY_SCORE_IMAGES);
  const [scoreImagePreviews, setScoreImagePreviews] =
    useState<Record<ScoreImageType, string | null>>(EMPTY_SCORE_PREVIEWS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Location Modal
  const [isViewingLocation, setIsViewingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] =
    useState<InspectionLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [currentListing, setCurrentListing] = useState<Listing | null>(null);
  const [isLoadingListing, setIsLoadingListing] = useState(false);

  useEffect(() => {
    fetchMyAssigned();
  }, []);

  useEffect(() => {
    return () => {
      Object.values(scoreImagePreviews).forEach((previewUrl) => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
      });
    };
  }, [scoreImagePreviews]);

  const resetScoreInputData = () => {
    Object.values(scoreImagePreviews).forEach((previewUrl) => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    });
    setScoreImages(EMPTY_SCORE_IMAGES);
    setScoreImagePreviews(EMPTY_SCORE_PREVIEWS);
  };

  const fetchMyAssigned = async () => {
    try {
      const data = await inspectionService.getMyAssignedInspections();
      setMyTasks(data);
    } catch (error) {
      console.error("Failed to fetch assigned inspections:", error);
    } finally {
      setIsLoadingMy(false);
    }
  };

  const openScoreModal = (task: InspectionTask) => {
    setCurrentTask(task);
    setScoreValue("");
    setComment("");
    resetScoreInputData();
    setIsScoring(true);
  };

  const closeScoreModal = () => {
    setIsScoring(false);
    setCurrentTask(null);
    setScoreValue("");
    setComment("");
    resetScoreInputData();
  };

  const openLocationModal = async (task: InspectionTask) => {
    setCurrentTask(task);
    setIsViewingLocation(true);
    setCurrentLocation(null);
    setCurrentListing(null);
    setIsLoadingLocation(true);
    setIsLoadingListing(true);

    const locationPromise = task.location?.id
      ? locationService
          .getLocationById(task.location.id)
          .then((location) => location)
          .catch((error) => {
            console.error("Failed to fetch location:", error);
            return null;
          })
      : Promise.resolve(null);

    const inlineListing = task.listing ?? null;
    const listingId = task.listing?.id || task.listingId;
    const listingPromise = inlineListing
      ? Promise.resolve(inlineListing)
      : listingId
        ? listingService
            .getListingById(listingId)
            .then((listing) => listing)
            .catch((error) => {
              console.error("Failed to fetch listing:", error);
              return null;
            })
        : Promise.resolve(null);

    try {
      const [location, listing] = await Promise.all([
        locationPromise,
        listingPromise,
      ]);
      setCurrentLocation(location);
      setCurrentListing(listing);
    } finally {
      setIsLoadingLocation(false);
      setIsLoadingListing(false);
    }
  };

  const closeLocationModal = () => {
    setIsViewingLocation(false);
    setCurrentLocation(null);
    setCurrentListing(null);
    setIsLoadingLocation(false);
    setIsLoadingListing(false);
  };

  const handleScoreImageChange = (type: ScoreImageType, file: File | null) => {
    setScoreImages((prev) => ({ ...prev, [type]: file }));
    setScoreImagePreviews((prev) => {
      if (prev[type]) {
        URL.revokeObjectURL(prev[type] as string);
      }
      return {
        ...prev,
        [type]: file ? URL.createObjectURL(file) : null,
      };
    });
  };

  const handleSubmitScores = async () => {
    if (!currentTask) return;

    const normalizedScore = scoreValue.trim();
    if (!/^\d+$/.test(normalizedScore)) {
      alert("Điểm phải là số nguyên từ 0 đến 10.");
      return;
    }

    const numericScore = Number(normalizedScore);
    if (
      !Number.isInteger(numericScore) ||
      numericScore < 0 ||
      numericScore > 10
    ) {
      alert("Điểm chỉ được nhập trong khoảng 0 đến 10.");
      return;
    }

    const orderedFiles = SCORE_IMAGE_ORDER.map((item) => scoreImages[item.key]);
    const hasAllImages = orderedFiles.every((file) => file instanceof File);
    if (!hasAllImages) {
      alert("Vui lòng tải đủ 4 ảnh theo đúng thứ tự yêu cầu.");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await inspectionService.submitScores(
        currentTask.inspectionId,
        {
          comment: comment.trim(),
          score: numericScore,
          files: orderedFiles as File[],
        },
      );
      if (success) {
        alert("Nộp kết quả kiểm tra thành công!");
        closeScoreModal();
        // Refresh the lists
        fetchMyAssigned();
      } else {
        alert("Nộp kết quả thất bại. Vui lòng thử lại.");
      }
    } catch (err: any) {
      alert(err.message || "Có lỗi xảy ra khi nộp điểm.");
    } finally {
      setIsSubmitting(false);
    }
  };

  function resolveInspectionResult(
    task: InspectionTask,
  ): "FAILED" | "SUCCESS" | null {
    const normalized = String(task.inspectionResult || "").toUpperCase();
    if (normalized === "FAILED") return "FAILED";
    if (normalized === "PASSED" || normalized === "SUCCESS") return "SUCCESS";

    if (typeof task.score === "number") {
      return task.score >= 5 ? "SUCCESS" : "FAILED";
    }
    return null;
  }

  function getDisplayStatus(task: InspectionTask): InspectionTask["status"] {
    const hasResult = resolveInspectionResult(task) !== null;
    if (hasResult && task.status === "IN_PROGRESS") {
      return "COMPLETED";
    }
    return task.status;
  }

  const completedCount = myTasks.filter(
    (t) => getDisplayStatus(t) === "COMPLETED",
  ).length;
  const inProgressCount = myTasks.filter(
    (t) =>
      ["IN_PROGRESS", "PENDING_ASSIGNED", "ASSIGNED"].includes(
        getDisplayStatus(t),
      ),
  ).length;
  const successCount = myTasks.filter(
    (t) => resolveInspectionResult(t) === "SUCCESS",
  ).length;
  const rejectedCount = myTasks.filter(
    (t) => t.status === "REJECTED" || resolveInspectionResult(t) === "FAILED",
  ).length;
  const canSubmitScores =
    scoreValue.trim() !== "" &&
    SCORE_IMAGE_ORDER.every((item) => scoreImages[item.key]);

  // Helper function to parse date for sorting
  const parseDateTime = (val: any): Date | null => {
    if (!val) return null;
    try {
      let date: Date;
      if (Array.isArray(val)) {
        const [y, m, d, h = 0, i = 0, s = 0] = val;
        date = new Date(y, m - 1, d, h, i, s);
      } else if (typeof val === "string") {
        const trimmed = val.trim();
        const dmyMatch = trimmed.match(
          /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/,
        );
        if (dmyMatch) {
          const [_, d, m, y, h = 0, i = 0, s = 0] = dmyMatch;
          date = new Date(
            Number(y),
            Number(m) - 1,
            Number(d),
            Number(h),
            Number(i),
            Number(s),
          );
        } else {
          date = new Date(trimmed);
        }
      } else {
        date = new Date(val);
      }
      return !isNaN(date.getTime()) ? date : null;
    } catch {
      return null;
    }
  };

  const getTaskCreatedTimestamp = (task: InspectionTask): number => {
    return parseDateTime(task.createdAt)?.getTime() ?? 0;
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = myTasks
    .filter((task) => {
      const displayStatus = getDisplayStatus(task);
      if (filterStatus !== "ALL" && displayStatus !== filterStatus) return false;
      if (filterType !== "ALL" && task.inspectionType !== filterType)
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "earliest") {
        const timeA = getTaskCreatedTimestamp(a);
        const timeB = getTaskCreatedTimestamp(b);
        return timeA - timeB;
      } else if (sortBy === "latest") {
        const timeA = getTaskCreatedTimestamp(a);
        const timeB = getTaskCreatedTimestamp(b);
        return timeB - timeA;
      } else if (sortBy === "status") {
        const statusOrder: Record<string, number> = {
          IN_PROGRESS: 0,
          ASSIGNED: 1,
          PENDING_ASSIGNED: 2,
          COMPLETED: 3,
          REJECTED: 4,
          PENDING: 5,
          EXPIRED: 6,
        };
        const statusA = getDisplayStatus(a);
        const statusB = getDisplayStatus(b);
        return (statusOrder[statusA] ?? 99) - (statusOrder[statusB] ?? 99);
      }
      return 0;
    });

  const stats = [
    {
      label: "Việc đang làm",
      value: isLoadingMy ? "..." : inProgressCount.toString(),
      icon: AlertCircle,
    },
    {
      label: "Đã Hoàn thành",
      value: isLoadingMy ? "..." : completedCount.toString(),
      icon: CheckCircle,
    },
    {
      label: "Thành công",
      value: isLoadingMy ? "..." : successCount.toString(),
      icon: CheckCircle,
    },
    {
      label: "Bị từ chối",
      value: isLoadingMy ? "..." : rejectedCount.toString(),
      icon: XCircle,
    },
  ];

  const renderTaskList = (
    tasks: InspectionTask[],
    loading: boolean,
    emptyMsg: string,
    isPendingQueue: boolean,
  ) => {
    if (loading)
      return (
        <div className="p-12 text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 mb-4 animate-spin">
            <div className="h-8 w-8 rounded-full border-4 border-slate-300 border-t-green-600"></div>
          </div>
          <p className="text-slate-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      );
    if (tasks.length === 0)
      return (
        <div className="p-12 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-slate-600 font-medium">{emptyMsg}</p>
        </div>
      );
    return (
      <div className="divide-y divide-slate-100">
        {tasks.map((task) => {
          const displayStatus = getDisplayStatus(task);
          const inspectionResult = resolveInspectionResult(task);
          return (
            <div
              key={task.inspectionId}
              className="p-6 hover:bg-slate-50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                {/* Task Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-50 to-emerald-50 text-green-600 rounded-xl flex items-center justify-center text-xl border border-green-200 flex-shrink-0">
                    🚲
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-base">
                        Đơn #{task.inspectionId.split("-")[0]}
                      </h3>
                      <span
                        className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                          STATUS_COLOR[displayStatus] ??
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {STATUS_LABEL[displayStatus] ?? displayStatus}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1.5 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">📍</span>
                        <span className="font-medium">
                          {task.inspectionType === "COMPANY"
                            ? "Kiểm tra tại trung tâm"
                            : "Kiểm tra tại nhà"}
                        </span>
                      </div>
                      {task.scheduledAt && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">📅</span>
                          <span className="font-medium">
                            {formatDateTime(task.scheduledAt)}
                          </span>
                        </div>
                      )}
                      {!isPendingQueue && task.inspector && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">👤</span>
                          <span className="font-medium">
                            {task.inspector.name || task.inspector.username}
                          </span>
                        </div>
                      )}
                      {inspectionResult && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">🧾</span>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                              inspectionResult === "SUCCESS"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {inspectionResult}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={() => openLocationModal(task)}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 text-slate-900 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-slate-200 transition flex items-center justify-center gap-2"
                  >
                    <Eye size={16} /> Xem chi tiết
                  </button>
                  {!isPendingQueue &&
                    ["PENDING_ASSIGNED", "ASSIGNED", "IN_PROGRESS"].includes(
                      displayStatus,
                    ) && (
                      <button
                        onClick={() => openScoreModal(task)}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:from-green-700 hover:to-emerald-700 transition shadow-md shadow-green-600/20 flex items-center justify-center gap-2"
                      >
                        <Edit size={16} /> Chấm điểm
                      </button>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-[calc(100vh-80px)] font-sans">
      <div
        className={`max-w-6xl mx-auto px-6 py-8 transition-all duration-200 ${
          isScoring ? "blur-[2px] pointer-events-none select-none" : ""
        }`}
      >
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-baseline gap-3 mb-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              📋 Bảng Điều Khiển
            </h1>
            <span className="text-sm font-semibold text-slate-500 bg-slate-200 px-3 py-1 rounded-full">
              Kiểm Tra Viên
            </span>
          </div>
          <p className="text-slate-600 font-medium">
            Quản lý và nhập điểm đánh giá tình trạng xe đạp cũ
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:border-slate-300"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                    <Icon size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-black text-slate-900 leading-none">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* My Assigned Tasks */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header with Title and Badge */}
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-6 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <span>🏠</span> Việc Của Tôi
              </h2>
              <p className="text-xs font-medium text-slate-500 mt-1">
                {filteredAndSortedTasks.length} / {myTasks.length} đơn
              </p>
            </div>
            <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-xs font-bold">
              ✓ {completedCount} hoàn thành
            </div>
          </div>

          {/* Filter and Sort Bar */}
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
              {/* Sort */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest shrink-0">
                  📅 Sắp xếp theo:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 font-medium hover:border-slate-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition cursor-pointer"
                >
                  <option value="latest">🆕 Mới tạo nhất</option>
                  <option value="earliest">🕰️ Tạo sớm nhất</option>
                  <option value="status">📊 Theo trạng thái</option>
                </select>
              </div>

              {/* Filter Status */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest shrink-0">
                  🏷️ Trạng thái:
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 font-medium hover:border-slate-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition cursor-pointer"
                >
                  <option value="ALL">Tất cả</option>
                  <option value="IN_PROGRESS">Đang kiểm tra</option>
                  <option value="COMPLETED">Hoàn thành</option>
                </select>
              </div>

              {/* Filter Type */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest shrink-0">
                  📍 Loại:
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 font-medium hover:border-slate-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition cursor-pointer"
                >
                  <option value="ALL">Tất cả</option>
                  <option value="ONSITE">Tại nhà</option>
                  <option value="COMPANY">Tại trung tâm</option>
                </select>
              </div>

              {/* Reset Filters */}
              {(filterStatus !== "ALL" ||
                filterType !== "ALL" ||
                sortBy !== "latest") && (
                <button
                  onClick={() => {
                    setSortBy("latest");
                    setFilterStatus("ALL");
                    setFilterType("ALL");
                  }}
                  className="px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
                >
                  ↻ Reset
                </button>
              )}
            </div>
          </div>

          {/* Task List */}
          {renderTaskList(
            filteredAndSortedTasks,
            isLoadingMy,
            "Bạn chưa có đơn kiểm tra nào đang xử lý.",
            false,
          )}
        </div>
      </div>

      {/* Scoring Modal */}
      {isScoring && currentTask && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
              <div>
                <h3 className="text-lg font-black text-slate-800">
                  Nộp kết quả kiểm tra
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  Mã đơn: {currentTask.inspectionId}
                </p>
              </div>
              <button
                onClick={closeScoreModal}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 transition"
              >
                <XCircle size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6 pb-24">
              <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-sky-50 p-4 text-sm text-indigo-900">
                <p className="font-bold">Hướng dẫn chính</p>
                <p className="mt-1">
                  Nhập điểm, ghi nhận xét và tải đủ 4 ảnh theo đúng thứ tự:
                  LEFT, RIGHT, FRONT, REAR.
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-widest">
                  Bảng đánh giá tình trạng xe (0–10)
                </div>
                <div className="divide-y divide-slate-100 text-sm">
                  <div className="px-4 py-3">
                    <div className="font-bold text-slate-800">
                      10 – Like New
                    </div>
                    <p className="text-slate-600 mt-1">
                      Xe gần như mới hoàn toàn, sơn hoàn hảo, không vết trầy
                      xước. Mọi bộ phận vận hành trơn tru tuyệt đối.
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <div className="font-bold text-slate-800">
                      9 – Excellent
                    </div>
                    <p className="text-slate-600 mt-1">
                      Ngoại hình đẹp, rất ít vết trầy xước nhỏ khó thấy. Phanh,
                      bánh và khung sườn hoạt động rất tốt.
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <div className="font-bold text-slate-800">
                      8 – Very Good
                    </div>
                    <p className="text-slate-600 mt-1">
                      Có vài vết trầy nhẹ, màu sơn còn giữ độ bóng tốt. Xe vận
                      hành ổn định trong điều kiện bình thường.
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <div className="font-bold text-slate-800">7 – Good</div>
                    <p className="text-slate-600 mt-1">
                      Vết trầy xước thấy rõ bằng mắt thường nhưng không ảnh
                      hưởng đến khả năng vận hành.
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <div className="font-bold text-slate-800">6 – Fair</div>
                    <p className="text-slate-600 mt-1">
                      Có dấu hiệu hao mòn tự nhiên: sơn bắt đầu phai màu nhẹ,
                      lốp xe hơi mòn.
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <div className="font-bold text-slate-800">
                      5 – Acceptable
                    </div>
                    <p className="text-slate-600 mt-1">
                      Máy móc vẫn chạy tốt nhưng ngoại hình xuống cấp (sơn xấu,
                      trầy xước nhiều hoặc xỉn màu).
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <div className="font-bold text-slate-800">4 – Poor</div>
                    <p className="text-slate-600 mt-1">
                      Xe bắt đầu có vấn đề kỹ thuật cần sửa chữa (phanh yếu,
                      vành bánh hơi lệch/đảo).
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <div className="font-bold text-slate-800">
                      3 – Very Poor
                    </div>
                    <p className="text-slate-600 mt-1">
                      Cần thay thế nhiều phụ tùng mới có thể sử dụng.
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <div className="font-bold text-slate-800">
                      0–2 – Scrap/Parts Only
                    </div>
                    <p className="text-slate-600 mt-1">
                      Xe nát, chỉ có thể lấy linh kiện hoặc bán sắt vụn.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Điểm tổng
                  </span>
                  <div className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                    0 - 10
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="w-full sm:w-auto">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Nhập điểm
                    </p>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="1"
                      inputMode="numeric"
                      value={scoreValue}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          setScoreValue("");
                          return;
                        }

                        if (/^\d{1,2}$/.test(value) && Number(value) <= 10) {
                          setScoreValue(value);
                        }
                      }}
                      placeholder="0-10"
                      className="w-full sm:w-40 rounded-xl border-2 border-slate-200 px-4 py-3 text-center text-xl font-bold text-indigo-700 placeholder:text-base placeholder:font-semibold placeholder:text-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div className="space-y-1">
                    {scoreValue !== "" && /^\d+$/.test(scoreValue) && (
                      <p className="text-xs font-semibold text-slate-700">
                        Kết quả dự kiến:{" "}
                        {Number(scoreValue) >= 5 ? "SUCCESS" : "FAILED"}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Nhận xét
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Ghi chú tình trạng xe (tùy chọn)"
                    rows={3}
                    className="mt-2 w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-sm text-slate-800 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-600">
                    Ảnh hiện trạng xe (4 ảnh bắt buộc)
                  </p>
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                    {Object.values(scoreImages).filter(Boolean).length}/4 đã tải
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {SCORE_IMAGE_ORDER.map((item, index) => {
                    const selectedFile = scoreImages[item.key];
                    const selectedPreview = scoreImagePreviews[item.key];
                    return (
                      <div
                        key={item.key}
                        className={`rounded-xl border p-3 transition ${
                          selectedFile
                            ? "border-emerald-300 bg-emerald-50"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                              Bước {index + 1}
                            </p>
                            <p className="text-sm font-semibold text-slate-800">
                              {item.label}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                              selectedFile
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {selectedFile ? "Đã chọn" : "Chưa có"}
                          </span>
                        </div>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleScoreImageChange(
                              item.key,
                              e.target.files?.[0] ?? null,
                            )
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-indigo-700"
                        />

                        <p className="mt-2 truncate text-xs text-slate-500">
                          {selectedFile
                            ? `Tệp: ${selectedFile.name}`
                            : "Chưa chọn tệp"}
                        </p>

                        {selectedPreview && (
                          <div className="mt-3 space-y-2">
                            <a
                              href={selectedPreview}
                              target="_blank"
                              rel="noreferrer"
                              className="block overflow-hidden rounded-lg border border-slate-200"
                            >
                              <img
                                src={selectedPreview}
                                alt={`Preview ${item.label}`}
                                className="h-28 w-full object-cover"
                              />
                            </a>
                            <a
                              href={selectedPreview}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                            >
                              Xem lại ảnh đã chọn
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 p-6 sticky bottom-0">
              <button
                onClick={closeScoreModal}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-100"
              >
                Trở lại
              </button>
              <button
                onClick={handleSubmitScores}
                disabled={isSubmitting || !canSubmitScores}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Đang gửi..." : "Xác nhận & Hoàn thành"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {isViewingLocation && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
              <div>
                <h3 className="text-lg font-black text-slate-800">
                  Chi Tiết Kiểm Tra Xe
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  Bao gồm thông tin xe, hình ảnh và kết quả kiểm tra
                </p>
              </div>
              <button
                onClick={closeLocationModal}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 transition"
              >
                <XCircle size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {isLoadingLocation || isLoadingListing ? (
                <div className="text-center py-8 text-slate-500">
                  Đang tải thông tin...
                </div>
              ) : (
                <div className="space-y-8">
                  {currentListing && (
                    <div>
                      <div className="bg-emerald-50 text-emerald-800 text-xs font-medium p-4 rounded-xl mb-4">
                        Thông tin chi tiết xe đạp
                      </div>
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="space-y-2 rounded-xl border border-slate-200 p-4">
                          <h4 className="text-sm font-bold text-slate-800">
                            Thông số xe
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between gap-3 border-b border-slate-100 py-2">
                              <span className="text-slate-600">Tiêu đề</span>
                              <span className="text-right font-semibold text-slate-800">
                                {currentListing.title || "—"}
                              </span>
                            </div>
                            <div className="flex justify-between gap-3 border-b border-slate-100 py-2">
                              <span className="text-slate-600">
                                Thương hiệu
                              </span>
                              <span className="text-right font-semibold text-slate-800">
                                {currentListing.brand?.name || "—"}
                              </span>
                            </div>
                            <div className="flex justify-between gap-3 border-b border-slate-100 py-2">
                              <span className="text-slate-600">Số khung</span>
                              <span className="text-right font-semibold text-slate-800">
                                {currentListing.frameNumber || "—"}
                              </span>
                            </div>
                            <div className="flex justify-between gap-3 py-2">
                              <span className="text-slate-600">
                                Giá niêm yết
                              </span>
                              <span className="text-right font-semibold text-slate-800">
                                {currentListing.price
                                  ? `${currentListing.price.toLocaleString("vi-VN")} đ`
                                  : "—"}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                              Tình trạng chi của xe
                            </p>
                            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                              {currentListing.description ||
                                "Chưa có mô tả chi tiết từ người bán."}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-4">
                          <h4 className="mb-3 text-sm font-bold text-slate-800">
                            Hình ảnh xe
                          </h4>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {(currentListing.images?.length
                              ? currentListing.images
                                  .slice()
                                  .sort((a, b) => a.imageOrder - b.imageOrder)
                                  .map((img) => img.secureUrl)
                              : [LISTING_IMAGE_PLACEHOLDER]
                            ).map((imgUrl, idx) => (
                              <a
                                key={`${imgUrl}-${idx}`}
                                href={imgUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="group relative block aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Ảnh xe ${idx + 1}`}
                                  className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      LISTING_IMAGE_PLACEHOLDER;
                                  }}
                                />
                                <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-bold text-white">
                                  Ảnh {idx + 1}
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="bg-blue-50 text-blue-800 text-xs font-medium p-4 rounded-xl mb-4">
                      Thông tin liên hệ và địa chỉ kiểm tra
                    </div>
                    <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                      {currentTask?.scheduledAt && (
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="font-medium text-slate-600">
                            📅 Lịch hẹn:
                          </span>
                          <span className="font-bold text-slate-800">
                            {formatDateTime(currentTask.scheduledAt)}
                          </span>
                        </div>
                      )}
                      {currentLocation ? (
                        <>
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="font-medium text-slate-600">
                              Loại:
                            </span>
                            <span className="font-bold text-slate-800">
                              {currentLocation.type === "SELLER"
                                ? "Người bán"
                                : "Công ty"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="font-medium text-slate-600">
                              Tên liên hệ:
                            </span>
                            <span className="font-bold text-slate-800">
                              {currentLocation.contactName || "—"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="font-medium text-slate-600">
                              Số điện thoại:
                            </span>
                            <span className="font-bold text-slate-800">
                              {currentLocation.contactPhone || "—"}
                            </span>
                          </div>
                          <div className="flex justify-between items-start py-2 border-b border-slate-100">
                            <span className="font-medium text-slate-600">
                              Địa chỉ:
                            </span>
                            <span className="font-bold text-slate-800 text-right">
                              {currentLocation.addressLine || "—"}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 border border-amber-200">
                          Không tìm thấy dữ liệu địa điểm cho đơn kiểm tra này.
                        </div>
                      )}
                    </div>
                  </div>

                  {currentTask && getDisplayStatus(currentTask) === "COMPLETED" && (
                    <div>
                      <div className="bg-green-50 text-green-800 text-xs font-medium p-4 rounded-xl mb-4">
                        Kết quả kiểm tra
                      </div>
                      <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="font-medium text-slate-600">
                            Result
                          </span>
                          {(() => {
                            const result = resolveInspectionResult(currentTask);
                            if (!result) {
                              return (
                                <span className="font-bold text-slate-800">
                                  —
                                </span>
                              );
                            }

                            return (
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                                  result === "SUCCESS"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {result}
                              </span>
                            );
                          })()}
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="font-medium text-slate-600">
                            Điểm
                          </span>
                          <span className="font-bold text-slate-800">
                            {currentTask.score ?? "—"}
                          </span>
                        </div>
                        <div className="py-2 border-b border-slate-100">
                          <p className="font-medium text-slate-600 mb-1">
                            Nhận xét
                          </p>
                          <p className="text-sm text-slate-800">
                            {currentTask.comment || "Chưa có nhận xét."}
                          </p>
                        </div>
                        {currentTask.images &&
                          currentTask.images.length > 0 && (
                            <div className="space-y-2">
                              <p className="font-medium text-slate-600">
                                Ảnh hiện trạng sau kiểm tra
                              </p>
                              <div className="space-y-2">
                                {currentTask.images.map(
                                  (img: any, idx: number) => (
                                    <div
                                      key={`${img.type ?? "IMG"}-${idx}`}
                                      className="flex items-center justify-between text-sm text-slate-700 border-b border-slate-100 py-2"
                                    >
                                      <span className="font-semibold">
                                        {img.type ?? "Ảnh"}
                                      </span>
                                      <a
                                        href={img.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-600 hover:text-blue-700 font-semibold"
                                      >
                                        Xem ảnh
                                      </a>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end sticky bottom-0">
              <button
                onClick={closeLocationModal}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition shadow-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
