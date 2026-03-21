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

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Hàng chờ",
  PENDING_ASSIGNED: "Đã phân công",
  ASSIGNED: "Đã phân công",
  IN_PROGRESS: "Đang kiểm tra",
  COMPLETED: "Hoàn thành",
  REJECTED: "Từ chối",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PENDING_ASSIGNED: "bg-blue-100 text-blue-800",
  ASSIGNED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

type ScoreImageType = "LEFT_VIEW" | "RIGHT_VIEW" | "FRONT_VIEW" | "REAR_VIEW";

const SCORE_IMAGE_ORDER: { key: ScoreImageType; label: string }[] = [
  { key: "LEFT_VIEW", label: "Góc trái (LEFT_VIEW)" },
  { key: "RIGHT_VIEW", label: "Góc phải (RIGHT_VIEW)" },
  { key: "FRONT_VIEW", label: "Góc trước (FRONT_VIEW)" },
  { key: "REAR_VIEW", label: "Góc sau (REAR_VIEW)" },
];

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
    } else {
      // Try standard parsing
      date = new Date(val);

      // If invalid, try parsing DD-MM-YYYY HH:mm or DD/MM/YYYY HH:mm
      if (isNaN(date.getTime()) && typeof val === "string") {
        const dmyMatch = val.match(
          /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/,
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
        }
      }
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
    "earliest",
  );
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<string>("ALL");

  // Scoring Modal
  const [isScoring, setIsScoring] = useState(false);
  const [currentTask, setCurrentTask] = useState<InspectionTask | null>(null);
  const [scoreValue, setScoreValue] = useState("");
  const [comment, setComment] = useState("");
  const [scoreImages, setScoreImages] = useState<
    Record<ScoreImageType, File | null>
  >({
    LEFT_VIEW: null,
    RIGHT_VIEW: null,
    FRONT_VIEW: null,
    REAR_VIEW: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Location Modal
  const [isViewingLocation, setIsViewingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] =
    useState<InspectionLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    fetchMyAssigned();
  }, []);

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
    setScoreImages({
      LEFT_VIEW: null,
      RIGHT_VIEW: null,
      FRONT_VIEW: null,
      REAR_VIEW: null,
    });
    setIsScoring(true);
  };

  const closeScoreModal = () => {
    setIsScoring(false);
    setCurrentTask(null);
    setScoreValue("");
    setComment("");
    setScoreImages({
      LEFT_VIEW: null,
      RIGHT_VIEW: null,
      FRONT_VIEW: null,
      REAR_VIEW: null,
    });
  };

  const openLocationModal = async (task: InspectionTask) => {
    if (!task.location?.id) {
      alert("Không tìm thấy thông tin địa điểm cho đơn này.");
      return;
    }
    setCurrentTask(task);
    setIsViewingLocation(true);
    setIsLoadingLocation(true);
    try {
      const location = await locationService.getLocationById(task.location.id);
      setCurrentLocation(location);
    } catch (error) {
      console.error("Failed to fetch location:", error);
      alert("Không thể tải thông tin địa điểm.");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const closeLocationModal = () => {
    setIsViewingLocation(false);
    setCurrentLocation(null);
  };

  const handleScoreImageChange = (type: ScoreImageType, file: File | null) => {
    setScoreImages((prev) => ({ ...prev, [type]: file }));
  };

  const handleSubmitScores = async () => {
    if (!currentTask) return;

    const numericScore = Number.parseInt(scoreValue, 10);
    if (Number.isNaN(numericScore)) {
      alert("Vui lòng nhập điểm số hợp lệ.");
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

  const completedCount = myTasks.filter((t) => t.status === "COMPLETED").length;
  const inProgressCount = myTasks.filter(
    (t) =>
      t.status === "IN_PROGRESS" ||
      t.status === "PENDING_ASSIGNED" ||
      t.status === "ASSIGNED",
  ).length;
  const rejectedCount = myTasks.filter((t) => t.status === "REJECTED").length;
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
      } else {
        date = new Date(val);
        if (isNaN(date.getTime()) && typeof val === "string") {
          const dmyMatch = val.match(
            /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/,
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
          }
        }
      }
      return !isNaN(date.getTime()) ? date : null;
    } catch {
      return null;
    }
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = myTasks
    .filter((task) => {
      if (filterStatus !== "ALL" && task.status !== filterStatus) return false;
      if (filterType !== "ALL" && task.inspectionType !== filterType)
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "earliest") {
        const dateA = parseDateTime(a.scheduledAt);
        const dateB = parseDateTime(b.scheduledAt);
        if (!dateA || !dateB) return 0;
        return dateA.getTime() - dateB.getTime();
      } else if (sortBy === "latest") {
        const dateA = parseDateTime(a.scheduledAt);
        const dateB = parseDateTime(b.scheduledAt);
        if (!dateA || !dateB) return 0;
        return dateB.getTime() - dateA.getTime();
      } else if (sortBy === "status") {
        const statusOrder: Record<string, number> = {
          IN_PROGRESS: 0,
          ASSIGNED: 1,
          PENDING_ASSIGNED: 2,
          COMPLETED: 3,
          REJECTED: 4,
          PENDING: 5,
        };
        return (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
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
      label: "Kiểm duyệt xong",
      value: isLoadingMy ? "..." : completedCount.toString(),
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
        {tasks.map((task) => (
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
                        STATUS_COLOR[task.status] ??
                        "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {STATUS_LABEL[task.status] ?? task.status}
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
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <button
                  onClick={() => openLocationModal(task)}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 text-slate-900 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-slate-200 transition flex items-center justify-center gap-2"
                >
                  <Eye size={16} /> Chi tiết
                </button>
                {!isPendingQueue &&
                  ["PENDING_ASSIGNED", "ASSIGNED", "IN_PROGRESS"].includes(
                    task.status,
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
        ))}
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
                  <option value="earliest">⏰ Sớm nhất trước</option>
                  <option value="latest">⏰ Muộn nhất trước</option>
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
                  <option value="ASSIGNED">Đã phân công</option>
                  <option value="PENDING_ASSIGNED">Chờ phân công</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="REJECTED">Từ chối</option>
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
                sortBy !== "earliest") && (
                <button
                  onClick={() => {
                    setSortBy("earliest");
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
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
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

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
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
                  <input
                    type="number"
                    min="0"
                    value={scoreValue}
                    onChange={(e) => setScoreValue(e.target.value)}
                    placeholder="Nhập điểm"
                    className="w-full sm:w-40 rounded-xl border-2 border-slate-200 px-4 py-3 text-center text-2xl font-black text-indigo-700 placeholder:text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                  <p className="text-xs text-slate-500">
                    Gợi ý: nhập số nguyên từ 0 đến 10 để tránh sai định dạng.
                  </p>
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
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 p-6">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-black text-slate-800">
                  Thông Tin Địa Điểm
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  Chi tiết đơn kiểm tra
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
              {isLoadingLocation ? (
                <div className="text-center py-8 text-slate-500">
                  Đang tải thông tin...
                </div>
              ) : currentLocation ? (
                <div className="space-y-6">
                  <div>
                    <div className="bg-blue-50 text-blue-800 text-xs font-medium p-4 rounded-xl mb-4">
                      Thông tin liên hệ và địa chỉ kiểm tra
                    </div>
                    <div className="space-y-3">
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
                          {currentLocation.contactName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="font-medium text-slate-600">
                          Số điện thoại:
                        </span>
                        <span className="font-bold text-slate-800">
                          {currentLocation.contactPhone}
                        </span>
                      </div>
                      <div className="flex justify-between items-start py-2 border-b border-slate-100">
                        <span className="font-medium text-slate-600">
                          Địa chỉ:
                        </span>
                        <span className="font-bold text-slate-800 text-right">
                          {currentLocation.addressLine}
                        </span>
                      </div>
                    </div>
                  </div>

                  {currentTask?.status === "COMPLETED" && (
                    <div>
                      <div className="bg-green-50 text-green-800 text-xs font-medium p-4 rounded-xl mb-4">
                        Kết quả kiểm tra
                      </div>
                      <div className="space-y-3">
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
                                Ảnh hiện trạng
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
              ) : (
                <div className="text-center py-8 text-slate-500">
                  Không tìm thấy thông tin địa điểm.
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
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
