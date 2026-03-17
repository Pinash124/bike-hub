// src/pages/EditListingPage.tsx
// Trang sửa listing DRAFT — pre-fills form với dữ liệu hiện tại, sau khi lưu chuyển sang chọn gói
import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  CheckCircle, Loader2, Camera, X, AlertTriangle, Info,
  DollarSign, Package, Settings, Image as ImageIcon, Zap, Star,
} from "lucide-react";
import { brandService, type Brand } from "../services/brand.service";
import { listingService, type Listing } from "../services/listing.service";

const BIKE_TYPES = [
  { value: "MTB_BIKE", label: "Xe địa hình (MTB)", emoji: "🚵", description: "Tiện lợi cho đi lại hàng ngày" },
  { value: "ROAD_BIKE", label: "Xe đua (Road)", emoji: "🚴", description: "Nhanh nhẹ trên đường bằng, đua xe đúng chuẩn api" },
];

const inputCls = "w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-slate-300";
const selectCls = "w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-slate-300 cursor-pointer";
const textareaCls = "w-full resize-none rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-slate-300";

export default function EditListingPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const fileRef = useRef<HTMLInputElement>(null);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "", description: "", price: "",
    brandName: "", bikeType: "MTB_BIKE",
    usageDuration: "", frameNumber: "",
  });
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  // Load listing data
  useEffect(() => {
    brandService.getAllBrands().then(setBrands);

    const locationListing: Listing | undefined = (location.state as any)?.listing;
    if (locationListing) {
      prefillFromListing(locationListing);
      setIsFetching(false);
    } else if (id) {
      listingService.getListingById(id).then((listing) => {
        if (listing) prefillFromListing(listing);
        setIsFetching(false);
      }).catch(() => {
        setError("Không thể tải thông tin xe. Vui lòng thử lại.");
        setIsFetching(false);
      });
    }
  }, [id]);

  const prefillFromListing = (listing: Listing) => {
    setFormData({
      title: listing.title || "",
      description: listing.description || "",
      price: listing.price ? String(listing.price) : "",
      brandName: listing.brand?.name || "",
      bikeType: listing.bikeType || "MTB_BIKE",
      usageDuration: listing.usageDuration != null ? String(listing.usageDuration) : "",
      frameNumber: listing.frameNumber || "",
    });
    if (listing.images?.length) {
      setExistingImages(listing.images.sort((a, b) => a.imageOrder - b.imageOrder).map(img => img.secureUrl));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "frameNumber") {
      setFormData(prev => ({ ...prev, [name]: value.replace(/[^A-Z0-9]/gi, "").toUpperCase() }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).filter(f => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024);
    const totalSlots = Math.max(0, 5 - existingImages.length - newImages.length);
    const filesToAdd = newFiles.slice(0, totalSlots);
    setNewImages(prev => [...prev, ...filesToAdd]);
    setNewImagePreviews(prev => [...prev, ...filesToAdd.map(f => URL.createObjectURL(f))]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024);
    const totalSlots = Math.max(0, 5 - existingImages.length - newImages.length);
    const filesToAdd = files.slice(0, totalSlots);
    setNewImages(prev => [...prev, ...filesToAdd]);
    setNewImagePreviews(prev => [...prev, ...filesToAdd.map(f => URL.createObjectURL(f))]);
  };

  const removeNewImage = (idx: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== idx));
    setNewImagePreviews(prev => { URL.revokeObjectURL(prev[idx]); return prev.filter((_, i) => i !== idx); });
  };

  const totalImages = existingImages.length + newImages.length;

  const formValidation = useMemo(() => {
    const errors: Record<string, string> = {};
    if (formData.title.length < 3) errors.title = "Tiêu đề phải có ít nhất 3 ký tự";
    if (!formData.brandName) errors.brandName = "Vui lòng chọn thương hiệu";
    if (!formData.frameNumber.trim() || formData.frameNumber.length < 5) errors.frameNumber = "Số khung phải có ít nhất 5 ký tự";
    const usage = parseInt(formData.usageDuration || "0", 10);
    if (isNaN(usage) || usage < 0 || usage > 10) errors.usageDuration = "Thời gian sử dụng: 0–10 năm";
    if (formData.description.length < 10) errors.description = "Mô tả phải có ít nhất 10 ký tự";
    const priceVal = parseInt(formData.price || "0", 10);
    if (isNaN(priceVal) || priceVal < 100000) errors.price = "Giá tối thiểu 100.000 VNĐ";
    if (totalImages < 3) errors.images = "Cần ít nhất 3 ảnh";
    return errors;
  }, [formData, totalImages]);

  const isFormValid = Object.keys(formValidation).length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !id) { setError("Vui lòng điền đầy đủ thông tin hợp lệ"); return; }

    setIsLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("title", formData.title.trim());
      fd.append("brandName", formData.brandName);
      fd.append("bikeType", formData.bikeType);
      fd.append("frameNumber", formData.frameNumber.trim());
      fd.append("description", formData.description.trim());
      fd.append("price", String(parseInt(formData.price, 10)));
      fd.append("usageDuration", String(parseInt(formData.usageDuration || "0", 10)));
      newImages.forEach(img => fd.append("images", img));

      const updated = await listingService.updateListing(id, fd);
      if (updated) {
        setSuccess(true);
        setTimeout(() => navigate(`/seller/choose-plan/${id}`, { state: { listing: updated } }), 1500);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-green-600" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 p-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-12 text-center shadow-2xl border border-green-100">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-100 animate-pulse">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="mb-3 text-2xl font-black text-slate-900">Đã cập nhật! 🎉</h2>
          <p className="mb-6 text-slate-600 leading-relaxed">Đang chuyển sang trang chọn gói đăng bài...</p>
          <div className="flex animate-pulse items-center justify-center gap-2 text-sm font-semibold text-green-600">
            <Loader2 size={16} className="animate-spin" /> Đang chuyển trang...
          </div>
        </div>
      </div>
    );
  }

  const priceNum = Number(formData.price);
  const priceFormatted = priceNum > 0 ? `${priceNum.toLocaleString("vi-VN")} VND` : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 backdrop-blur-sm shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button type="button" onClick={() => navigate("/seller/dashboard")}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100"
          >
            ← Quay lại Dashboard
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2">
              <Package size={16} className="text-amber-600" />
              <span className="text-sm font-bold text-amber-700">Chỉnh sửa xe DRAFT</span>
            </div>
            <div className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${totalImages >= 3 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
              {totalImages}/3–5 ảnh
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white text-sm font-bold">1</div>
              <span className="text-sm font-semibold text-slate-700">Cập nhật thông tin</span>
            </div>
            <div className="flex-1 mx-4 h-1 bg-slate-200 rounded-full">
              <div className="h-1 bg-green-600 rounded-full" style={{ width: "33%" }} />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-400 text-sm font-bold">2</div>
              <span className="text-sm font-medium text-slate-400">Chọn gói</span>
            </div>
            <div className="flex-1 mx-4 h-1 bg-slate-200 rounded-full" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-400 text-sm font-bold">3</div>
              <span className="text-sm font-medium text-slate-400">Thanh toán</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Basic Info */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600">
                  <Info size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Thông tin cơ bản</h2>
                  <p className="text-sm text-slate-600">Chỉnh sửa thông tin xe của bạn</p>
                </div>
              </div>
              <div className="space-y-6 p-8">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <span className="text-red-500">*</span> Tiêu đề
                  </label>
                  <input name="title" value={formData.title} onChange={handleInputChange}
                    className={`${inputCls} ${formValidation.title ? "border-red-300" : ""}`}
                    placeholder="Nhập tên xe" maxLength={100}
                  />
                  {formValidation.title && <p className="flex items-center gap-1 text-xs text-red-600 mt-1"><AlertTriangle size={12} />{formValidation.title}</p>}
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <span className="text-red-500">*</span> Thương hiệu
                    </label>
                    <select name="brandName" value={formData.brandName} onChange={handleInputChange} className={selectCls}>
                      <option value="">Chọn thương hiệu</option>
                      {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                      <option value="Other">Khác</option>
                    </select>
                    {formValidation.brandName && <p className="flex items-center gap-1 text-xs text-red-600 mt-1"><AlertTriangle size={12} />{formValidation.brandName}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block"><span className="text-red-500">*</span> Loại xe</label>
                    <div className="space-y-2">
                      {BIKE_TYPES.map(type => (
                        <label key={type.value} className={`flex items-center gap-3 rounded-xl border-2 p-3 cursor-pointer transition-all ${formData.bikeType === type.value ? "border-green-500 bg-green-50" : "border-slate-200 hover:border-slate-300"}`}>
                          <input type="radio" name="bikeType" value={type.value} checked={formData.bikeType === type.value} onChange={handleInputChange} className="sr-only" />
                          <span className="text-xl">{type.emoji}</span>
                          <div>
                            <div className="font-semibold text-slate-800 text-sm">{type.label}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                  <Settings size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Chi tiết kỹ thuật</h2>
                </div>
              </div>
              <div className="space-y-6 p-8">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block"><span className="text-red-500">*</span> Số khung</label>
                    <input name="frameNumber" value={formData.frameNumber} onChange={handleInputChange}
                      className={`${inputCls} ${formValidation.frameNumber ? "border-red-300" : ""}`}
                      placeholder="Ví dụ: ABC123456" maxLength={50}
                    />
                    {formValidation.frameNumber && <p className="flex items-center gap-1 text-xs text-red-600 mt-1"><AlertTriangle size={12} />{formValidation.frameNumber}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block"><span className="text-red-500">*</span> Thời gian sử dụng (năm)</label>
                    <input type="number" min="0" max="10" step="1" name="usageDuration" value={formData.usageDuration} onChange={handleInputChange}
                      className={`${inputCls} ${formValidation.usageDuration ? "border-red-300" : ""}`}
                      placeholder="0 - 10"
                    />
                    {formValidation.usageDuration && <p className="flex items-center gap-1 text-xs text-red-600 mt-1"><AlertTriangle size={12} />{formValidation.usageDuration}</p>}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block"><span className="text-red-500">*</span> Mô tả tình trạng xe</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange}
                    rows={6} className={`${textareaCls} ${formValidation.description ? "border-red-300" : ""}`}
                    placeholder="Mô tả đầy đủ và trung thực tình trạng hiện tại của xe..." maxLength={2000}
                  />
                  {formValidation.description && <p className="flex items-center gap-1 text-xs text-red-600 mt-1"><AlertTriangle size={12} />{formValidation.description}</p>}
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-purple-50 to-pink-50 px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600">
                    <ImageIcon size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Hình ảnh</h2>
                    <p className="text-sm text-slate-600">Hiện có {existingImages.length} ảnh — thêm ảnh mới nếu cần</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${totalImages >= 3 && totalImages <= 5 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {totalImages >= 3 && totalImages <= 5 ? "✅ Đủ ảnh" : totalImages < 3 ? `⚠️ Cần ${3 - totalImages} ảnh` : "⚠️ Quá số ảnh"}
                </span>
              </div>
              <div className="p-8">
                {/* Existing images (read-only preview) */}
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Ảnh hiện tại</p>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                      {existingImages.map((src, idx) => (
                        <div key={idx} className="relative aspect-square overflow-hidden rounded-2xl border-2 border-slate-200">
                          <img src={src} alt={`Ảnh ${idx + 1}`} className="h-full w-full object-cover" />
                          {idx === 0 && (
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent py-1">
                              <div className="text-center text-[9px] font-black uppercase text-white">⭐ Ảnh chính</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* New images */}
                <div
                  className={`grid grid-cols-3 gap-3 sm:grid-cols-5 ${isDragging ? "border-2 border-dashed border-purple-400 bg-purple-50 rounded-2xl p-2" : ""}`}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
                  onDrop={handleDrop}
                >
                  {newImagePreviews.map((src, idx) => (
                    <div key={idx} className="group relative aspect-square overflow-hidden rounded-2xl border-2 border-purple-300">
                      <img src={src} alt={`Mới ${idx + 1}`} className="h-full w-full object-cover" />
                      <button type="button" onClick={() => removeNewImage(idx)}
                        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100 shadow-lg"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {totalImages < 5 && (
                    <label className="group flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 transition-all hover:border-purple-400 hover:bg-purple-50">
                      <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 group-hover:bg-purple-100">
                          <Camera size={20} className="text-slate-400 group-hover:text-purple-600" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 group-hover:text-purple-600">Thêm ảnh</span>
                      </div>
                    </label>
                  )}
                </div>
                {formValidation.images && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <AlertTriangle size={16} className="text-amber-600" />
                    <p className="text-sm text-amber-700">{formValidation.images}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600">
                  <DollarSign size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Giá bán</h2>
                </div>
              </div>
              <div className="space-y-6 p-8">
                <div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₫</span>
                    <input type="number" name="price" min="100000" max="100000000" value={formData.price} onChange={handleInputChange}
                      className={`${inputCls} pl-10 ${formValidation.price ? "border-red-300" : ""}`}
                      placeholder="0"
                    />
                  </div>
                  {formValidation.price && <p className="flex items-center gap-1 text-xs text-red-600 mt-1"><AlertTriangle size={12} />{formValidation.price}</p>}
                  {priceFormatted && (
                    <div className="mt-3 rounded-xl bg-green-50 p-4 text-center">
                      <p className="text-xs font-semibold text-green-600 mb-1">Giá ước tính</p>
                      <p className="text-2xl font-black text-green-700">{priceFormatted}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3 border-t border-slate-100 pt-6">
                  <button type="submit" disabled={isLoading || !isFormValid}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-green-600/30 transition-all hover:from-green-700 hover:to-emerald-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (<><Loader2 size={18} className="animate-spin" /> Đang lưu...</>) : (<><Zap size={18} /> Lưu & Chọn gói đăng bài</>)}
                  </button>
                  <button type="button" onClick={() => navigate("/seller/dashboard")}
                    className="w-full py-3 text-xs font-bold uppercase tracking-wider text-slate-400 transition-colors hover:text-slate-600"
                  >
                    Hủy bỏ
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500">
                  <Star size={16} className="text-white" />
                </div>
                <p className="text-sm font-black uppercase tracking-wider text-amber-700">Lưu ý</p>
              </div>
              <ul className="space-y-2 text-xs text-amber-800 leading-relaxed">
                <li>• Ảnh hiện tại sẽ được giữ nguyên, bạn chỉ cần thêm ảnh mới nếu muốn</li>
                <li>• Sau khi lưu, bạn sẽ chọn gói đăng bài để tiến hành thanh toán</li>
                <li>• Tin sẽ được duyệt bởi admin sau khi thanh toán thành công</li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
