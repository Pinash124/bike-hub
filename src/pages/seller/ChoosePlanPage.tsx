// src/pages/seller/ChoosePlanPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { planService, type Plan } from '../../services/plan.service';
import { subscriptionService } from '../../services/subscription.service';
import { paymentService } from '../../services/payment.service';
import { listingService, type Listing } from '../../services/listing.service';
import { Check, ShieldCheck, Zap, ArrowLeft, Loader2, AlertCircle, CreditCard } from 'lucide-react';

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
    }, [listingId, navigate]);

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
                console.log('[ChoosePlan] Using listing from state:', listing.id);
                // Optionally refresh listing data in background without blocking
                listingService.getListingById(id).then(setListing).catch(e => console.warn('Silent refresh failed:', e));
            }

            // Then fetch plans and subscription
            try {
                const [planData, subData] = await Promise.all([
                    planService.getAllPlans(),
                    subscriptionService.getSubscriptionByListingId(id).catch(() => null)
                ]);

                console.log('[ChoosePlan] Raw Plans:', planData);
                const activePlans = Array.isArray(planData) ? planData.filter(p => p.isActive !== false) : [];
                console.log('[ChoosePlan] Active Plans:', activePlans.length);
                setPlans(activePlans);
                setCurrentSubscription(subData);

                // Nếu đã có sub đang chờ thanh toán, chuyển thẳng sang bước xác nhận
                if (subData?.status === 'PENDING_PAYMENT') {
                    const subPlan = activePlans.find(p => p.id === subData.planId);
                    if (subPlan) setSelectedPlanDetails(subPlan);
                    setShowConfirmation(true);
                }

                if (activePlans.length === 0 && Array.isArray(planData) && planData.length > 0) {
                    console.warn('[ChoosePlan] Plans found but all filtered out (isActive).');
                } else if (activePlans.length === 0) {
                    console.warn('[ChoosePlan] No plans returned from API.');
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
            const desc = `Thanh toán gói cho xe: ${listing?.title || listingId}`;
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
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl max-w-md text-center border border-red-100">
                    <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
                    <h2 className="text-xl font-bold mb-2">Lỗi tải dữ liệu</h2>
                    <p>{error || 'Không tìm thấy thông tin xe.'}</p>
                    <button
                        onClick={() => navigate('/seller/dashboard')}
                        className="mt-6 px-6 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition"
                    >
                        Quay lại Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-slate-800 tracking-tight leading-tight">Chọn Gói Dịch Vụ - Đăng Bán Xe</h1>
                        <p className="text-xs font-semibold text-slate-500 truncate">Xe: {listing.title}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12">
                {showConfirmation && selectedPlanDetails ? (
                    <div className="max-w-2xl mx-auto animate-in fade-in zoom-in duration-500">
                        <div className="bg-white border-2 border-indigo-600 rounded-[2.5rem] shadow-2xl shadow-indigo-600/10 overflow-hidden">
                            <div className="bg-indigo-600 p-8 text-center text-white">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check size={32} className="text-white" strokeWidth={3} />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tight">Đã ghi nhận gói đăng ký</h3>
                                <p className="text-indigo-100 font-medium">Bạn đã sẵn sàng để đưa tin đăng này lên trang chủ.</p>
                            </div>

                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gói đã chọn</p>
                                        <p className="text-xl font-black text-slate-900">{selectedPlanDetails.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Thời hạn</p>
                                        <p className="text-xl font-black text-slate-900">{selectedPlanDetails.durationDays} ngày</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-8">
                                    <p className="font-bold text-slate-600">Tổng phí thanh toán</p>
                                    <p className="text-3xl font-black text-indigo-600">{selectedPlanDetails.price.toLocaleString('vi-VN')} ₫</p>
                                </div>

                                {isProcessing && (
                                    <div className="mb-6 p-4 bg-indigo-50 rounded-2xl flex items-center justify-center gap-3 text-indigo-600 font-bold animate-pulse text-sm">
                                        <Loader2 className="animate-spin" size={18} />
                                        Đang chuyển hướng đến PayOS...
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <button
                                        onClick={handleResumePayment}
                                        disabled={isProcessing}
                                        className="w-full py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        <CreditCard size={20} /> Thanh toán ngay qua PayOS
                                    </button>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => navigate('/seller/dashboard')}
                                            className="py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition flex items-center justify-center gap-2"
                                        >
                                            Hoàn thành
                                        </button>
                                        <button
                                            onClick={() => navigate('/seller/dashboard')}
                                            className="py-4 bg-slate-100 text-slate-600 font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </div>

                                <p className="mt-8 text-center text-xs text-slate-400 font-medium">
                                    * Tin đăng sẽ hiển thị chính thức sau khi Admin xác nhận thanh toán.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setShowConfirmation(false);
                                setCurrentSubscription(null); // allow re-select
                            }}
                            className="mt-6 mx-auto flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition"
                        >
                            <ArrowLeft size={16} /> Thay đổi gói dịch vụ khác
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                                Nâng Tầm Tin Đăng Của Bạn
                            </h2>
                            <p className="text-lg text-slate-600 font-medium">
                                Xe đã được kiểm định. Hãy chọn gói hiển thị và thanh toán để xe được chính thức có mặt trên trang chủ BikeHub.
                            </p>
                        </div>

                        {currentSubscription && (
                            <div className="max-w-2xl mx-auto mb-12 p-6 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">Xe đã có gói đăng ký</h3>
                                        <p className="text-sm text-slate-500 font-medium">
                                            Trạng thái: <span className="font-bold text-emerald-600 uppercase italic">{currentSubscription.status}</span>
                                        </p>
                                    </div>
                                </div>
                                {currentSubscription.status === 'PENDING_PAYMENT' && (
                                    <button
                                        onClick={() => setShowConfirmation(true)}
                                        className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20 text-sm whitespace-nowrap"
                                    >
                                        Tiếp tục Thanh toán
                                    </button>
                                )}
                                {currentSubscription.status === 'ACTIVE' && (
                                    <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 italic">
                                        Đã kích hoạt gói
                                    </div>
                                )}
                            </div>
                        )}

                        {plans.length === 0 ? (
                            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                    <Zap size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Hiện chưa có gói dịch vụ</h3>
                                <p className="text-slate-500 mb-6">Hệ thống đang cập nhật các gói đăng tin mới. Vui lòng quay lại sau.</p>
                                <button
                                    onClick={() => navigate('/seller/dashboard')}
                                    className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition"
                                >
                                    Quay lại Dashboard
                                </button>
                            </div>
                        ) : (
                            <>
                                {isProcessing && (
                                    <div className="mb-12 p-6 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center gap-4 text-indigo-700 font-bold animate-pulse max-w-2xl mx-auto">
                                        <Loader2 className="animate-spin" size={24} />
                                        Đang tạo giao dịch...
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                                    {plans.map((plan) => {
                                        const isPremium = plan.price > 100000;
                                        return (
                                            <div
                                                key={plan.id}
                                                className={`relative flex flex-col p-8 rounded-3xl border-2 transition-all duration-300 ${isPremium ? 'border-indigo-600 shadow-2xl shadow-indigo-600/20 scale-105 bg-white z-10' : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xl hover:shadow-slate-200/50'}`}
                                            >
                                                {isPremium && (
                                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                                                        <Zap size={14} className="fill-white" /> Khuyên Dùng
                                                    </div>
                                                )}

                                                <div className="mb-8 text-center pt-2">
                                                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">{plan.name}</h3>
                                                    <p className="text-slate-500 font-medium text-sm h-10 mb-6">{plan.description}</p>

                                                    <div className="flex items-baseline justify-center gap-1">
                                                        <span className="text-4xl font-black tracking-tighter text-slate-900 flex items-start">
                                                            {plan.price.toLocaleString('vi-VN')}
                                                            <span className="text-sm font-bold text-slate-500 tracking-normal ml-1 mt-1">₫</span>
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-wider">/ {plan.durationDays} ngày</p>
                                                </div>

                                                <ul className="space-y-4 mb-8 flex-1">
                                                    <li className="flex items-start gap-3">
                                                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${isPremium ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}`}>
                                                            <Check size={12} strokeWidth={4} />
                                                        </div>
                                                        <span className="text-sm font-semibold text-slate-700">Đăng bán công khai {plan.durationDays} ngày</span>
                                                    </li>
                                                    <li className="flex items-start gap-3">
                                                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${isPremium ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}`}>
                                                            <Check size={12} strokeWidth={4} />
                                                        </div>
                                                        <span className="text-sm font-semibold text-slate-700">Dấu tích xanh đã kiểm tra</span>
                                                    </li>
                                                    {isPremium && (
                                                        <li className="flex items-start gap-3">
                                                            <div className="mt-0.5 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                                                <ShieldCheck size={14} strokeWidth={3} />
                                                            </div>
                                                            <span className="text-sm font-bold text-indigo-900">Ưu tiên hiển thị Top tin</span>
                                                        </li>
                                                    )}
                                                </ul>

                                                <button
                                                    onClick={() => handleSelectPlan(plan.id)}
                                                    disabled={isProcessing || currentSubscription?.status === 'ACTIVE'}
                                                    className={`w-full py-4 text-sm font-black uppercase tracking-widest rounded-2xl transition-all duration-200 shadow-sm ${isPremium
                                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg hover:-translate-y-0.5'
                                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                >
                                                    {currentSubscription?.status === 'ACTIVE' ? 'Đã kích hoạt' : `Chọn ${plan.name}`}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
