// src/components/dashboards/InspectorDashboard.tsx
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Edit,
  Eye,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  inspectionService,
  type InspectionTask,
} from "../../services/inspection.service";
import {
  componentService,
  type InspectionComponent,
} from "../../services/component.service";
import {
  locationService,
  type InspectionLocation,
} from "../../services/location.service";
import { useAuth } from "../../contexts/AuthContext";

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

export default function InspectorDashboard() {
  const { user } = useAuth();
  const [myTasks, setMyTasks] = useState<InspectionTask[]>([]);
  const [pendingTasks, setPendingTasks] = useState<InspectionTask[]>([]);
  const [isLoadingMy, setIsLoadingMy] = useState(true);
  const [isLoadingPending, setIsLoadingPending] = useState(true);

  // Scoring Modal
  const [isScoring, setIsScoring] = useState(false);
  const [currentTask, setCurrentTask] = useState<InspectionTask | null>(null);
  const [components, setComponents] = useState<InspectionComponent[]>([]);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Location Modal
  const [isViewingLocation, setIsViewingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] =
    useState<InspectionLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    fetchMyAssigned();
    fetchPending();
    fetchComponents();
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

  const fetchPending = async () => {
    try {
      const data = await inspectionService.getPendingInspections();
      setPendingTasks(data);
    } catch (error) {
      console.error("Failed to fetch pending inspections:", error);
    } finally {
      setIsLoadingPending(false);
    }
  };

  const fetchComponents = async () => {
    try {
      const data = await componentService.getAllComponents();
      setComponents(data);
    } catch (error) {
      console.error("Failed to fetch components:", error);
    }
  };

  const handleAssign = async (inspectionId: string) => {
    if (!user?.id) {
      alert("Không tìm thấy thông tin Inspector.");
      return;
    }
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn nhận kiểm tra đơn này?",
    );
    if (!confirmed) return;

    const success = await inspectionService.assignInspector({
      inspectionId,
      inspectorId: String(user.id),
    });
    if (success) {
      alert("Nhận việc thành công!");
      fetchMyAssigned();
      fetchPending();
    } else {
      alert("Nhận việc thất bại. Đơn này có thể đã được người khác nhận.");
    }
  };

  const openScoreModal = (task: InspectionTask) => {
    setCurrentTask(task);
    setScores({});
    setIsScoring(true);
  };

  const closeScoreModal = () => {
    setIsScoring(false);
    setCurrentTask(null);
    setScores({});
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

  const handleScoreChange = (componentId: number, score: number) => {
    setScores((prev) => ({ ...prev, [componentId]: score }));
  };

  const handleSubmitScores = async () => {
    if (!currentTask) return;

    // Validate if all components have scores
    if (Object.keys(scores).length !== components.length) {
      const confirmed = window.confirm(
        "Bạn chưa chấm điểm tất cả các hạng mục. Bạn có chắc chắn muốn nộp kết quả?",
      );
      if (!confirmed) return;
    }

    const payload = Object.entries(scores).map(([compId, score]) => ({
      componentId: Number(compId),
      score,
    }));

    if (payload.length === 0) {
      alert("Vui lòng nhập ít nhất 1 điểm số.");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await inspectionService.submitScores(
        currentTask.inspectionId,
        payload,
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

  const stats = [
    {
      label: "Hàng chờ (Mới)",
      value: isLoadingPending ? "..." : pendingTasks.length.toString(),
      icon: Clock,
    },
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
        <div className="p-6 text-center text-slate-500 font-medium">
          Đang tải dữ liệu...
        </div>
      );
    if (tasks.length === 0)
      return (
        <div className="p-6 text-center text-slate-500 font-medium">
          {emptyMsg}
        </div>
      );
    return (
      <div className="divide-y divide-slate-100">
        {tasks.map((task) => (
          <div
            key={task.inspectionId}
            className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center text-2xl border border-indigo-100">
                🛠️
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800">
                  Mã đơn: {task.inspectionId.split("-")[0]}
                </h3>
                <p className="text-indigo-600 font-bold tracking-tight">
                  Loại:{" "}
                  {task.inspectionType === "COMPANY"
                    ? "Tại Trung Tâm"
                    : "Tận Nơi"}
                </p>
                <div className="text-sm text-slate-500 mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                  {task.scheduledAt && (
                    <span className="flex items-center gap-1">
                      📅 Lịch hẹn:{" "}
                      <span className="font-medium text-slate-700">
                        {new Date(task.scheduledAt).toLocaleDateString("vi-VN")}
                      </span>
                    </span>
                  )}
                  {!isPendingQueue && task.inspector && (
                    <span className="flex items-center gap-1">
                      🕵️ KĐV:{" "}
                      <span className="font-medium text-slate-700">
                        {task.inspector.name || task.inspector.username}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest ${STATUS_COLOR[task.status] ?? "bg-slate-100 text-slate-700"}`}
              >
                {STATUS_LABEL[task.status] ?? task.status}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openLocationModal(task)}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 rounded-lg hover:bg-blue-700 transition shadow-sm active:scale-95"
                >
                  <Eye size={14} /> Xem chi tiết
                </button>
                {isPendingQueue && (
                  <button
                    onClick={() => handleAssign(task.inspectionId)}
                    className="px-4 py-1.5 bg-green-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-green-700 transition shadow-sm active:scale-95"
                  >
                    Nhận việc
                  </button>
                )}
                {!isPendingQueue &&
                  ["PENDING_ASSIGNED", "ASSIGNED", "IN_PROGRESS"].includes(
                    task.status,
                  ) && (
                    <button
                      onClick={() => openScoreModal(task)}
                      className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 rounded-lg hover:bg-indigo-700 transition shadow-sm active:scale-95"
                    >
                      <Edit size={14} /> Chấm điểm
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
    <div className="bg-slate-50 min-h-[calc(100vh-80px)] font-sans">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
            Bảng Điều Khiển KĐV
          </h1>
          <p className="text-slate-500 font-medium">
            Quản lý và nhập điểm đánh giá tình trạng xe đạp cũ.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-indigo-50 rounded-xl">
                    <Icon size={24} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-black text-slate-800 leading-none">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pending Queue */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
          <div className="border-b border-slate-50 bg-gradient-to-r from-amber-50 to-white px-6 py-5 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span className="text-amber-500">⏳</span> Hàng Chờ (Chưa Phân
              Công)
            </h2>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
              {pendingTasks.length} đơn
            </span>
          </div>
          {renderTaskList(
            pendingTasks,
            isLoadingPending,
            "Không có đơn yêu cầu mới nào trong hệ thống.",
            true,
          )}
        </div>

        {/* My Assigned Tasks */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
          <div className="border-b border-slate-50 bg-gradient-to-r from-indigo-50 to-white px-6 py-5 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span className="text-indigo-500">📋</span> Việc Của Tôi
            </h2>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
              {myTasks.length} việc
            </span>
          </div>
          {renderTaskList(
            myTasks,
            isLoadingMy,
            "Bạn chưa có đơn kiểm tra nào đang xử lý.",
            false,
          )}
        </div>
      </div>

      {/* Scoring Modal */}
      {isScoring && currentTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-black text-slate-800">
                  Bảng Chấm Điểm Linh Kiện
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

            <div className="p-6 overflow-y-auto flex-1">
              <div className="bg-indigo-50 text-indigo-800 text-xs font-medium p-4 rounded-xl mb-6">
                Vui lòng đánh giá tình trạng từng bộ phận của xe theo thang điểm
                từ 1 đến 10 (10 = Hoàn hảo).
              </div>

              <div className="space-y-4">
                {components.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">
                    Hệ thống chưa thiết lập danh sách linh kiện.
                  </div>
                ) : (
                  components.map((comp) => (
                    <div
                      key={comp.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-200 p-4 rounded-xl hover:border-indigo-200 transition-colors"
                    >
                      <div className="mb-3 sm:mb-0">
                        <p className="font-bold text-slate-800">{comp.name}</p>
                        {comp.description && (
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed max-w-sm">
                            {comp.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest shrink-0">
                          Điểm:
                        </span>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={scores[comp.id] || ""}
                          onChange={(e) =>
                            handleScoreChange(comp.id, parseInt(e.target.value))
                          }
                          placeholder="0-10"
                          className="w-20 px-3 py-2 border-2 border-slate-200 rounded-lg text-center font-black text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={closeScoreModal}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition shadow-sm"
              >
                Trở lại
              </button>
              <button
                onClick={handleSubmitScores}
                disabled={isSubmitting || Object.keys(scores).length === 0}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md shadow-indigo-600/20 flex items-center gap-2"
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
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="font-medium text-slate-600">Loại:</span>
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

                  {currentTask?.status === "COMPLETED" && currentTask.scores && currentTask.scores.length > 0 && (
                    <div>
                      <div className="bg-green-50 text-green-800 text-xs font-medium p-4 rounded-xl mb-4">
                        Điểm đánh giá các bộ phận xe
                      </div>
                      <div className="space-y-3">
                        {currentTask.scores.map((scoreItem: any) => {
                          const component = components.find((c) => c.id === scoreItem.componentId);
                          return (
                            <div
                              key={scoreItem.componentId}
                              className="flex justify-between items-center py-2 border-b border-slate-100"
                            >
                              <span className="font-medium text-slate-600">
                                {component?.name || `Bộ phận ${scoreItem.componentId}`}
                              </span>
                              <span className="font-bold text-slate-800">{scoreItem.score}/10</span>
                            </div>
                          );
                        })}
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
