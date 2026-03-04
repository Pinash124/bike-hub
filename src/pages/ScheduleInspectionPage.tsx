import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { inspectionService } from "../services/inspection.service";
import {
  locationService,
  type InspectionLocation,
} from "../services/location.service";

export default function ScheduleInspectionPage() {
  const { state } = useLocation() as { state?: { listingId?: string } };
  const navigate = useNavigate();
  const listingId = state?.listingId;

  const [locations, setLocations] = useState<InspectionLocation[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [inspectionType, setInspectionType] = useState<"ONSITE" | "COMPANY">(
    "ONSITE",
  );
  const [inspectionLocationId, setInspectionLocationId] = useState<string>("");
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [error, setError] = useState("");

  // Fetch company locations when inspection type changes to COMPANY
  useEffect(() => {
    if (inspectionType === "COMPANY") {
      setIsLoadingLocations(true);
      locationService
        .getMyCompanyLocation()
        .then(setLocations)
        .catch((e) => {
          console.error(e);
          setLocations([]);
        })
        .finally(() => setIsLoadingLocations(false));
    }
  }, [inspectionType]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    if (!listingId) return setError("Missing listing id");
    if (!scheduledAt) return setError("Vui lòng chọn thời gian");
    if (inspectionType === "COMPANY" && !inspectionLocationId)
      return setError("Vui lòng chọn địa điểm kiểm tra");

    const payload: any = {
      inspectionType,
      listingId,
      scheduledAt: new Date(scheduledAt).toISOString(),
    };
    // Only add locationId for COMPANY type
    if (inspectionType === "COMPANY")
      payload.inspectionLocationId = inspectionLocationId;

    const ok = await inspectionService.requestInspection(payload as any);
    if (ok) {
      navigate("/seller/dashboard");
    } else {
      setError("Đặt lịch kiểm tra thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-xl font-bold mb-4">Chọn lịch kiểm tra</h2>
        {error && <div className="text-red-600 mb-3">{error}</div>}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Loại kiểm tra</label>
              <select
                className="mt-1 w-full border rounded p-2"
                value={inspectionType}
                onChange={(e) => setInspectionType(e.target.value as any)}
              >
                <option value="ONSITE">Tại nơi bán (ONSITE)</option>
                <option value="COMPANY">Tại trung tâm (COMPANY)</option>
              </select>
            </div>

            {inspectionType === "ONSITE" && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded text-sm text-blue-700">
                <p className="font-semibold">📍 Kiểm tra tại nơi bán</p>
                <p className="mt-1">
                  Kiểm tra viên sẽ đến địa chỉ bạn nhập lúc tạo tin để kiểm tra
                  xe.
                </p>
              </div>
            )}

            {inspectionType === "COMPANY" && (
              <div>
                <label className="block text-sm font-medium">
                  Chọn địa điểm kiểm tra
                </label>
                {isLoadingLocations ? (
                  <p>Đang tải địa điểm...</p>
                ) : (
                  <select
                    className="mt-1 w-full border rounded p-2"
                    value={inspectionLocationId || ""}
                    onChange={(e) => setInspectionLocationId(e.target.value)}
                  >
                    <option value="">-- Chọn địa điểm --</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.addressLine || l.contactName || l.id}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium">
                Thời gian dự kiến
              </label>
              <input
                className="mt-1 w-full border rounded p-2"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={handleSubmit}
              >
                Xác nhận và đặt lịch
              </button>
              <button
                className="border px-4 py-2 rounded"
                onClick={() => navigate("/seller/dashboard")}
              >
                Huỷ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
