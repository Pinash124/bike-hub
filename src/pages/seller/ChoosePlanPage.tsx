// src/pages/seller/ChoosePlanPage.tsx
import { useEffect, useState, Fragment } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { planService, type Plan } from '../../services/plan.service';
import { subscriptionService } from '../../services/subscription.service';
import { paymentService } from '../../services/payment.service';
import { listingService, type Listing } from '../../services/listing.service';
import {
    Check,
    ShieldCheck,
    Zap,
    ArrowLeft,
    Loader2,
    AlertCircle,
    CreditCard,
    Bike,
    Tag,
    Clock
} from 'lucide-react';

export default function ChoosePlanPage() {
    const { listingId } = useParams<{ listingId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const stateListing = location.state?.listing as Listing | null;

    const [listing, setListing] = useState<Listing | null>(stateListing);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [currentSubscription, setCurrentSubscription] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(!stateListing);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedPlanDetails, setSelectedPlanDetails] = useState<Plan | null>(null);

    useEffect(() => {
        if (!listingId) {
            navigate('/seller/dashboard');
            return;
        }
        fetchData(listingId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listingId]);

    const fetchData = async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch listing first if not in state
            if (!listing) {
                try {
                    const listingData = await listingService.getListingById(id);
                    if (!listingData) throw new Error('Listing không tồn tại.');
                    setListing(listingData);
                } catch (err: any) {
                    const msg = err.response?.data?.message || err.message || 'Lỗi không xác định';
                    console.error('[ChoosePlan] Listing fetch failed:', msg);
                    throw new Error('Không tìm thấy thông tin xe: ' + msg);
                }
            } else {
                // Silent refresh listing (non-blocking)
                listingService.getListingById(id).then(setListing).catch(e => console.warn('Silent refresh failed:', e));
            }

            // Then fetch plans and subscription
            try {
                const [planData, subData] = await Promise.all([
                    planService.getAllPlans(),
                    subscriptionService.getSubscriptionByListingId(id).catch(() => null)
                ]);

                const activePlans = Array.isArray(planData) ? planData.filter(p => p.isActive !== false) : [];
                setPlans(activePlans);
                setCurrentSubscription(subData);

                // Nếu đã có sub đang chờ thanh toán, chuyển thẳng sang bước xác nhận
                if (subData?.status === 'PENDING_PAYMENT') {
                    const subPlan = activePlans.find(p => p.id === subData.planId);
                    if (subPlan) setSelectedPlanDetails(subPlan);
                    setShowConfirmation(true);
                }
            } catch (err: any) {
                throw new Error('Lỗi tải gói dịch vụ và đăng ký: ' + (err.message || 'Lỗi không xác định'));
            }
        } catch (err: any) {
            console.error('[ChoosePlan] Error in fetchData:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResumePayment = async () => {
        if (!currentSubscription?.id) return;
        setIsProcessing(true);
        try {
            // PayOS description limit is max 25 characters, no special accents allowed easily
            // We use the first 8 characters of listingId or just a short string.
            const shortId = listingId ? listingId.substring(0, 5) : '';
            const desc = `Thanh toan goi ${shortId}`;
            const paymentResult = await paymentService.createSubscriptionPayment(currentSubscription.id, desc);
            if (paymentResult?.paymentUrl) {
                window.location.href = paymentResult.paymentUrl;
            } else {
                throw new Error('Không nhận được đường dẫn thanh toán từ PayOS.');
            }
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi nối lại thanh toán.');
            setIsProcessing(false);
        }
    }

    const handleSelectPlan = async (planId: number) => {
        if (!listingId) return;

        const confirmed = window.confirm('Bạn có chắc chắn muốn đăng ký gói này không?');
        if (!confirmed) return;

        setIsProcessing(true);
        setError(null);

        try {
            // 1. Tạo Subscription
            const sub = await subscriptionService.createSubscription({
                planId,
                listingId,
            });

            if (!sub?.id) {
                throw new Error('Chưa tạo được Subscription. Thiếu ID trả về.');
            }

            setCurrentSubscription(sub);
            const plan = plans.find(p => p.id === planId);
            if (plan) setSelectedPlanDetails(plan);
            setShowConfirmation(true);
            setIsProcessing(false);
        } catch (err: any) {
            console.error('[ChoosePlan] handleSelectPlan error:', err);
            const msg = err.response?.data?.message || err.message || 'Có lỗi xảy ra trong quá trình thanh toán.';
            setError(msg);
            setIsProcessing(false);
        }
    };

    const CoverImage = ({ src, alt }: { src?: string; alt: string }) => (
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center ring-1 ring-slate-200">
            {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={alt} className="w-full h-full object-cover" />
            ) : (
                <Bike size={20} className="text-slate-400" />
            )}
        </div>
    );

    const ListingSummary = ({ data }: { data: Listing }) => {
        const firstImage = data.images?.sort((a, b) => a.imageOrder - b.imageOrder)[0]?.secureUrl;
        return (
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <CoverImage src={firstImage} alt={data.title} />
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full ring-1 ring-slate-200">
                                    <Tag size={12} /> {data.brand?.name || 'Thương hiệu'}</span>
                                {data.bikeType && (
                                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full ring-1 ring-slate-200">
                                        <Bike size={12} /> {data.bikeType}
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full ring-1 ring-slate-200">
                                    <Clock size={12} /> {new Date(data.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                            <h2 className="text-base md:text-lg font-bold text-slate-900 truncate">{data.title}</h2>
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <div className="text-xs text-slate-500 font-semibold mb-1">Giá niêm yết</div>
                        <div className="text-lg font-black tracking-tight text-slate-900">
                            {data.price?.toLocaleString('vi-VN')} ₫
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
                <p className="text-slate-600 font-medium">Đang tải gói dịch vụ...</p>
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">
                <div className="bg-white border border-red-200 text-red-700 p-6 rounded-2xl max-w-md text-center shadow-sm">
                    <AlertCircle size={40} className="mx-auto mb-3 text-red-500" />
                    <h2 className="text-lg font-bold mb-1">Không thể tải dữ liệu</h2>
                    <p className="text-sm">{error || 'Không tìm thấy thông tin xe.'}</p>
                    <button
                        onClick={() => navigate('/seller/dashboard')}
                        className="mt-6 px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition"
                    >
                        Quay lại Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Sticky Header */}
            <div className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                        aria-label="Quay lại"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-slate-500">Chọn gói hiển thị</div>
                        <div className="text-base font-black text-slate-900 tracking-tight leading-tight">Đăng bán xe</div>
                    </div>
                    {currentSubscription?.status && (
                        <div className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ring-1 ring-slate-200 bg-slate-50 text-slate-700">
                            <ShieldCheck size={14} className="text-emerald-600" />
                            <span>Trạng thái: {currentSubscription.status}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Listing summary */}
            <div className="py-4 bg-white border-b border-slate-200">
                <ListingSummary data={listing} />
            </div>

            <div className="max-w-6xl mx-auto px-6 py-10">
                {showConfirmation && selectedPlanDetails ? (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 p-6 text-white">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                                    <Check size={26} className="text-white" strokeWidth={3} />
                                </div>
                                <h3 className="text-xl font-black">Gói đăng ký đã được ghi nhận</h3>
                                <p className="text-indigo-100 text-sm">Bạn đã sẵn sàng thanh toán để kích hoạt tin đăng.</p>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-slate-100">
                                    <div>
                                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Gói đã chọn</div>
                                        <div className="text-base font-bold text-slate-900">{selectedPlanDetails.name}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Thời hạn</div>
                                        <div className="text-base font-bold text-slate-900">{selectedPlanDetails.durationDays} ngày</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-6">
                                    <div className="text-slate-600 font-semibold">Tổng phí thanh toán</div>
                                    <div className="text-2xl font-black text-indigo-600">{selectedPlanDetails.price.toLocaleString('vi-VN')} ₫</div>
                                </div>

                                {isProcessing && (
                                    <div className="mb-6 p-4 bg-indigo-50 rounded-xl flex items-center justify-center gap-3 text-indigo-700 font-semibold animate-pulse text-sm">
                                        <Loader2 className="animate-spin" size={18} />
                                        Đang chuyển hướng đến PayOS...
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <button
                                        onClick={handleResumePayment}
                                        disabled={isProcessing}
                                        className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-60"
                                    >
                                        <CreditCard size={18} /> Thanh toán qua PayOS
                                    </button>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => navigate('/seller/dashboard')}
                                            className="py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition"
                                        >
                                            Hoàn thành
                                        </button>
                                        <button
                                            onClick={() => navigate('/seller/dashboard')}
                                            className="py-3.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </div>

                                <p className="mt-6 text-center text-xs text-slate-500">
                                    * Tin đăng sẽ hiển thị chính thức sau khi Admin xác nhận thanh toán.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setShowConfirmation(false);
                                setCurrentSubscription(null); // allow re-select
                            }}
                            className="mt-6 mx-auto flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition"
                        >
                            <ArrowLeft size={16} /> Chọn gói khác
                        </button>
                    </div>
                ) : (
                    <Fragment>
                        <div className="text-center max-w-2xl mx-auto mb-10">
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
                                Nâng tầm tin đăng của bạn
                            </h2>
                            <p className="text-slate-600">
                                Xe đã được kiểm định. Hãy chọn gói hiển thị và thanh toán để xe được chính thức có mặt trên trang chủ BikeHub.
                            </p>
                        </div>

                        {currentSubscription && (
                            <div className="max-w-3xl mx-auto mb-10 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">Xe đã có gói đăng ký</h3>
                                        <p className="text-sm text-slate-600">
                                            Trạng thái: <span className="font-semibold text-emerald-700">{currentSubscription.status}</span>
                                        </p>
                                    </div>
                                </div>
                                {currentSubscription.status === 'PENDING_PAYMENT' && (
                                    <button
                                        onClick={() => setShowConfirmation(true)}
                                        className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition shadow-sm"
                                    >
                                        Tiếp tục thanh toán
                                    </button>
                                )}
                                {currentSubscription.status === 'ACTIVE' && (
                                    <div className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                        Đã kích hoạt gói
                                    </div>
                                )}
                            </div>
                        )}

                        {plans.length === 0 ? (
                            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-md mx-auto">
                                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                                    <Zap size={28} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Hiện chưa có gói dịch vụ</h3>
                                <p className="text-slate-600 mb-5 text-sm">Hệ thống đang cập nhật các gói đăng tin mới. Vui lòng quay lại sau.</p>
                                <button
                                    onClick={() => navigate('/seller/dashboard')}
                                    className="px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-black transition"
                                >
                                    Quay lại Dashboard
                                </button>
                            </div>
                        ) : (
                            <Fragment>
                                {isProcessing && (
                                    <div className="mb-8 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center gap-3 text-indigo-700 font-semibold animate-pulse max-w-2xl mx-auto">
                                        <Loader2 className="animate-spin" size={18} />
                                        Đang tạo giao dịch...
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                                    {plans.map((plan) => {
                                        const isRecommended = plan.price > 100000; // simple heuristic for spotlight
                                        return (
                                            <div
                                                key={plan.id}
                                                className={`relative flex flex-col p-6 rounded-2xl border transition-all duration-300 bg-white ${isRecommended
                                                        ? 'border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-200'
                                                        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                                                    }`}
                                            >
                                                {isRecommended && (
                                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-3 py-0.5 rounded-full text-[11px] font-black tracking-wider shadow-sm flex items-center gap-1.5">
                                                        <Zap size={12} className="fill-white" /> Khuyên dùng
                                                    </div>
                                                )}

                                                <div className="mb-6 text-center">
                                                    <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">{plan.name}</h3>
                                                    <p className="text-slate-600 text-sm min-h-[40px]">{plan.description}</p>
                                                </div>

                                                <div className="mb-6 text-center">
                                                    <div className="text-3xl font-black tracking-tight text-slate-900">
                                                        {plan.price.toLocaleString('vi-VN')}<span className="text-sm font-semibold text-slate-500 ml-1">₫</span>
                                                    </div>
                                                    <div className="text-xs font-semibold text-slate-500 mt-1">/ {plan.durationDays} ngày</div>
                                                </div>

                                                <ul className="space-y-3 mb-6 flex-1">
                                                    <li className="flex items-start gap-2">
                                                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${isRecommended ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                            <Check size={12} strokeWidth={4} />
                                                        </div>
                                                        <span className="text-sm text-slate-700">Đăng bán công khai {plan.durationDays} ngày</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${isRecommended ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                            <Check size={12} strokeWidth={4} />
                                                        </div>
                                                        <span className="text-sm text-slate-700">Dấu tích xanh đã kiểm tra</span>
                                                    </li>
                                                    {isRecommended && (
                                                        <li className="flex items-start gap-2">
                                                            <div className="mt-0.5 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                                                <ShieldCheck size={14} strokeWidth={3} />
                                                            </div>
                                                            <span className="text-sm text-slate-700 font-semibold">Ưu tiên hiển thị Top tin</span>
                                                        </li>
                                                    )}
                                                </ul>

                                                <button
                                                    onClick={() => handleSelectPlan(plan.id)}
                                                    disabled={isProcessing || currentSubscription?.status === 'ACTIVE'}
                                                    className={`w-full py-3 text-sm font-semibold rounded-xl transition-all ${isRecommended
                                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                                                            : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                                                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                                                >
                                                    {currentSubscription?.status === 'ACTIVE' ? 'Đã kích hoạt' : `Chọn ${plan.name}`}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Fragment>
                        )}
                    </Fragment>
                )}
            </div>
        </div>
    );
}
