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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl p-6">
        <h2 className="mb-4 text-xl font-bold">Chọn lịch kiểm tra</h2>
        {error && <div className="mb-3 text-red-600">{error}</div>}

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Loại kiểm tra</label>
              <select
                className="mt-1 w-full rounded border p-2"
                value={inspectionType}
                onChange={(e) =>
                  handleInspectionTypeChange(
                    e.target.value as "ONSITE" | "COMPANY",
                  )
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
                className="rounded bg-green-600 px-4 py-2 text-white"
                onClick={handleSubmit}
              >
                Xác nhận và đặt lịch
              </button>
              <button
                className="rounded border px-4 py-2"
                onClick={() =>
                  listingId && navigate(`/seller/choose-plan/${listingId}`)
                }
              >
                Chọn gói trước
              </button>
              <button
                className="rounded border px-4 py-2"
                onClick={() => navigate("/seller/dashboard")}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
