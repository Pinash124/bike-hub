// src/pages/ProfilePage.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Calendar,
  Camera,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  addressService,
  type Address,
  type AddressPayload,
} from "../services/address.service";

const makeEmptyContact = (): AddressPayload => ({
  nameContact: "",
  phoneContact: "",
  addressLine: "",
});

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as {
    state?: { returnTo?: string; listingId?: string };
  };

  const [contacts, setContacts] = useState<Address[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [contactError, setContactError] = useState("");
  const [contactSuccess, setContactSuccess] = useState("");
  const [editingContactId, setEditingContactId] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState<AddressPayload>(makeEmptyContact);

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
  };

  const hasContactFormValue =
    !!contactForm.nameContact || !!contactForm.phoneContact || !!contactForm.addressLine;

  const handleContactInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const refreshContacts = async () => {
    const data = await addressService.getMyAddresses();
    setContacts(data);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setContactSuccess("Da luu thong tin lien he.");
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
          : "Khong the luu thong tin lien he.";
      setContactError(message);
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleEditContact = (contact: Address) => {
    setEditingContactId(contact.id);
    setContactForm({
      nameContact: contact.nameContact,
      phoneContact: contact.phoneContact,
      addressLine: contact.addressLine,
    });
    setContactError("");
    setContactSuccess("");
  };

  const handleDeleteContact = async (contactId: number) => {
    setContactError("");
    setContactSuccess("");

    const ok = await addressService.deleteAddress(contactId);
    if (!ok) {
      setContactError("Khong the xoa thong tin lien he.");
      return;
    }

    await refreshContacts();
    if (editingContactId === contactId) {
      resetContactForm();
    }
    setContactSuccess("Da xoa thong tin lien he.");
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
                className="mb-2 flex items-center gap-2 rounded-full bg-red-50 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-red-600 transition-colors hover:bg-red-100"
              >
                <LogOut size={16} /> Dang xuat
              </button>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-500">
                Vai tro:
                <span className="rounded-md bg-green-50 px-2.5 py-1 text-green-600">
                  {user.role}
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
                    <Phone size={18} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      So dien thoai tai khoan
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {user.phone || "Chua cap nhat"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50">
                    <Calendar size={18} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Ngay tham gia
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
                <h2 className="border-b border-slate-100 pb-4 text-sm font-black uppercase tracking-widest text-slate-800">
                  Trang thai xac minh
                </h2>

                {user.isKYCVerified ? (
                  <div className="flex items-center gap-4 rounded-2xl border border-green-200 bg-green-50 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <ShieldCheck size={24} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-green-900">Da xac minh</h3>
                      <p className="mt-0.5 text-xs font-medium text-green-700">
                        Tai khoan co day du quyen giao dich.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                      <AlertCircle size={24} className="text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-amber-900">
                        Chua xac minh KYC
                      </h3>
                      <p className="mt-0.5 text-xs font-medium text-amber-700">
                        Hay hoan tat KYC de mo day du quyen mua ban.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate("/kyc")}
                      className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-amber-600"
                    >
                      Xac minh
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6 lg:col-span-2">
            {isSellerOrBuyer && (
              <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
                <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">
                      Thong tin lien he
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Du lieu nay duoc dung cho kiem dinh tai noi ban.
                    </p>
                  </div>
                  {contacts.length > 0 && !editingContactId && (
                    <button
                      type="button"
                      onClick={resetContactForm}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-600"
                    >
                      Them moi
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <form
                    onSubmit={handleContactSubmit}
                    className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-5"
                  >
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-500">
                        Nguoi lien he
                      </label>
                      <input
                        required
                        name="nameContact"
                        value={contactForm.nameContact}
                        onChange={handleContactInputChange}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                        placeholder="Ho va ten"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-500">
                        So dien thoai
                      </label>
                      <input
                        required
                        name="phoneContact"
                        value={contactForm.phoneContact}
                        onChange={handleContactInputChange}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                        placeholder="09xxxxxxxx"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-500">
                        Dia chi lien he
                      </label>
                      <textarea
                        required
                        name="addressLine"
                        value={contactForm.addressLine}
                        onChange={handleContactInputChange}
                        rows={4}
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                        placeholder="So nha, duong, phuong/xa, quan/huyen, tinh/thanh"
                      />
                    </div>

                    {contactError && (
                      <p className="text-sm text-red-600">{contactError}</p>
                    )}
                    {contactSuccess && (
                      <p className="text-sm text-green-600">{contactSuccess}</p>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={isSavingContact}
                        className="rounded-xl bg-green-600 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-green-700 disabled:bg-green-300"
                      >
                        {isSavingContact
                          ? "Dang luu..."
                          : editingContactId
                            ? "Cap nhat contact"
                            : "Luu contact"}
                      </button>
                      {(editingContactId !== null || hasContactFormValue) && (
                        <button
                          type="button"
                          onClick={resetContactForm}
                          className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-600"
                        >
                          Huy
                        </button>
                      )}
                    </div>
                  </form>

                  <div className="space-y-3">
                    {isLoadingContacts ? (
                      <p className="text-sm text-slate-500">
                        Dang tai thong tin lien he...
                      </p>
                    ) : contacts.length === 0 ? (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                        Chua co thong tin lien he. Hay them it nhat mot contact
                        de dung cho luong kiem dinh tai noi ban.
                      </div>
                    ) : (
                      contacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                        >
                          <p className="font-bold text-slate-800">
                            {contact.nameContact}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {contact.phoneContact}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {contact.addressLine}
                          </p>
                          <div className="mt-4 flex gap-3">
                            <button
                              type="button"
                              onClick={() => handleEditContact(contact)}
                              className="text-sm font-semibold text-green-600"
                            >
                              Chinh sua
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteContact(contact.id)}
                              className="text-sm font-semibold text-red-600"
                            >
                              Xoa
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
              <h2 className="mb-6 border-b border-slate-100 pb-4 text-sm font-black uppercase tracking-widest text-slate-800">
                Bao mat
              </h2>
              <button className="w-full rounded-xl border-2 border-slate-100 py-3.5 text-xs font-bold uppercase tracking-widest text-slate-700 transition-colors hover:border-green-200 hover:text-green-700">
                Doi mat khau
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
