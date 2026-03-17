import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addressService, type Address } from "../services/address.service";
import { inspectionService } from "../services/inspection.service";
import {
  locationService,
  type InspectionLocation,
} from "../services/location.service";

type InspectionType = "ONSITE" | "COMPANY";

type InspectionRequestPayload = {
  inspectionType: InspectionType;
  listingId: string;
  scheduledAt: string;
  inspectionLocationId?: string;
  contact?: {
    nameContact: string;
    phoneContact: string;
    addressLine: string;
  };
};

const PROFILE_ROUTE = "/profile";
const SELLER_DASHBOARD_ROUTE = "/seller/dashboard";

const formatInputDateTime = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function ScheduleInspectionPage() {
  const { state } = useLocation() as { state?: { listingId?: string } };
  const navigate = useNavigate();
  const listingId = state?.listingId;

  const [locations, setLocations] = useState<InspectionLocation[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [inspectionType, setInspectionType] =
    useState<InspectionType>("ONSITE");
  const [inspectionLocationId, setInspectionLocationId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [error, setError] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const minDateTime = useMemo(() => formatInputDateTime(new Date()), []);

  const loadCompanyLocations = async () => {
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
  };

  const loadAddresses = async () => {
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

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      if (inspectionType === "COMPANY") {
        await loadCompanyLocations();
        return;
      }

      await loadAddresses();
    };

    void loadData();
  }, [inspectionType]);

  const goToProfile = () => {
    navigate(PROFILE_ROUTE, {
      state: {
        returnTo: "/seller/schedule",
        listingId,
      },
    });
  };

  const handleInspectionTypeChange = (value: InspectionType) => {
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

  const validateForm = (): string | null => {
    if (!listingId) return "Missing listing id.";
    if (!scheduledAt) return "Vui long chon thoi gian.";

    const selectedMs = new Date(scheduledAt).getTime();
    if (Number.isNaN(selectedMs) || selectedMs < Date.now()) {
      return "Khong the chon thoi gian trong qua khu.";
    }

    if (inspectionType === "ONSITE" && !hasContactInfo) {
      return "Ban chua co thong tin lien he cho kiem dinh tai noi ban. Vui long cap nhat trong Profile.";
    }

    if (inspectionType === "COMPANY" && !inspectionLocationId) {
      return "Vui long chon dia diem kiem tra.";
    }

    return null;
  };

  const buildPayload = (): InspectionRequestPayload | null => {
    if (!listingId) return null;

    const payload: InspectionRequestPayload = {
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

    return payload;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = buildPayload();
    if (!payload) {
      setError("Missing listing id.");
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await inspectionService.requestInspection(payload);
      if (ok) {
        navigate(SELLER_DASHBOARD_ROUTE);
        return;
      }

      setError("Dat lich kiem tra that bai. Vui long thu lai.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl p-6">
        <h2 className="mb-4 text-xl font-bold">Chọn lịch kiểm tra</h2>
        {error && <div className="mb-3 text-red-600">{error}</div>}

        <form
          className="rounded-lg bg-white p-6 shadow"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Loại kiểm tra</label>
              <select
                className="mt-1 w-full rounded border p-2"
                value={inspectionType}
                onChange={(e) =>
                  handleInspectionTypeChange(e.target.value as InspectionType)
                }
              >
                <option value="ONSITE">Tại nhà (kiểm tra tại nơi bán)</option>
                <option value="COMPANY">Tại trung tâm</option>
              </select>
            </div>

            {inspectionType === "ONSITE" && (
              <div className="space-y-3">
                <div className="rounded border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                  <p className="font-semibold">Kiểm tra tại nhà</p>
                  <p className="mt-1">
                    Kiểm tra viên sẽ đến địa chỉ bạn đã lưu trong Profile.
                  </p>
                </div>

                <div className="rounded border p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <label className="block text-sm font-medium">
                      Thông tin liên hệ
                    </label>
                    <button
                      type="button"
                      onClick={goToProfile}
                      className="text-sm font-semibold text-green-600"
                    >
                      Cập nhật trong Profile
                    </button>
                  </div>

                  {isLoadingAddresses ? (
                    <p>Đang tải thông tin liên hệ...</p>
                  ) : addresses.length === 0 ? (
                    <div className="rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      <p className="font-semibold">
                        Chưa có thông tin liên hệ cho kiểm định tại nhà.
                      </p>
                      <p className="mt-1">
                        Vui lòng vào Profile để thêm tên liên hệ, số điện thoại
                        và địa chỉ trước khi tiếp tục.
                      </p>
                      <button
                        type="button"
                        onClick={goToProfile}
                        className="mt-3 rounded bg-amber-500 px-3 py-2 text-xs font-bold uppercase tracking-widest text-white"
                      >
                        Đi tới Profile
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <select
                        className="w-full rounded border p-2"
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
                            {address.nameContact} - {address.phoneContact} -{" "}
                            {address.addressLine}
                          </option>
                        ))}
                      </select>

                      {selectedAddress && (
                        <div className="space-y-1 text-sm text-slate-700">
                          <p>
                            <span className="font-semibold">Tên:</span>{" "}
                            {selectedAddress.nameContact}
                          </p>
                          <p>
                            <span className="font-semibold">Điện thoại:</span>{" "}
                            {selectedAddress.phoneContact}
                          </p>
                          <p>
                            <span className="font-semibold">Địa chỉ:</span>{" "}
                            {selectedAddress.addressLine}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
                    className="mt-1 w-full rounded border p-2"
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

            <div>
              <label className="block text-sm font-medium">
                Thời gian dự kiến
              </label>
              <input
                className="mt-1 w-full rounded border p-2"
                type="datetime-local"
                min={minDateTime}
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded bg-green-600 px-4 py-2 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Dang dat lich..." : "Xác nhận và đặt lịch"}
              </button>
              <button
                type="button"
                className="rounded border px-4 py-2"
                onClick={() => navigate(SELLER_DASHBOARD_ROUTE)}
              >
                Hủy
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
