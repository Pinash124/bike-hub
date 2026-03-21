import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { addressService, type Address } from "../services/address.service";
import { inspectionService } from "../services/inspection.service";
import { listingService } from "../services/listing.service";
import {
  locationService,
  type InspectionLocation,
} from "../services/location.service";

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

const markListingScheduled = (listingId: string) => {
  const normalizedId = String(listingId);
  const scheduled = readListByKey(SCHEDULED_LISTING_IDS_KEY);
  if (!scheduled.includes(normalizedId)) {
    localStorage.setItem(
      SCHEDULED_LISTING_IDS_KEY,
      JSON.stringify([...scheduled, normalizedId]),
    );
  }

  const paid = readListByKey(PAID_LISTING_IDS_KEY).filter(
    (id) => id !== normalizedId,
  );
  localStorage.setItem(PAID_LISTING_IDS_KEY, JSON.stringify(paid));
};

const hasLocalPaidMark = (listingId: string): boolean => {
  try {
    const raw = localStorage.getItem(PAID_LISTING_IDS_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) && parsed.includes(String(listingId));
  } catch {
    return false;
  }
};

export default function ScheduleInspectionPage() {
  const [searchParams] = useSearchParams();
  const { state } = useLocation() as { state?: { listingId?: string } };
  const navigate = useNavigate();
  const listingId =
    state?.listingId ?? searchParams.get("listingId") ?? undefined;

  const [locations, setLocations] = useState<InspectionLocation[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [inspectionType, setInspectionType] = useState<"ONSITE" | "COMPANY">(
    "ONSITE",
  );
  const [inspectionLocationId, setInspectionLocationId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [error, setError] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );

  const selectedAddress = useMemo(
    () =>
      addresses.find((address) => String(address.id) === selectedAddressId) ??
      null,
    [addresses, selectedAddressId],
  );
  const hasContactInfo = addresses.length > 0 && selectedAddress !== null;

  const nowForInput = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const minDateTime = `${nowForInput.getFullYear()}-${pad(nowForInput.getMonth() + 1)}-${pad(nowForInput.getDate())}T${pad(nowForInput.getHours())}:${pad(nowForInput.getMinutes())}`;

  useEffect(() => {
    const loadData = async () => {
      if (inspectionType === "COMPANY") {
        setIsLoadingLocations(true);
        try {
          const data = await locationService.getMyCompanyLocation();
          setLocations(data);
        } catch (err) {
          console.error(err);
          setLocations([]);
        } finally {
          setIsLoadingLocations(false);
        }
        return;
      }

      setIsLoadingAddresses(true);
      try {
        const data = await addressService.getMyAddresses();
        setAddresses(data);
        setSelectedAddressId(data[0] ? String(data[0].id) : null);
      } catch (err) {
        console.error(err);
        setAddresses([]);
        setSelectedAddressId(null);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    void loadData();
  }, [inspectionType]);

  const goToProfile = () => {
    navigate("/profile", {
      state: {
        returnTo: "/seller/schedule",
        listingId,
      },
    });
  };

  const handleInspectionTypeChange = (value: "ONSITE" | "COMPANY") => {
    if (value === "ONSITE" && !isLoadingAddresses && addresses.length === 0) {
      setInspectionType("ONSITE");
      setError(
        "Ban can cap nhat thong tin lien he trong Profile truoc khi chon kiem dinh tai noi ban.",
      );
      return;
    }

    setError("");
    setInspectionType(value);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");

    if (!listingId) {
      setError("Missing listing id.");
      return;
    }
    if (!scheduledAt) {
      setError("Vui long chon thoi gian.");
      return;
    }

    const selectedMs = new Date(scheduledAt).getTime();
    if (Number.isNaN(selectedMs) || selectedMs < Date.now()) {
      setError("Khong the chon thoi gian trong qua khu.");
      return;
    }

    if (inspectionType === "ONSITE" && !hasContactInfo) {
      setError(
        "Ban chua co thong tin lien he cho kiem dinh tai noi ban. Vui long cap nhat trong Profile.",
      );
      return;
    }

    if (inspectionType === "COMPANY" && !inspectionLocationId) {
      setError("Vui long chon dia diem kiem tra.");
      return;
    }

    try {
      const listing = await listingService.getSellerListingById(listingId);
      const isPaidLocally = hasLocalPaidMark(listingId);
      if (listing?.status === "DRAFT" && !isPaidLocally) {
        setError(
          "Listing dang o trang thai DRAFT. Vui long chon goi va thanh toan truoc khi dat lich kiem dinh.",
        );
        return;
      }
    } catch {
      setError("Khong the kiem tra trang thai listing. Vui long thu lai.");
      return;
    }

    const payload: {
      inspectionType: "ONSITE" | "COMPANY";
      listingId: string;
      scheduledAt: string;
      inspectionLocationId?: string;
      contact?: {
        nameContact: string;
        phoneContact: string;
        addressLine: string;
      };
    } = {
      inspectionType,
      listingId,
      scheduledAt: new Date(scheduledAt).toISOString(),
    };

    if (inspectionType === "ONSITE" && selectedAddress) {
      payload.contact = {
        nameContact: selectedAddress.nameContact,
        phoneContact: selectedAddress.phoneContact,
        addressLine: selectedAddress.addressLine,
      };
    }

    if (inspectionType === "COMPANY") {
      payload.inspectionLocationId = inspectionLocationId;
    }

    const ok = await inspectionService.requestInspection(payload);
    if (ok) {
      markListingScheduled(listingId);
      navigate("/seller/dashboard");
      return;
    }

    setError("Dat lich kiem tra that bai. Vui long thu lai.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-3xl p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate("/seller/dashboard")}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Quay lại
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Đặt lịch kiểm tra
            </h1>
            <p className="mt-2 text-slate-600">
              Chọn loại kiểm tra, địa điểm và thời gian phù hợp
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="font-medium">Có lỗi xảy ra</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Main Form Card */}
        <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Inspection Type */}
            <div className="space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                  1
                </span>
                <label className="text-lg font-semibold text-slate-900">
                  Chọn loại kiểm tra
                </label>
              </div>
              <select
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 transition-colors hover:border-slate-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                value={inspectionType}
                onChange={(e) =>
                  handleInspectionTypeChange(
                    e.target.value as "ONSITE" | "COMPANY",
                  )
                }
              >
                <option value="ONSITE">
                  🏠 Tại nhà (kiểm tra tại nơi bán)
                </option>
                <option value="COMPANY">🏢 Tại trung tâm của chúng tôi</option>
              </select>
            </div>

            {/* Step 2: Location Info */}
            <div className="space-y-4 border-t border-slate-200 pt-8">
              <div className="flex items-baseline gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                  2
                </span>
                <label className="text-lg font-semibold text-slate-900">
                  {inspectionType === "ONSITE"
                    ? "Thông tin liên hệ"
                    : "Chọn địa điểm kiểm tra"}
                </label>
              </div>

              {inspectionType === "ONSITE" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4 ring-1 ring-blue-200">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">ℹ️ Gợi ý:</span> Kiểm tra
                      viên sẽ đến địa chỉ bạn đã lưu trong Profile
                    </p>
                    <button
                      type="button"
                      onClick={goToProfile}
                      className="ml-4 inline-block whitespace-nowrap text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Cập nhật →
                    </button>
                  </div>

                  {isLoadingAddresses ? (
                    <div className="flex items-center justify-center rounded-lg border border-slate-200 py-8">
                      <div className="space-y-2 text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-green-600 mx-auto"></div>
                        <p className="text-sm text-slate-600">
                          Đang tải thông tin liên hệ...
                        </p>
                      </div>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
                      <p className="font-semibold">
                        ⚠️ Chưa có thông tin liên hệ
                      </p>
                      <p className="mt-2 text-sm">
                        Vui lòng vào Profile để thêm tên liên hệ, số điện thoại
                        và địa chỉ trước khi tiếp tục.
                      </p>
                      <button
                        type="button"
                        onClick={goToProfile}
                        className="mt-4 rounded-lg bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-700"
                      >
                        Đi tới Profile
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <select
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 transition-colors hover:border-slate-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                        value={selectedAddressId ?? ""}
                        onChange={(e) =>
                          setSelectedAddressId(e.target.value || null)
                        }
                      >
                        {addresses.map((address) => (
                          <option
                            key={String(address.id)}
                            value={String(address.id)}
                          >
                            {address.nameContact} - {address.phoneContact}
                          </option>
                        ))}
                      </select>

                      {selectedAddress && (
                        <div className="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200">
                          <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-3">
                              <span className="mt-1 text-lg">👤</span>
                              <div>
                                <p className="font-medium text-slate-600">
                                  Tên
                                </p>
                                <p className="text-slate-900">
                                  {selectedAddress.nameContact}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="mt-1 text-lg">📱</span>
                              <div>
                                <p className="font-medium text-slate-600">
                                  Điện thoại
                                </p>
                                <p className="text-slate-900">
                                  {selectedAddress.phoneContact}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="mt-1 text-lg">📍</span>
                              <div>
                                <p className="font-medium text-slate-600">
                                  Địa chỉ
                                </p>
                                <p className="text-slate-900">
                                  {selectedAddress.addressLine}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {inspectionType === "COMPANY" && (
                <div className="space-y-3">
                  {isLoadingLocations ? (
                    <div className="flex items-center justify-center rounded-lg border border-slate-200 py-8">
                      <div className="space-y-2 text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-green-600 mx-auto"></div>
                        <p className="text-sm text-slate-600">
                          Đang tải địa điểm...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <select
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 transition-colors hover:border-slate-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                      value={inspectionLocationId}
                      onChange={(e) => setInspectionLocationId(e.target.value)}
                    >
                      <option value="">-- Chọn địa điểm --</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.addressLine ||
                            location.contactName ||
                            location.id}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>

            {/* Step 3: Date Time */}
            <div className="space-y-4 border-t border-slate-200 pt-8">
              <div className="flex items-baseline gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                  3
                </span>
                <label className="text-lg font-semibold text-slate-900">
                  Chọn thời gian kiểm tra
                </label>
              </div>
              <input
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 transition-colors hover:border-slate-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                type="datetime-local"
                min={minDateTime}
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
              <p className="text-xs text-slate-500">
                ℹ️ Vui lòng chọn thời gian trong tương lai
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-8 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/seller/dashboard")}
                className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-900 transition-colors hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50"
              >
                ✓ Xác nhận và đặt lịch
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
