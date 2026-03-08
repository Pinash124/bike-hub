// src/pages/CreateListingPage.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { brandService, type Brand } from "../services/brand.service";
import { listingService } from "../services/listing.service";

const BIKE_TYPES = [
  { value: "MTB_BIKE", label: "Xe dia hinh (MTB)", emoji: "MTB" },
  { value: "ROAD_BIKE", label: "Xe dua (Road)", emoji: "Road" },
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
      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500">
        {label}
        {required && <span className="ml-0.5 text-[10px] text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="pl-1 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition-all placeholder:text-slate-300 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100";

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    setImages((prev) => [...prev, ...newFiles]);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) return error.message;
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as { response?: unknown }).response === "object"
    ) {
      const response = (error as {
        response?: { data?: { message?: string } };
      }).response;
      if (response?.data?.message) return response.data.message;
    }
    return fallback;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const usage = Number.parseInt(formData.usageDuration || "0", 10);
    const priceVal = Number.parseInt(formData.price || "0", 10);

    if (Number.isNaN(usage) || usage < 0) {
      setError("Thoi gian su dung khong hop le. Vui long nhap so nam >= 0.");
      return;
    }
    if (usage > 30) {
      setError("Thoi gian su dung toi da la 30 nam.");
      return;
    }

    const MIN_PRICE = 500000;
    if (Number.isNaN(priceVal) || priceVal <= 0) {
      setError("Gia ban phai lon hon 0.");
      return;
    }
    if (priceVal < MIN_PRICE) {
      setError(`Gia ban toi thieu la ${MIN_PRICE.toLocaleString("vi-VN")} VND.`);
      return;
    }

    if (images.length < 3) {
      setError("Vui long tai len it nhat 3 anh de nguoi mua thay ro xe.");
      return;
    }

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
        navigate("/seller/schedule", { state: { listingId: created.id } });
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate("/seller/dashboard"), 1800);
    } catch (err: unknown) {
      console.error("Create listing raw error:", err);
      setError(getErrorMessage(err, "Dang tin that bai. Vui long thu lai."));
    } finally {
      setIsLoading(false);
    }
  };

  const priceNum = Number(formData.price);
  const priceFormatted =
    priceNum > 0 ? `${priceNum.toLocaleString("vi-VN")} VND` : null;

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-12 text-center shadow-2xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="mb-2 text-2xl font-black text-slate-900">
            Dang tin thanh cong!
          </h2>
          <p className="mb-6 text-sm text-slate-500">
            Xe cua ban dang cho kiem duyet. Buoc tiep theo la dat lich kiem
            dinh.
          </p>
          <div className="flex animate-pulse items-center justify-center gap-2 text-sm font-bold text-green-600">
            <Loader2 size={16} className="animate-spin" />
            Dang chuyen trang...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-10 border-b border-slate-100 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={() => navigate("/seller/dashboard")}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800"
          >
            Quay lai
          </button>
          <span className="text-sm font-black uppercase tracking-wide text-slate-800">
            Dang xe ban
          </span>
          <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-400">
            {images.length}/3+ anh
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-8 lg:grid-cols-3"
        >
          <div className="space-y-6 lg:col-span-2">
            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-50 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-700">
                  Thong tin co ban
                </h2>
              </div>
              <div className="space-y-5 p-6">
                <Field
                  label="Tieu de"
                  required
                  hint="Vi du: Trek Marlin 5 2022, Giant Escape 3"
                >
                  <input
                    required
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={inputCls}
                    placeholder="Nhap ten xe"
                  />
                </Field>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="Thuong hieu" required>
                    <select
                      required
                      name="brandName"
                      value={formData.brandName}
                      onChange={handleInputChange}
                      className={inputCls}
                    >
                      <option value="">Chon thuong hieu</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.name}>
                          {brand.name}
                        </option>
                      ))}
                      <option value="Other">Khac</option>
                    </select>
                  </Field>

                  <Field label="Loai xe" required>
                    <select
                      required
                      name="bikeType"
                      value={formData.bikeType}
                      onChange={handleInputChange}
                      className={inputCls}
                    >
                      {BIKE_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-50 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-700">
                  Chi tiet ky thuat
                </h2>
              </div>
              <div className="space-y-5 p-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field
                    label="So khung"
                    required
                    hint="Thuong khac o phan gam khung"
                  >
                    <input
                      required
                      name="frameNumber"
                      value={formData.frameNumber}
                      onChange={handleInputChange}
                      className={inputCls}
                      placeholder="Vi du: ABC123456"
                    />
                  </Field>

                  <Field label="Thoi gian su dung (nam)" required>
                    <input
                      required
                      type="number"
                      min="0"
                      max="30"
                      step="1"
                      name="usageDuration"
                      value={formData.usageDuration}
                      onChange={handleInputChange}
                      className={inputCls}
                      placeholder="Nhap so nam (0 - 30)"
                    />
                  </Field>
                </div>

                <Field
                  label="Mo ta chi tiet"
                  required
                  hint="Tinh trang xe, phu kien di kem, lich su bao duong"
                >
                  <textarea
                    required
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    className={`${inputCls} resize-none`}
                    placeholder="Mo ta trung thuc tinh trang hien tai cua xe"
                  />
                </Field>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-50 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-700">
                  Hinh anh
                </h2>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${images.length >= 3 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                >
                  {images.length >= 3
                    ? "Da du anh"
                    : `Con thieu ${3 - images.length} anh`}
                </span>
              </div>
              <div className="p-6">
                <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                  {imagePreviews.map((src, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square overflow-hidden rounded-xl border-2 border-slate-100"
                    >
                      <img
                        src={src}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                      {index === 0 && (
                        <span className="absolute inset-x-0 bottom-0 bg-green-600/80 py-0.5 text-center text-[9px] font-black uppercase tracking-wider text-white">
                          Anh chinh
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        X
                      </button>
                    </div>
                  ))}

                  <label className="group flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 transition-all hover:border-green-400 hover:bg-green-50">
                    <input
                      ref={fileRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-300 transition-colors group-hover:text-green-500">
                      Them anh
                    </span>
                  </label>
                </div>
                <p className="text-[11px] text-slate-400">
                  Anh dau tien se duoc dung lam anh bia. Toi thieu 3 anh.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="sticky top-24 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-50 bg-gradient-to-r from-green-50 to-white px-6 py-4">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-700">
                  Gia ban
                </h2>
              </div>
              <div className="space-y-4 p-6">
                <div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      VND
                    </span>
                    <input
                      required
                      type="number"
                      name="price"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      className={`${inputCls} pl-14`}
                      placeholder="0"
                    />
                  </div>
                  {priceFormatted && (
                    <p className="mt-2 text-center text-2xl font-black tracking-tight text-green-600">
                      {priceFormatted}
                    </p>
                  )}
                </div>

                <div className="space-y-2.5 border-t pt-4">
                  {[
                    { ok: formData.title.length > 3, label: "Tieu de" },
                    { ok: !!formData.brandName, label: "Thuong hieu" },
                    { ok: !!formData.frameNumber, label: "So khung" },
                    { ok: !!formData.usageDuration, label: "Thoi gian su dung" },
                    { ok: formData.description.length > 10, label: "Mo ta" },
                    { ok: Number(formData.price) > 0, label: "Gia ban" },
                    { ok: images.length >= 3, label: `Anh (${images.length}/3)` },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-xs">
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded-full ${item.ok ? "bg-green-100" : "bg-slate-100"}`}
                      >
                        {item.ok ? (
                          <span className="font-bold text-green-600">✓</span>
                        ) : (
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                        )}
                      </div>
                      <span
                        className={item.ok ? "font-semibold text-slate-700" : "text-slate-400"}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-green-200 transition-all hover:bg-green-700 disabled:bg-green-300"
                >
                  {isLoading ? "Dang dang..." : "Dang tin ngay"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/seller/dashboard")}
                  className="w-full py-3 text-xs font-bold uppercase tracking-wider text-slate-400 transition-colors hover:text-slate-600"
                >
                  Huy bo
                </button>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-amber-100 bg-amber-50 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-amber-700">
                Meo dang xe hieu qua
              </p>
              <ul className="list-disc space-y-2 pl-4 text-xs text-amber-800">
                <li>Chup nhieu goc: truoc, sau, hong, so khung.</li>
                <li>Mo ta trung thuc cac vet tray xuoc hoac hu hong.</li>
                <li>Gia hop ly va anh ro se giup bai dang chuyen doi tot hon.</li>
                <li>So khung ro rang giup qua trinh kiem dinh nhanh hon.</li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
