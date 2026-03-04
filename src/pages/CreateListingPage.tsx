// src/pages/CreateListingPage.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle } from "lucide-react";
import { brandService, type Brand } from "../services/brand.service";
import { listingService } from "../services/listing.service";
import {
  addressService,
  type Address,
  type AddressPayload,
} from "../services/address.service"; // new imports for contact/address

const BIKE_TYPES = [
  { value: "MTB_BIKE", label: "Xe địa hình (MTB)", emoji: "🏔️" },
  { value: "ROAD_BIKE", label: "Xe đua (Road)", emoji: "🚴" },
];

interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}

function Field({ label, required, children, hint }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest">
        {label}
        {required && <span className="text-red-400 text-[10px] ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-400 pl-1">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all";

export default function CreateListingPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    brandName: "",
    bikeType: "MTB_BIKE",
    usageDuration: "",
    frameNumber: "",
  });

  // ---------- address/contact state ----------
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressPayload>({
    nameContact: "",
    phoneContact: "",
    addressLine: "",
  });
  const [addressError, setAddressError] = useState("");
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    brandService.getAllBrands().then(setBrands);
  }, []);

  useEffect(() => {
    // fetch existing addresses when page loads
    addressService
      .getMyAddresses()
      .then((data) => {
        setAddresses(data);
        if (data.length === 0) {
          // force user to add one before allowing submit
          setShowAddressForm(true);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoadingAddresses(false));
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError("");
    try {
      if (editingAddressId) {
        await addressService.updateAddress(editingAddressId, addressForm);
      } else {
        await addressService.addAddress(addressForm);
      }
      const data = await addressService.getMyAddresses();
      setAddresses(data);
      setShowAddressForm(false);
      setEditingAddressId(null);
      setAddressForm({ nameContact: "", phoneContact: "", addressLine: "" });
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Thao tác thất bại";
      setAddressError(msg);
    }
  };

  const startEditAddress = (a: Address) => {
    setAddressForm({
      nameContact: a.nameContact,
      phoneContact: a.phoneContact,
      addressLine: a.addressLine,
    });
    setEditingAddressId(a.id);
    setShowAddressForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles]);
      const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (addresses.length === 0) {
      setError("Vui lòng nhập thông tin liên hệ trước khi đăng tin.");
      setShowAddressForm(true);
      return;
    }

    if (images.length < 3) {
      setError("Vui lòng tải lên ít nhất 3 ảnh để người mua thấy rõ xe.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const fd = new FormData();

      // Only append non-empty fields — backend rejects extra blank fields
      if (formData.title) fd.append("title", formData.title);
      if (formData.brandName) fd.append("brandName", formData.brandName);
      if (formData.bikeType) fd.append("bikeType", formData.bikeType);
      if (formData.frameNumber) fd.append("frameNumber", formData.frameNumber);
      if (formData.description) fd.append("description", formData.description);
      if (formData.price) fd.append("price", formData.price);
      if (formData.usageDuration)
        fd.append("usageDuration", formData.usageDuration);

      images.forEach((img) => fd.append("images", img));

      const created = await listingService.createListing(fd);
      if (created && created.id) {
        // Navigate to scheduling page so seller can choose inspection slot
        navigate("/seller/schedule", { state: { listingId: created.id } });
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate("/seller/dashboard"), 1800);
    } catch (err: any) {
      // Show actual backend error message
      const backendMsg = err?.response?.data?.message;
      console.error("Create listing raw error:", err?.response?.data);
      setError(
        backendMsg || err.message || "Đăng tin thất bại. Vui lòng thử lại.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const priceNum = Number(formData.price);
  const priceFormatted =
    priceNum > 0 ? priceNum.toLocaleString("vi-VN") + " ₫" : null;

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Đăng tin thành công!
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Xe của bạn đang chờ kiểm duyệt. Chúng tôi sẽ xét duyệt trong thời
            gian sớm nhất.
          </p>
          <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-bold animate-pulse">
            <Loader2 size={16} className="animate-spin" />
            Đang chuyển về trang quản lý...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/seller/dashboard")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-semibold"
          >
            Quay lại
          </button>
          <div className="flex items-center gap-2.5">
            <span className="font-black text-slate-800 text-sm uppercase tracking-wide">
              Đăng xe bán
            </span>
          </div>
          <div className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
            {images.length}/3+ ảnh
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* LEFT COLUMN — main inputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm">
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* -------- address/contact section -------- */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 bg-gradient-to-r from-slate-50 to-white flex items-center gap-2">
                <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">
                  Thông tin liên hệ
                </h2>
              </div>
              <div className="p-6">
                {isLoadingAddresses ? (
                  <p>Đang tải địa chỉ...</p>
                ) : showAddressForm ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Tên người liên hệ
                      </label>
                      <input
                        required
                        name="nameContact"
                        value={addressForm.nameContact}
                        onChange={handleAddressInputChange}
                        className={inputCls}
                        placeholder="Họ và tên"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Số điện thoại
                      </label>
                      <input
                        required
                        name="phoneContact"
                        value={addressForm.phoneContact}
                        onChange={handleAddressInputChange}
                        className={inputCls}
                        placeholder="0912xxx"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Địa chỉ
                      </label>
                      <textarea
                        required
                        name="addressLine"
                        value={addressForm.addressLine}
                        onChange={handleAddressInputChange}
                        rows={2}
                        className={`${inputCls} resize-none`}
                        placeholder="Số nhà, đường, phường/quận, tỉnh"
                      />
                    </div>
                    {addressError && (
                      <p className="text-red-600 text-sm">{addressError}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleAddressSubmit}
                        className="bg-green-600 text-white py-2 px-4 rounded-xl font-black text-sm"
                      >
                        Lưu địa chỉ
                      </button>
                      {addresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddressForm(false);
                            setEditingAddressId(null);
                            setAddressForm({
                              nameContact: "",
                              phoneContact: "",
                              addressLine: "",
                            });
                          }}
                          className="py-2 px-4 rounded-xl text-slate-500 border border-slate-200"
                        >
                          Huỷ
                        </button>
                      )}
                    </div>
                  </div>
                ) : addresses.length === 0 ? (
                  <p>Chưa có địa chỉ. Vui lòng thêm để tiếp tục.</p>
                ) : (
                  <div className="space-y-2">
                    {addresses.map((a) => (
                      <div
                        key={a.id}
                        className="rounded-xl border border-slate-100 p-4 flex justify-between items-start"
                      >
                        <div>
                          <p className="font-bold text-slate-700">
                            {a.nameContact}
                          </p>
                          <p className="text-sm text-slate-500">
                            {a.phoneContact}
                          </p>
                          <p className="text-sm text-slate-500">
                            {a.addressLine}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => startEditAddress(a)}
                          className="text-green-600 text-xs font-semibold"
                        >
                          Chỉnh sửa
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section: Thông tin chính */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 bg-gradient-to-r from-slate-50 to-white flex items-center gap-2">
                <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">
                  Thông tin cơ bản
                </h2>
              </div>
              <div className="p-6 space-y-5">
                <Field
                  label="Tiêu đề"
                  required
                  hint="Ví dụ: Trek Marlin 5 2022 — đầy đủ tên + năm SX"
                >
                  <input
                    required
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={inputCls}
                    placeholder="Trek Marlin 5 2022, Giant Escape 3..."
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Thương hiệu" required>
                    <select
                      required
                      name="brandName"
                      value={formData.brandName}
                      onChange={handleInputChange}
                      className={inputCls}
                    >
                      <option value="">Chọn thương hiệu</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                      <option value="Other">Khác</option>
                    </select>
                  </Field>

                  <Field label="Loại xe" required>
                    <select
                      required
                      name="bikeType"
                      value={formData.bikeType}
                      onChange={handleInputChange}
                      className={inputCls}
                    >
                      {BIKE_TYPES.map((bt) => (
                        <option key={bt.value} value={bt.value}>
                          {bt.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>
            </div>

            {/* Section: Kỹ thuật */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 bg-gradient-to-r from-slate-50 to-white flex items-center gap-2">
                <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">
                  Chi tiết kỹ thuật
                </h2>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field
                    label="Số khung"
                    required
                    hint="Thường khắc dưới gầm khung xe"
                  >
                    <input
                      required
                      name="frameNumber"
                      value={formData.frameNumber}
                      onChange={handleInputChange}
                      className={inputCls}
                      placeholder="Ví dụ: ABC123456"
                    />
                  </Field>

                  <Field label="Thời gian sử dụng (năm)" required>
                    <input
                      required
                      type="number"
                      min="0"
                      name="usageDuration"
                      value={formData.usageDuration}
                      onChange={handleInputChange}
                      className={inputCls}
                      placeholder="Nhập số năm"
                    />
                  </Field>
                </div>

                <Field
                  label="Mô tả chi tiết"
                  required
                  hint="Tình trạng xe, phụ kiện đi kèm, lịch sử bảo dưỡng..."
                >
                  <textarea
                    required
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    className={`${inputCls} resize-none`}
                    placeholder="Xe còn mới 95%, mới thay phanh, tặng kèm bơm và mũ bảo hiểm..."
                  />
                </Field>
              </div>
            </div>

            {/* Section: Hình ảnh */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">
                    Hình ảnh
                  </h2>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${images.length >= 3 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                >
                  {images.length >= 3
                    ? "✓ Đủ ảnh"
                    : `Còn thiếu ${3 - images.length} ảnh`}
                </span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-4">
                  {imagePreviews.map((src, i) => (
                    <div
                      key={i}
                      className="relative group aspect-square rounded-xl overflow-hidden border-2 border-slate-100"
                    >
                      <img
                        src={src}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      {i === 0 && (
                        <span className="absolute bottom-0 inset-x-0 bg-green-600/80 text-white text-[9px] font-black text-center py-0.5 uppercase tracking-wider">
                          Ảnh chính
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        X
                      </button>
                    </div>
                  ))}

                  {/* Upload button */}
                  <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-green-400 hover:bg-green-50 flex flex-col items-center justify-center cursor-pointer transition-all group">
                    <input
                      ref={fileRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <span className="text-[10px] font-bold text-slate-300 group-hover:text-green-500 uppercase tracking-wide transition-colors">
                      Thêm ảnh
                    </span>
                  </label>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  Ảnh đầu tiên sẽ là ảnh bìa hiển thị cho người mua. Tối thiểu 3
                  ảnh.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — price + submit */}
          <div className="space-y-5">
            {/* Price */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-24">
              <div className="px-6 py-4 border-b border-slate-50 bg-gradient-to-r from-green-50 to-white flex items-center gap-2">
                <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">
                  Giá bán
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                      ₫
                    </span>
                    <input
                      required
                      type="number"
                      name="price"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      className={`${inputCls} pl-8`}
                      placeholder="0"
                    />
                  </div>
                  {priceFormatted && (
                    <p className="mt-2 text-center text-2xl font-black text-green-600 tracking-tight">
                      {priceFormatted}
                    </p>
                  )}
                </div>

                {/* Checklist */}
                <div className="border-t pt-4 space-y-2.5">
                  {[
                    { ok: formData.title.length > 3, label: "Tiêu đề" },
                    { ok: !!formData.brandName, label: "Thương hiệu" },
                    { ok: !!formData.frameNumber, label: "Số khung" },
                    {
                      ok: !!formData.usageDuration,
                      label: "Thời gian sử dụng",
                    },
                    { ok: formData.description.length > 10, label: "Mô tả" },
                    { ok: Number(formData.price) > 0, label: "Giá bán" },
                    {
                      ok: images.length >= 3,
                      label: `Ảnh (${images.length}/3)`,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 text-xs"
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${item.ok ? "bg-green-100" : "bg-slate-100"}`}
                      >
                        {item.ok ? (
                          <span className="text-green-600 font-bold">✓</span>
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        )}
                      </div>
                      <span
                        className={
                          item.ok
                            ? "text-slate-700 font-semibold"
                            : "text-slate-400"
                        }
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? (
                    <>Đang đăng...</>
                  ) : (
                    <>
                      <span>Đăng tin ngay</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/seller/dashboard")}
                  className="w-full py-3 text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>

            {/* Tips card */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 space-y-3">
              <p className="text-xs font-black text-amber-700 uppercase tracking-widest flex items-center gap-1.5">
                Mẹo đăng xe hiệu quả
              </p>
              <ul className="space-y-2 text-xs text-amber-800 pl-4 list-disc">
                <li>Chụp từ nhiều góc: trước, sau, bên hông, số khung</li>
                <li>Mô tả trung thực về trầy xước, hư hỏng nếu có</li>
                <li>Giá hợp lý + ảnh rõ = bán nhanh hơn 3x</li>
                <li>Số khung giúp xác thực tính hợp pháp của xe</li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
