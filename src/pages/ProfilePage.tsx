// src/pages/ProfilePage.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Camera,
  LogOut,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  User,
  RefreshCw,
  MapPin,
  AlertTriangle,
  Check,
  Save,
  Edit2,
  Lock,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  addressService,
  type Address,
  type AddressPayload,
} from "../services/address.service";
import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../config/api";

const makeEmptyContact = (): AddressPayload => ({
  nameContact: "",
  phoneContact: "",
  addressLine: "",
  bankCode: "TECHCOMBANK",
  accountNumber: "",
});

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(0[3-9][0-9]{8}|\+84[3-9][0-9]{8})$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50;
};

const validateAddress = (address: string): boolean => {
  return address.trim().length >= 10 && address.trim().length <= 200;
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as {
    state?: { returnTo?: string; listingId?: string };
  };

  const [contacts, setContacts] = useState<Address[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [contactForm, setContactForm] =
    useState<AddressPayload>(makeEmptyContact);
  const [validationErrors, setValidationErrors] = useState<
    Partial<AddressPayload>
  >({});
  const [contactError, setContactError] = useState("");
  const [contactSuccess, setContactSuccess] = useState("");
  const [editingContactId, setEditingContactId] = useState<
    string | number | null
  >(null);
  const [isSavingContact, setIsSavingContact] = useState(false);

  // Change Password
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [isSavingPw, setIsSavingPw] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    setIsSavingPw(true);
    try {
      await api.put(API_ENDPOINTS.USER_CHANGE_PASSWORD, {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwSuccess("Đổi mật khẩu thành công!");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPwSuccess("");
      }, 2000);
    } catch (err: any) {
      setPwError(
        err?.response?.data?.message ||
          "Đổi mật khẩu thất bại. Kiểm tra lại mật khẩu hiện tại.",
      );
    } finally {
      setIsSavingPw(false);
    }
  };

  const isSellerOrBuyer = useMemo(
    () => !!user && ["seller", "buyer"].includes(user.role),
    [user],
  );

  useEffect(() => {
    if (!isSellerOrBuyer) return;

    setIsLoadingContacts(true);
    addressService
      .getMyAddresses()
      .then(setContacts)
      .catch((error) => {
        console.error("Failed to load contacts:", error);
        setContactError("Khong the tai thong tin lien he.");
      })
      .finally(() => setIsLoadingContacts(false));
  }, [isSellerOrBuyer]);


  if (!user) return null;

  const handleLogout = () => {
    logout();
  };

  const resetContactForm = () => {
    setEditingContactId(null);
    setContactForm(makeEmptyContact());
    setValidationErrors({});
    setContactError("");
    setContactSuccess("");
  };

  const validateContactForm = (): boolean => {
    const errors: Partial<AddressPayload> = {};

    if (!validateName(contactForm.nameContact)) {
      errors.nameContact = "Họ tên phải từ 2-50 ký tự";
    }

    if (!validatePhone(contactForm.phoneContact)) {
      errors.phoneContact = "Số điện thoại không hợp lệ (ví dụ: 09xxxxxxxx)";
    }

    if (!validateAddress(contactForm.addressLine)) {
      errors.addressLine = "Địa chỉ phải từ 10-200 ký tự";
    }

    if (
      !contactForm.accountNumber ||
      contactForm.accountNumber.trim().length < 5
    ) {
      errors.accountNumber =
        "Số tài khoản ngân hàng không hợp lệ (ít nhất 5 ký tự)";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const hasContactFormValue =
    !!contactForm.nameContact ||
    !!contactForm.phoneContact ||
    !!contactForm.addressLine;

  const handleContactInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[name as keyof AddressPayload]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Clear general errors when user starts typing
    if (contactError || contactSuccess) {
      setContactError("");
      setContactSuccess("");
    }
  };

  const refreshContacts = async () => {
    const data = await addressService.getMyAddresses();
    setContacts(data);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateContactForm()) {
      return;
    }

    setContactError("");
    setContactSuccess("");
    setIsSavingContact(true);

    try {
      if (editingContactId) {
        await addressService.updateAddress(editingContactId, contactForm);
      } else {
        await addressService.addAddress(contactForm);
      }

      await refreshContacts();
      resetContactForm();
      setContactSuccess(
        editingContactId
          ? "Đã cập nhật thông tin liên hệ thành công!"
          : "Đã thêm thông tin liên hệ thành công!",
      );
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: unknown }).response === "object" &&
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message
          ? (error as { response?: { data?: { message?: string } } }).response!
              .data!.message!
          : "Không thể lưu thông tin liên hệ. Vui lòng thử lại.";
      setContactError(message);
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleEditContact = (contact: Address) => {
    const normalizedBankCode =
      contact.bankCode === "TECHCOMBANK" ||
      contact.bankCode === "VIETINBANK" ||
      contact.bankCode === "MB_BANK"
        ? contact.bankCode
        : "TECHCOMBANK";

    setContactForm({
      nameContact: contact.nameContact,
      phoneContact: contact.phoneContact,
      addressLine: contact.addressLine,
      bankCode: normalizedBankCode,
      accountNumber: contact.accountNumber || "",
    });
    setEditingContactId(contact.id);
    setValidationErrors({});
    setContactError("");
    setContactSuccess("");
  };

  const handleReturnToSchedule = () => {
    const returnTo = location.state?.returnTo;
    if (!returnTo) return;

    navigate(returnTo, {
      state: location.state?.listingId
        ? { listingId: location.state.listingId }
        : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="h-32 bg-gradient-to-r from-green-500 to-emerald-600" />

          <div className="px-8 pb-8">
            <div className="-mt-12 mb-6 flex items-end justify-between">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-white p-1.5 shadow-lg">
                  <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-slate-100 text-3xl font-black text-slate-400">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-green-600 text-white shadow-lg transition hover:bg-green-700">
                  <Camera size={14} />
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="mb-2 flex items-center gap-2 rounded-full bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 hover:shadow-md hover:shadow-red-100/50"
              >
                <LogOut size={16} />
                Đăng xuất
              </button>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-black text-slate-900">
                {user.name}
              </h1>
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                Vai trò:
                <span className="rounded-md bg-green-50 px-2.5 py-1 text-sm font-medium text-green-600">
                  {user.role === "seller"
                    ? "Người bán"
                    : user.role === "buyer"
                      ? "Người mua"
                      : user.role === "admin"
                        ? "Quản trị viên"
                        : "Kiểm định viên"}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <div className="space-y-6 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
              <h2 className="border-b border-slate-100 pb-4 text-sm font-black uppercase tracking-widest text-slate-800">
                Thong tin ca nhan
              </h2>

              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50">
                    <Mail size={18} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Email
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50">
                    <Calendar size={18} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Ngày tham gia
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              </div>

              {location.state?.returnTo && (
                <button
                  type="button"
                  onClick={handleReturnToSchedule}
                  className="w-full rounded-xl bg-green-600 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-green-700"
                >
                  Quay lai dat lich
                </button>
              )}
            </div>

            {["seller", "buyer"].includes(user.role) && (
              <div className="space-y-6 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
                <h2 className="border-b border-slate-100 pb-4 text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck size={20} className="text-green-600" />
                  Trạng thái xác minh
                </h2>

                {user.isKYCVerified ? (
                  <div className="flex items-center gap-4 rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                      <ShieldCheck size={28} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-green-900 text-lg">
                        Đã xác minh
                      </h3>
                      <p className="mt-1 text-sm font-medium text-green-700 leading-relaxed">
                        Tài khoản của bạn đã được xác minh và có đầy đủ quyền
                        giao dịch.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                      <AlertCircle size={28} className="text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-amber-900 text-lg">
                        Chưa xác minh KYC
                      </h3>
                      <p className="mt-1 text-sm font-medium text-amber-700 leading-relaxed">
                        Vui lòng hoàn tất xác minh danh tính để mở đầy đủ quyền
                        mua bán và tăng độ tin cậy cho tài khoản.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate("/kyc")}
                      className="rounded-xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-amber-700 hover:shadow-lg hover:shadow-amber-600/20"
                    >
                      Xác minh ngay
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6 lg:col-span-2">
            {isSellerOrBuyer && (
              <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
                <div className="mb-6 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <User size={20} className="text-green-600" />
                      Thông tin liên hệ
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      Cập nhật thông tin liên hệ để phục vụ cho việc kiểm định
                      xe tại địa điểm của bạn.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {isLoadingContacts ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex items-center gap-3 text-slate-500">
                        <RefreshCw size={20} className="animate-spin" />
                        <span className="text-sm font-medium">
                          Đang tải thông tin liên hệ...
                        </span>
                      </div>
                    </div>
                  ) : contacts.length === 0 ? (
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                          <MapPin size={32} className="text-amber-600" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-amber-900">
                          Chưa có thông tin liên hệ
                        </h3>
                        <p className="mb-4 text-sm text-amber-700 leading-relaxed">
                          Vui lòng thêm thông tin liên hệ để phục vụ cho quy
                          trình kiểm định xe tại địa điểm của bạn.
                        </p>
                      </div>

                      <form
                        onSubmit={handleContactSubmit}
                        className="space-y-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 shadow-sm"
                      >
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <User size={16} className="text-slate-400" />
                            Người liên hệ
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            required
                            name="nameContact"
                            value={contactForm.nameContact}
                            onChange={handleContactInputChange}
                            className={`w-full rounded-xl border-2 bg-white px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                              validationErrors.nameContact
                                ? "border-red-300 focus:border-red-500"
                                : "border-slate-200 focus:border-green-500"
                            }`}
                            placeholder="Nhập họ và tên đầy đủ"
                            aria-label="Nhập họ và tên người liên hệ"
                          />
                          {validationErrors.nameContact && (
                            <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                              <AlertTriangle size={12} />
                              {validationErrors.nameContact}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Phone size={16} className="text-slate-400" />
                            Số điện thoại
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            required
                            name="phoneContact"
                            value={contactForm.phoneContact}
                            onChange={handleContactInputChange}
                            className={`w-full rounded-xl border-2 bg-white px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                              validationErrors.phoneContact
                                ? "border-red-300 focus:border-red-500"
                                : "border-slate-200 focus:border-green-500"
                            }`}
                            placeholder="09xxxxxxxx hoặc +84xxxxxxxx"
                            aria-label="Nhập số điện thoại liên hệ"
                          />
                          {validationErrors.phoneContact && (
                            <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                              <AlertTriangle size={12} />
                              {validationErrors.phoneContact}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <MapPin size={16} className="text-slate-400" />
                            Địa chỉ liên hệ
                            <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            required
                            name="addressLine"
                            value={contactForm.addressLine}
                            onChange={handleContactInputChange}
                            rows={4}
                            className={`w-full resize-none rounded-xl border-2 bg-white px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                              validationErrors.addressLine
                                ? "border-red-300 focus:border-red-500"
                                : "border-slate-200 focus:border-green-500"
                            }`}
                            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                            aria-label="Nhập địa chỉ đầy đủ"
                          />
                          {validationErrors.addressLine && (
                            <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                              <AlertTriangle size={12} />
                              {validationErrors.addressLine}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                              <ShieldCheck
                                size={16}
                                className="text-slate-400"
                              />
                              Ngân hàng
                              <span className="text-red-500">*</span>
                            </label>
                            <select
                              required
                              name="bankCode"
                              value={contactForm.bankCode}
                              onChange={handleContactInputChange as any}
                              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                            >
                              <option value="TECHCOMBANK">Techcombank</option>
                              <option value="VIETINBANK">VietinBank</option>
                              <option value="MB_BANK">MB Bank</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                              <ShieldCheck
                                size={16}
                                className="text-slate-400"
                              />
                              Số tài khoản
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              required
                              name="accountNumber"
                              value={contactForm.accountNumber}
                              onChange={handleContactInputChange}
                              className={`w-full rounded-xl border-2 bg-white px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                                validationErrors.accountNumber
                                  ? "border-red-300 focus:border-red-500"
                                  : "border-slate-200 focus:border-green-500"
                              }`}
                              placeholder="Nhập số tài khoản ngân hàng"
                            />
                            {validationErrors.accountNumber && (
                              <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                                <AlertTriangle size={12} />
                                {validationErrors.accountNumber}
                              </p>
                            )}
                          </div>
                        </div>

                        {(contactError || contactSuccess) && (
                          <div
                            className={`rounded-xl p-4 flex items-center gap-3 ${
                              contactError
                                ? "bg-red-50 border border-red-200 text-red-700"
                                : "bg-green-50 border border-green-200 text-green-700"
                            }`}
                          >
                            {contactError ? (
                              <AlertTriangle size={16} />
                            ) : (
                              <Check size={16} />
                            )}
                            <p className="text-sm font-medium">
                              {contactError || contactSuccess}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-3 pt-2">
                          <button
                            type="submit"
                            disabled={isSavingContact}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/20 disabled:bg-slate-300 disabled:cursor-not-allowed"
                          >
                            {isSavingContact ? (
                              <>
                                <RefreshCw size={16} className="animate-spin" />
                                Đang lưu...
                              </>
                            ) : (
                              <>
                                <Save size={16} />
                                Lưu thông tin
                              </>
                            )}
                          </button>
                          {hasContactFormValue && (
                            <button
                              type="button"
                              onClick={resetContactForm}
                              className="rounded-xl border-2 border-slate-200 px-6 py-3.5 text-sm font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                            >
                              Hủy
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                            <MapPin size={28} className="text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-green-900 text-lg mb-4">
                              Thông tin liên hệ hiện tại
                            </h3>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                  <User size={16} className="text-green-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-700">
                                    Người liên hệ
                                  </p>
                                  <p className="text-slate-900">
                                    {contacts[0].nameContact}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                  <Phone size={16} className="text-green-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-700">
                                    Số điện thoại
                                  </p>
                                  <p className="text-slate-900">
                                    {contacts[0].phoneContact}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 mt-0.5">
                                  <MapPin
                                    size={16}
                                    className="text-green-600"
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-slate-700">
                                    Địa chỉ
                                  </p>
                                  <p className="text-slate-900 leading-relaxed">
                                    {contacts[0].addressLine}
                                  </p>
                                </div>
                              </div>
                              {(contacts[0].bankCode ||
                                contacts[0].accountNumber) && (
                                <div className="flex items-start gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 mt-0.5">
                                    <ShieldCheck
                                      size={16}
                                      className="text-green-600"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-700">
                                      Ngân hàng
                                    </p>
                                    <p className="text-slate-900 leading-relaxed">
                                      {contacts[0].bankCode || "—"}
                                      {contacts[0].accountNumber
                                        ? ` • ${contacts[0].accountNumber}`
                                        : ""}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => handleEditContact(contacts[0])}
                          className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/20"
                        >
                          <Edit2 size={16} />
                          Cập nhật thông tin
                        </button>
                      </div>

                      {editingContactId && (
                        <form
                          onSubmit={handleContactSubmit}
                          className="space-y-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 shadow-sm"
                        >
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                              <User size={16} className="text-slate-400" />
                              Người liên hệ
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              required
                              name="nameContact"
                              value={contactForm.nameContact}
                              onChange={handleContactInputChange}
                              className={`w-full rounded-xl border-2 bg-white px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                                validationErrors.nameContact
                                  ? "border-red-300 focus:border-red-500"
                                  : "border-slate-200 focus:border-green-500"
                              }`}
                              placeholder="Nhập họ và tên đầy đủ"
                              aria-label="Nhập họ và tên người liên hệ"
                            />
                            {validationErrors.nameContact && (
                              <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                                <AlertTriangle size={12} />
                                {validationErrors.nameContact}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                              <Phone size={16} className="text-slate-400" />
                              Số điện thoại
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              required
                              name="phoneContact"
                              value={contactForm.phoneContact}
                              onChange={handleContactInputChange}
                              className={`w-full rounded-xl border-2 bg-white px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                                validationErrors.phoneContact
                                  ? "border-red-300 focus:border-red-500"
                                  : "border-slate-200 focus:border-green-500"
                              }`}
                              placeholder="09xxxxxxxx hoặc +84xxxxxxxx"
                              aria-label="Nhập số điện thoại liên hệ"
                            />
                            {validationErrors.phoneContact && (
                              <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                                <AlertTriangle size={12} />
                                {validationErrors.phoneContact}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                              <MapPin size={16} className="text-slate-400" />
                              Địa chỉ liên hệ
                              <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              required
                              name="addressLine"
                              value={contactForm.addressLine}
                              onChange={handleContactInputChange}
                              rows={4}
                              className={`w-full resize-none rounded-xl border-2 bg-white px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                                validationErrors.addressLine
                                  ? "border-red-300 focus:border-red-500"
                                  : "border-slate-200 focus:border-green-500"
                              }`}
                              placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                              aria-label="Nhập địa chỉ đầy đủ"
                            />
                            {validationErrors.addressLine && (
                              <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                                <AlertTriangle size={12} />
                                {validationErrors.addressLine}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <ShieldCheck
                                  size={16}
                                  className="text-slate-400"
                                />
                                Ngân hàng
                                <span className="text-red-500">*</span>
                              </label>
                              <select
                                required
                                name="bankCode"
                                value={contactForm.bankCode}
                                onChange={handleContactInputChange as any}
                                className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                              >
                                <option value="TECHCOMBANK">Techcombank</option>
                                <option value="VIETINBANK">VietinBank</option>
                                <option value="MB_BANK">MB Bank</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <ShieldCheck
                                  size={16}
                                  className="text-slate-400"
                                />
                                Số tài khoản
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                required
                                name="accountNumber"
                                value={contactForm.accountNumber}
                                onChange={handleContactInputChange}
                                className={`w-full rounded-xl border-2 bg-white px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                                  validationErrors.accountNumber
                                    ? "border-red-300 focus:border-red-500"
                                    : "border-slate-200 focus:border-green-500"
                                }`}
                                placeholder="Nhập số tài khoản ngân hàng"
                              />
                              {validationErrors.accountNumber && (
                                <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                                  <AlertTriangle size={12} />
                                  {validationErrors.accountNumber}
                                </p>
                              )}
                            </div>
                          </div>

                          {(contactError || contactSuccess) && (
                            <div
                              className={`rounded-xl p-4 flex items-center gap-3 ${
                                contactError
                                  ? "bg-red-50 border border-red-200 text-red-700"
                                  : "bg-green-50 border border-green-200 text-green-700"
                              }`}
                            >
                              {contactError ? (
                                <AlertTriangle size={16} />
                              ) : (
                                <Check size={16} />
                              )}
                              <p className="text-sm font-medium">
                                {contactError || contactSuccess}
                              </p>
                            </div>
                          )}

                          <div className="flex gap-3 pt-2">
                            <button
                              type="submit"
                              disabled={isSavingContact}
                              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/20 disabled:bg-slate-300 disabled:cursor-not-allowed"
                            >
                              {isSavingContact ? (
                                <>
                                  <RefreshCw
                                    size={16}
                                    className="animate-spin"
                                  />
                                  Đang cập nhật...
                                </>
                              ) : (
                                <>
                                  <Save size={16} />
                                  Cập nhật thông tin
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={resetContactForm}
                              className="rounded-xl border-2 border-slate-200 px-6 py-3.5 text-sm font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                            >
                              Hủy
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
              <h2 className="mb-6 border-b border-slate-100 pb-4 text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck size={20} className="text-slate-600" />
                Bảo mật tài khoản
              </h2>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full rounded-xl border-2 border-slate-200 py-4 text-sm font-semibold text-slate-700 transition-all hover:border-green-500 hover:bg-green-50 hover:text-green-700"
              >
                🔒 Đổi mật khẩu
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-800">
                Đổi mật khẩu
              </h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPwError("");
                  setPwSuccess("");
                }}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    value={pwForm.currentPassword}
                    onChange={(e) =>
                      setPwForm((p) => ({
                        ...p,
                        currentPassword: e.target.value,
                      }))
                    }
                    className="w-full pl-10 pr-10 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-500"
                    placeholder="Mật khẩu hiện tại"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    value={pwForm.newPassword}
                    onChange={(e) =>
                      setPwForm((p) => ({ ...p, newPassword: e.target.value }))
                    }
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-500"
                    placeholder="Ít nhất 6 ký tự"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    value={pwForm.confirmPassword}
                    onChange={(e) =>
                      setPwForm((p) => ({
                        ...p,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-500"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
              </div>
              {pwError && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl flex items-center gap-2">
                  <AlertTriangle size={14} />
                  {pwError}
                </p>
              )}
              {pwSuccess && (
                <p className="text-sm text-green-600 bg-green-50 p-3 rounded-xl flex items-center gap-2">
                  <Check size={14} />
                  {pwSuccess}
                </p>
              )}
              <button
                type="submit"
                disabled={isSavingPw}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSavingPw ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Đổi mật khẩu
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
