import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { inspectionService } from "../services/inspection.service";
import {
  locationService,
  type InspectionLocation,
} from "../services/location.service";
import { addressService, type Address, type AddressPayload } from "../services/address.service";

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

  // ONSITE contact info state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState<boolean>(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [editing, setEditing] = useState<boolean>(false);
  const [addressForm, setAddressForm] = useState<AddressPayload>({ nameContact: "", phoneContact: "", addressLine: "" });

  // Min datetime for input (prevent selecting past)
  const nowForInput = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const minDateTime = `${nowForInput.getFullYear()}-${pad(nowForInput.getMonth() + 1)}-${pad(nowForInput.getDate())}T${pad(nowForInput.getHours())}:${pad(nowForInput.getMinutes())}`;

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
    if (inspectionType === "ONSITE") {
      setIsLoadingAddresses(true);
      addressService.getMyAddresses()
        .then((data) => {
          setAddresses(data);
          if (data.length > 0) setSelectedAddressId(data[0].id);
        })
        .catch((e) => {
          console.error(e);
          setAddresses([]);
        })
        .finally(() => setIsLoadingAddresses(false));
    }
  }, [inspectionType]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    if (!listingId) return setError("Missing listing id");
    if (!scheduledAt) return setError("Vui lòng chọn thời gian");
    const selectedMs = new Date(scheduledAt).getTime();
    const nowMs = Date.now();
    if (Number.isNaN(selectedMs) || selectedMs < nowMs) {
      return setError("Không thể chọn thời gian trong quá khứ.");
    }
    if (inspectionType === "COMPANY" && !inspectionLocationId)
      return setError("Vui lòng chọn địa điểm kiểm tra");

    const payload: any = {
      inspectionType,
      listingId,
      scheduledAt: new Date(scheduledAt).toISOString(),
    };
    if (inspectionType === 'ONSITE') {
      // attach current contact snapshot for inspector reference
      const addr = addresses.find(a => a.id === selectedAddressId);
      if (addr) {
        payload.contact = {
          nameContact: addr.nameContact,
          phoneContact: addr.phoneContact,
          addressLine: addr.addressLine,
        };
      }
    }
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
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded text-sm text-blue-700">
                  <p className="font-semibold">📍 Kiểm tra tại nơi bán</p>
                  <p className="mt-1">Kiểm tra viên sẽ đến địa chỉ bạn đã lưu trong thông tin liên hệ.</p>
                </div>

                {/* Address selector and inline edit */}
                <div className="bg-white border rounded p-4">
                  <label className="block text-sm font-medium mb-2">Thông tin liên hệ</label>
                  {isLoadingAddresses ? (
                    <p>Đang tải địa chỉ...</p>
                  ) : addresses.length === 0 ? (
                    <p className="text-sm text-slate-500">Chưa có địa chỉ. Hãy thêm trong trang Đăng tin trước khi đặt lịch.</p>
                  ) : (
                    <>
                      <select
                        className="w-full border rounded p-2 mb-3"
                        value={selectedAddressId ?? ''}
                        onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                      >
                        {addresses.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.nameContact} • {a.phoneContact} • {a.addressLine}
                          </option>
                        ))}
                      </select>

                      {!editing ? (
                        <div className="text-sm text-slate-700 space-y-1">
                          {(() => {
                            const a = addresses.find(x => x.id === selectedAddressId) ?? addresses[0];
                            return (
                              <>
                                <p><span className="font-semibold">Tên:</span> {a?.nameContact}</p>
                                <p><span className="font-semibold">Điện thoại:</span> {a?.phoneContact}</p>
                                <p><span className="font-semibold">Địa chỉ:</span> {a?.addressLine}</p>
                              </>
                            );
                          })()}
                          <button
                            type="button"
                            className="mt-2 text-green-600 font-semibold text-sm"
                            onClick={() => {
                              const a = addresses.find(x => x.id === selectedAddressId) ?? addresses[0];
                              if (!a) return;
                              setAddressForm({ nameContact: a.nameContact, phoneContact: a.phoneContact, addressLine: a.addressLine });
                              setEditing(true);
                            }}
                          >
                            Chỉnh sửa
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            className="w-full border rounded p-2"
                            placeholder="Họ và tên"
                            value={addressForm.nameContact}
                            onChange={(e) => setAddressForm({ ...addressForm, nameContact: e.target.value })}
                          />
                          <input
                            className="w-full border rounded p-2"
                            placeholder="Số điện thoại"
                            value={addressForm.phoneContact}
                            onChange={(e) => setAddressForm({ ...addressForm, phoneContact: e.target.value })}
                          />
                          <textarea
                            className="w-full border rounded p-2"
                            rows={2}
                            placeholder="Địa chỉ chi tiết"
                            value={addressForm.addressLine}
                            onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="bg-green-600 text-white px-3 py-2 rounded"
                              onClick={async () => {
                                if (!selectedAddressId) return;
                                await addressService.updateAddress(selectedAddressId, addressForm);
                                const data = await addressService.getMyAddresses();
                                setAddresses(data);
                                setEditing(false);
                              }}
                            >
                              Lưu
                            </button>
                            <button
                              type="button"
                              className="border px-3 py-2 rounded"
                              onClick={() => setEditing(false)}
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      )}
                    </>
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
                min={minDateTime}
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
