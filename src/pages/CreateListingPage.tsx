// src/pages/CreateListingPage.tsx
import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Loader2,
  Camera,
  X,
  AlertTriangle,
  Info,
  DollarSign,
  Package,
  Settings,
  Image as ImageIcon,
  Zap,
  Star,
} from "lucide-react";
import { brandService, type Brand } from "../services/brand.service";
import { listingService } from "../services/listing.service";

const BIKE_TYPES = [
  {
    value: "MTB_BIKE",
    label: "Xe địa hình (MTB)",
    emoji: "🚵",
    description: "Phù hợp cho địa hình gồ ghề, off-road",
  },
  {
    value: "ROAD_BIKE",
    label: "Xe đua (Road)",
    emoji: "🚴",
    description: "Nhanh nhẹ trên đường bằng, đua xe",
  },
];

interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}

function Field({ label, required, children, hint }: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        {required && <span className="text-red-500">*</span>}
        {label}
      </label>
      {children}
      {hint && (
        <div className="flex items-start gap-2 pl-1">
          <Info size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-500 leading-relaxed">{hint}</p>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-slate-300";

const selectCls =
  "w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-slate-300 cursor-pointer";

const textareaCls =
  "w-full resize-none rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-slate-300";

export default function CreateListingPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    brandName: "",
    bikeType: "MTB_BIKE",
    usageDuration: "",
    frameNumber: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    brandService.getAllBrands().then(setBrands);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    if (name === "frameNumber") {
      const filteredValue = value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
      setFormData((prev) => ({ ...prev, [name]: filteredValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);

    // Validate file types and sizes
    const validFiles = newFiles.filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== newFiles.length) {
      setError("Một số ảnh không hợp lệ. Vui lòng chọn ảnh JPG, PNG dưới 5MB.");
      return;
    }

    setImages((prev) => [...prev, ...validFiles]);
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setError("");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 5 * 1024 * 1024;
      return isValidType && isValidSize;
    });

    if (validFiles.length > 0) {
      setImages((prev) => [...prev, ...validFiles]);
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
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

  const formValidation = useMemo(() => {
    const errors: Record<string, string> = {};

    if (formData.title.length < 3) {
      errors.title = "Tiêu đề phải có ít nhất 3 ký tự";
    }
    if (formData.title.length > 100) {
      errors.title = "Tiêu đề không quá 100 ký tự";
    }

    if (!formData.brandName) {
      errors.brandName = "Vui lòng chọn thương hiệu";
    }

    if (!formData.frameNumber.trim()) {
      errors.frameNumber = "Vui lòng nhập số khung";
    } else if (formData.frameNumber.length < 5) {
      errors.frameNumber = "Số khung phải có ít nhất 5 ký tự";
    } else if (!/^[A-Z0-9]+$/i.test(formData.frameNumber.trim())) {
      errors.frameNumber = "Số khung chỉ được chứa chữ cái và số";
    }

    const usage = Number.parseInt(formData.usageDuration || "0", 10);
    if (Number.isNaN(usage) || usage < 0 || usage > 10) {
      errors.usageDuration = "Thời gian sử dụng phải từ 0-10 năm";
    }

    if (formData.description.length < 10) {
      errors.description = "Mô tả phải có ít nhất 10 ký tự";
    }
    if (formData.description.length > 2000) {
      errors.description = "Mô tả không quá 2000 ký tự";
    }

    const priceVal = Number.parseInt(formData.price || "0", 10);
    const MIN_PRICE = 100000;
    if (Number.isNaN(priceVal) || priceVal < MIN_PRICE) {
      errors.price = `Giá bán tối thiểu là ${MIN_PRICE.toLocaleString("vi-VN")} VNĐ`;
    }
    if (priceVal > 100000000) {
      errors.price = "Giá bán không quá 100 triệu VNĐ";
    }

    if (images.length < 3) {
      errors.images = "Vui lòng tải lên ít nhất 3 ảnh";
    }

    return errors;
  }, [formData, images.length]);

  const isFormValid = Object.keys(formValidation).length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check validation
    if (!isFormValid) {
      setError("Vui lòng điền đầy đủ thông tin hợp lệ");
      return;
    }

    const usage = Number.parseInt(formData.usageDuration || "0", 10);
    const priceVal = Number.parseInt(formData.price || "0", 10);

    setIsLoading(true);
    setError("");

    try {
      const fd = new FormData();

      if (formData.title) fd.append("title", formData.title.trim());
      if (formData.brandName) fd.append("brandName", formData.brandName);
      if (formData.bikeType) fd.append("bikeType", formData.bikeType);
      if (formData.frameNumber) {
        fd.append("frameNumber", formData.frameNumber.trim());
      }
      if (formData.description) {
        fd.append("description", formData.description.trim());
      }

      fd.append("price", String(priceVal));
      fd.append("usageDuration", String(usage));

      images.forEach((img) => fd.append("images", img));

      const created = await listingService.createListing(fd);
      if (created?.id) {
        setSuccess(true);
        setTimeout(
          () =>
            navigate(`/seller/choose-plan/${created.id}`, { state: { listing: created } }),
          1800,
        );
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate("/seller/dashboard"), 1800);
    } catch (err: unknown) {
      console.error("Create listing error:", err);
      const errorMessage =
        err instanceof Error && err.message
          ? err.message
          : "Đăng tin thất bại. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const priceNum = Number(formData.price);
  const priceFormatted =
    priceNum > 0 ? `${priceNum.toLocaleString("vi-VN")} VND` : null;

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 p-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-12 text-center shadow-2xl border border-green-100">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-100 animate-pulse">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="mb-3 text-2xl font-black text-slate-900">
            Tạo tin thành công! 🎉
          </h2>
          <p className="mb-6 text-slate-600 leading-relaxed">
            Xe đã được tạo. Đang chuyển sang trang chọn gói đăng bài...
          </p>
          <div className="flex animate-pulse items-center justify-center gap-2 text-sm font-semibold text-green-600">
            <Loader2 size={16} className="animate-spin" />
            Đang chuyển trang...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
      {/* Enhanced Header */}
      <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 backdrop-blur-sm shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={() => navigate("/seller/dashboard")}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-800"
          >
            ← Quay lại
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2">
              <Package size={16} className="text-green-600" />
              <span className="text-sm font-bold text-green-700">
                Đăng xe bán
              </span>
            </div>
            <div
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${images.length >= 3
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
                }`}
            >
              {images.length}/3+ ảnh
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white text-sm font-bold">
                1
              </div>
              <span className="text-sm font-semibold text-slate-700">
                Thông tin cơ bản
              </span>
            </div>
            <div className="flex-1 mx-4 h-1 bg-slate-200 rounded-full">
              <div
                className="h-1 bg-green-600 rounded-full"
                style={{ width: "33%" }}
              ></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-400 text-sm font-bold">
                2
              </div>
              <span className="text-sm font-medium text-slate-400">
                Hình ảnh
              </span>
            </div>
            <div className="flex-1 mx-4 h-1 bg-slate-200 rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-400 text-sm font-bold">
                3
              </div>
              <span className="text-sm font-medium text-slate-400">
                Giá bán
              </span>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-8 lg:grid-cols-3"
        >
          <div className="space-y-8 lg:col-span-2">
            {/* Error Alert */}
            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                <AlertTriangle
                  size={20}
                  className="text-red-500 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-sm font-semibold text-red-800">Lỗi</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Basic Information Section */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600">
                  <Info size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Thông tin cơ bản
                  </h2>
                  <p className="text-sm text-slate-600">
                    Thông tin chung về chiếc xe
                  </p>
                </div>
              </div>
              <div className="space-y-6 p-8">
                <Field
                  label="Tiêu đề"
                  required
                  hint="Ví dụ: Trek Marlin 5 2022, Giant Escape 3 - Hãy đặt tiêu đề hấp dẫn!"
                >
                  <div className="relative">
                    <input
                      required
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`${inputCls} ${formValidation.title ? "border-red-300 focus:border-red-500" : ""}`}
                      placeholder="Nhập tên xe"
                      maxLength={100}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      {formData.title.length}/100
                    </div>
                  </div>
                  {formValidation.title && (
                    <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                      <AlertTriangle size={12} />
                      {formValidation.title}
                    </p>
                  )}
                </Field>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Field label="Thương hiệu" required>
                    <select
                      required
                      name="brandName"
                      value={formData.brandName}
                      onChange={handleInputChange}
                      className={`${selectCls} ${formValidation.brandName ? "border-red-300 focus:border-red-500" : ""}`}
                    >
                      <option value="">Chọn thương hiệu</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.name}>
                          {brand.name}
                        </option>
                      ))}
                      <option value="Other">Khác</option>
                    </select>
                    {formValidation.brandName && (
                      <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                        <AlertTriangle size={12} />
                        {formValidation.brandName}
                      </p>
                    )}
                  </Field>

                  <Field label="Loại xe" required>
                    <div className="space-y-2">
                      {BIKE_TYPES.map((type) => (
                        <label
                          key={type.value}
                          className={`flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all ${formData.bikeType === type.value
                            ? "border-green-500 bg-green-50"
                            : "border-slate-200 hover:border-slate-300"
                            }`}
                        >
                          <input
                            type="radio"
                            name="bikeType"
                            value={type.value}
                            checked={formData.bikeType === type.value}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <div className="text-2xl">{type.emoji}</div>
                          <div className="flex-1">
                            <div className="font-semibold text-slate-800">
                              {type.label}
                            </div>
                            <div className="text-xs text-slate-500">
                              {type.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </Field>
                </div>
              </div>
            </div>

            {/* Technical Details Section */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                  <Settings size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Chi tiết kỹ thuật
                  </h2>
                  <p className="text-sm text-slate-600">
                    Thông số kỹ thuật của xe
                  </p>
                </div>
              </div>
              <div className="space-y-6 p-8">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Field
                    label="Số khung"
                    required
                    hint="Thường khắc ở phần gầm khung - rất quan trọng để kiểm định"
                  >
                    <div className="relative">
                      <input
                        required
                        name="frameNumber"
                        value={formData.frameNumber}
                        onChange={handleInputChange}
                        className={`${inputCls} ${formValidation.frameNumber ? "border-red-300 focus:border-red-500" : ""}`}
                        placeholder="Ví dụ: ABC123456"
                        maxLength={50}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Info size={16} className="text-slate-400" />
                      </div>
                    </div>
                    {formValidation.frameNumber && (
                      <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                        <AlertTriangle size={12} />
                        {formValidation.frameNumber}
                      </p>
                    )}
                  </Field>

                  <Field
                    label="Thời gian sử dụng (năm)"
                    required
                    hint="Số năm xe đã được sử dụng"
                  >
                    <div className="relative">
                      <input
                        required
                        type="number"
                        min="0"
                        max="10"
                        step="1"
                        name="usageDuration"
                        value={formData.usageDuration}
                        onChange={handleInputChange}
                        className={`${inputCls} ${formValidation.usageDuration ? "border-red-300 focus:border-red-500" : ""}`}
                        placeholder="0 - 10"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                        năm
                      </div>
                    </div>
                    {formValidation.usageDuration && (
                      <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                        <AlertTriangle size={12} />
                        {formValidation.usageDuration}
                      </p>
                    )}
                  </Field>
                </div>

                <Field
                  label="Mô tả đầy đủ về tình trạng xe (quan trọng)"
                  required
                  hint="Mô tả trung thực tình trạng xe, phụ kiện đi kèm, lịch sử bảo trì, vết xước, hư hỏng (nếu có)"
                >
                  <div className="relative">
                    <textarea
                      required
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={6}
                      className={`${textareaCls} ${formValidation.description ? "border-red-300 focus:border-red-500" : ""}`}
                      placeholder="Mô tả đầy đủ và trung thực tình trạng hiện tại của xe..."
                      maxLength={2000}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                      {formData.description.length}/2000
                    </div>
                  </div>
                  {formValidation.description && (
                    <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                      <AlertTriangle size={12} />
                      {formValidation.description}
                    </p>
                  )}
                </Field>
              </div>
            </div>

            {/* Images Section */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-purple-50 to-pink-50 px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600">
                    <ImageIcon size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Hình ảnh
                    </h2>
                    <p className="text-sm text-slate-600">
                      Tải lên ít nhất 3 ảnh chất lượng cao
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${images.length >= 3
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-amber-100 text-amber-700 border border-amber-200"
                    }`}
                >
                  {images.length >= 3
                    ? "✅ Đủ ảnh"
                    : `⚠️ Cần ${3 - images.length} ảnh nữa`}
                </span>
              </div>
              <div className="p-8">
                <div
                  className={`mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ${isDragging
                    ? "border-2 border-dashed border-purple-400 bg-purple-50"
                    : ""
                    }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {imagePreviews.map((src, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square overflow-hidden rounded-2xl border-2 border-slate-200 hover:border-purple-300 transition-all"
                    >
                      <img
                        src={src}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {index === 0 && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent py-2">
                          <div className="text-center text-[10px] font-black uppercase tracking-wider text-white">
                            ⭐ Ảnh chính
                          </div>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600 shadow-lg"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  <label className="group flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 transition-all hover:border-purple-400 hover:bg-purple-50 hover:shadow-lg">
                    <input
                      ref={fileRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 group-hover:bg-purple-100 transition-colors">
                        <Camera
                          size={20}
                          className="text-slate-400 group-hover:text-purple-600"
                        />
                      </div>
                      <div className="px-2">
                        <span className="text-xs font-bold text-slate-400 group-hover:text-purple-600 transition-colors">
                          Thêm ảnh
                        </span>
                        <span className="text-[10px] text-slate-300 block">
                          hoặc kéo thả
                        </span>
                      </div>
                    </div>
                  </label>
                </div>

                {formValidation.images && (
                  <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <AlertTriangle size={16} className="text-amber-600" />
                    <p className="text-sm text-amber-700">
                      {formValidation.images}
                    </p>
                  </div>
                )}

                <div className="flex items-start gap-2 rounded-xl bg-blue-50 p-4">
                  <Star
                    size={16}
                    className="text-blue-600 mt-0.5 flex-shrink-0"
                  />
                  <div className="text-xs text-blue-700 leading-relaxed">
                    <p className="font-semibold mb-1">
                      Mẹo chụp ảnh chuyên nghiệp:
                    </p>
                    <ul className="space-y-1">
                      <li>• Chụp nhiều góc: trước, sau, hai bên, số khung</li>
                      <li>• Ánh sáng tốt, không bị mờ</li>
                      <li>• Ảnh đầu tiên sẽ làm ảnh bìa</li>
                      <li>• Kích thước tối đa: 5MB/ảnh</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Price Sidebar */}
            <div className="sticky top-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600">
                  <DollarSign size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Giá bán</h2>
                  <p className="text-sm text-slate-600">
                    Đặt giá hợp lý cho xe của bạn
                  </p>
                </div>
              </div>
              <div className="space-y-6 p-8">
                <div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      ₫
                    </span>
                    <input
                      required
                      type="number"
                      name="price"
                      min="100000"
                      max="100000000"
                      value={formData.price}
                      onChange={handleInputChange}
                      className={`${inputCls} pl-10 pr-4 ${formValidation.price ? "border-red-300 focus:border-red-500" : ""}`}
                      placeholder="0"
                    />
                  </div>
                  {formValidation.price && (
                    <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                      <AlertTriangle size={12} />
                      {formValidation.price}
                    </p>
                  )}
                  {priceFormatted && (
                    <div className="mt-3 rounded-xl bg-green-50 p-4 text-center">
                      <p className="text-xs font-semibold text-green-600 mb-1">
                        Giá ước tính
                      </p>
                      <p className="text-2xl font-black text-green-700">
                        {priceFormatted}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3 border-t border-slate-100 pt-6">
                  <p className="text-sm font-bold text-slate-700 mb-4">
                    Kiểm tra thông tin:
                  </p>
                  {[
                    {
                      ok: formData.title.length >= 3 && !formValidation.title,
                      label: "Tiêu đề",
                      icon: "📝",
                    },
                    {
                      ok: !!formData.brandName && !formValidation.brandName,
                      label: "Thương hiệu",
                      icon: "🏷️",
                    },
                    {
                      ok: !!formData.frameNumber && !formValidation.frameNumber,
                      label: "Số khung",
                      icon: "🔢",
                    },
                    {
                      ok:
                        !!formData.usageDuration &&
                        !formValidation.usageDuration,
                      label: "Thời gian sử dụng",
                      icon: "📅",
                    },
                    {
                      ok:
                        formData.description.length >= 10 &&
                        !formValidation.description,
                      label: "Mô tả",
                      icon: "📄",
                    },
                    {
                      ok:
                        Number(formData.price) >= 500000 &&
                        !formValidation.price,
                      label: "Giá bán",
                      icon: "💰",
                    },
                    {
                      ok: images.length >= 3 && !formValidation.images,
                      label: `Ảnh (${images.length}/3+)`,
                      icon: "📸",
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${item.ok
                          ? "bg-green-100 text-green-600 border border-green-200"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                          }`}
                      >
                        {item.ok ? (
                          "✓"
                        ) : (
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{item.icon}</span>
                        <span
                          className={`text-sm font-medium ${item.ok ? "text-slate-700" : "text-slate-400"
                            }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t border-slate-100 pt-6">
                  <button
                    type="submit"
                    disabled={isLoading || !isFormValid}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-green-600/30 transition-all hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:shadow-green-700/40 disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Đang đăng tin...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={18} />
                        <span>Đăng tin ngay</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/seller/dashboard")}
                    className="w-full py-3 text-xs font-bold uppercase tracking-wider text-slate-400 transition-colors hover:text-slate-600"
                  >
                    Hủy bỏ
                  </button>
                </div>
              </div>
            </div>

            {/* Tips Section */}
            <div className="space-y-4 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500">
                  <Star size={16} className="text-white" />
                </div>
                <p className="text-sm font-black uppercase tracking-wider text-amber-700">
                  Mẹo đăng xe hiệu quả
                </p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span className="text-xs text-amber-800 leading-relaxed">
                    Chụp nhiều góc: trước, sau, hai bên, số khung
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span className="text-xs text-amber-800 leading-relaxed">
                    Mô tả trung thực các vết trầy xước hoặc hư hỏng
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span className="text-xs text-amber-800 leading-relaxed">
                    Giá hợp lý và ảnh rõ sẽ giúp bài đăng chuyển đổi tốt hơn
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span className="text-xs text-amber-800 leading-relaxed">
                    Số khung rõ ràng giúp quá trình kiểm định nhanh hơn
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
