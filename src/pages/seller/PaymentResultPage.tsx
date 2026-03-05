// src/pages/seller/PaymentResultPage.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Home, FileText } from 'lucide-react';

export default function PaymentResultPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // PayOS usually returns these in the URL redirect:
    // ?code=00&id=123&cancel=false&status=PAID&orderCode=123
    const paymentStatus = searchParams.get('status');
    const isCancel = searchParams.get('cancel') === 'true';
    const hasCode = searchParams.get('code');
    const orderCode = searchParams.get('orderCode');

    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (paymentStatus === 'PAID' && !isCancel) {
            setIsSuccess(true);
        } else if (hasCode === '00' && !isCancel) {
            setIsSuccess(true);
        } else {
            setIsSuccess(false);
        }
    }, [paymentStatus, isCancel, hasCode]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
            <div className={`w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border-t-8 ${isSuccess ? 'border-green-500 shadow-green-500/10' : 'border-red-500 shadow-red-500/10'}`}>
                <div className="p-10 text-center">
                    <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6 animate-in zoom-in duration-500 ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {isSuccess ? <CheckCircle2 size={48} strokeWidth={2.5} /> : <XCircle size={48} strokeWidth={2.5} />}
                    </div>

                    <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                        {isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
                    </h1>

                    <p className="text-slate-500 font-medium text-lg mb-4">
                        {isSuccess
                            ? 'Cảm ơn bạn! Bài đăng của bạn sẽ sớm được đưa lên trạng thái Đang Bán (LIVE).'
                            : 'Giao dịch đã bị hủy hoặc xảy ra lỗi. Hệ thống chưa ghi nhận gói cước của bài đăng.'
                        }
                    </p>

                    {orderCode && (
                        <div className="mb-8 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mã đơn hàng</p>
                            <p className="text-sm font-bold text-slate-700">{orderCode}</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => navigate('/seller/dashboard')}
                            className="w-full py-4 text-sm font-black text-white uppercase tracking-widest rounded-2xl bg-slate-900 hover:bg-slate-800 transition flex items-center justify-center gap-2"
                        >
                            <FileText size={18} /> Quản lý xe của tôi
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-4 text-sm font-black text-slate-600 uppercase tracking-widest rounded-2xl bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center gap-2"
                        >
                            <Home size={18} /> Về trang chủ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
