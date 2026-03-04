import React, { useState } from 'react';
import { MapPin, CreditCard, Package, AlertCircle, Check, Loader2, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { type Address } from '../../../services/address.service';
import { orderService } from '../../../services/order.service';
import { paymentService } from '../../../services/payment.service';
import { useCart } from '../../../contexts/CartContext';

interface CheckoutProps {
  addresses: Address[];
  /** One or more listing IDs to purchase (Buy Now = 1 item, Cart = N items) */
  listingIds: string[];
}

export const Checkout: React.FC<CheckoutProps> = ({ addresses, listingIds }) => {
  const navigate = useNavigate();
  const { items: cartItems, clearCart } = useCart();
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];

  const [selectedAddressId, setSelectedAddressId] = useState<number | ''>(
    defaultAddress?.id ?? ''
  );
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build a display list from cartItems (if coming from cart) or just show listing IDs
  const displayItems = listingIds.map((lid) => {
    const cartItem = cartItems.find((c) => c.productId === lid);
    return {
      id: lid,
      name: cartItem?.productName ?? `Sản phẩm #${lid.slice(0, 8).toUpperCase()}`,
      price: cartItem?.price ?? 0,
      image: cartItem?.image ?? '',
    };
  });

  const totalPrice = displayItems.reduce((sum, item) => sum + item.price, 0);

  const handlePayment = async () => {
    if (!selectedAddressId) {
      setError('Vui lòng chọn địa chỉ giao hàng.');
      return;
    }
    setError(null);
    setIsProcessing(true);

    try {
      // Create one order per listing
      // Swagger PlaceOrderRequest: { listingId, description? } — no addressId
      const selectedAddress = addresses.find(a => a.id === selectedAddressId);
      const addressNote = selectedAddress
        ? `${selectedAddress.nameContact ?? selectedAddress.fullName} — ${selectedAddress.addressLine ?? selectedAddress.detail} — ${selectedAddress.phoneContact ?? selectedAddress.phone}`
        : undefined;

      const orders = await Promise.all(
        listingIds.map((listingId) =>
          orderService.createOrder({
            listingId,
            description: notes || addressNote || undefined,
          })
        )
      );

      const failedOrders = orders.filter((o) => !o);
      if (failedOrders.length > 0) {
        throw new Error(`Không thể tạo ${failedOrders.length} đơn hàng. Vui lòng thử lại.`);
      }

      // Initiate payment: POST /payment/create/order { order_id, description }
      const firstOrder = orders.find(Boolean)!;
      const orderId = (firstOrder as any).id;
      const payment = await paymentService.createPayment({
        order_id: orderId,
        description: notes || 'BikeHub Order Payment',
      });

      // Clear cart after successful order creation
      clearCart();

      if (payment?.paymentUrl) {
        window.location.href = payment.paymentUrl;
      } else {
        navigate('/buyer/orders', { replace: true });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Thanh toán thất bại.';
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="max-w-[1100px] mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-gray-900 mb-8 uppercase tracking-tight">Thanh toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Form ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
              <MapPin size={20} className="text-green-600" /> Địa chỉ giao hàng
            </h2>

            {addresses.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-3 text-gray-500">
                <AlertCircle size={40} className="text-gray-300" />
                <p>Chưa có địa chỉ. Vui lòng thêm địa chỉ trong hồ sơ.</p>
                <button
                  onClick={() => navigate('/buyer/dashboard?tab=addresses')}
                  className="text-green-600 font-bold hover:underline"
                >
                  Thêm địa chỉ →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all
                      ${selectedAddressId === address.id ? 'border-green-600 bg-green-50' : 'border-gray-100 hover:border-green-200'}`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      checked={selectedAddressId === address.id}
                      onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                      className="mt-1 h-4 w-4 accent-green-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{address.fullName}</span>
                        {address.isDefault && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{address.phone}</p>
                      <p className="text-sm text-gray-500">
                        {address.detail}, {address.ward}, {address.district}, {address.province}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Shipping Method */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
              <Package size={20} className="text-green-600" /> Phương thức giao hàng
            </h2>
            <div className="p-4 border-2 border-green-600 rounded-xl bg-green-50">
              <div className="font-bold text-gray-900">Giao hàng tiêu chuẩn</div>
              <div className="text-sm text-gray-500 mt-0.5">3–5 ngày làm việc • Miễn phí</div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Ghi chú (tuỳ chọn)</h2>
            <textarea
              placeholder="Hướng dẫn đặc biệt cho người bán..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-green-400 outline-none resize-none text-sm"
            />
          </div>
        </div>

        {/* ── Right: Order Summary ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit sticky top-28">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingCart size={20} className="text-green-600" /> Tóm tắt đơn hàng
          </h2>

          {/* Item list */}
          <div className="space-y-3 mb-4">
            {displayItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg border border-gray-100" />
                ) : (
                  <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xl">🚲</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm line-clamp-2">{item.name}</p>
                  {item.price > 0 && (
                    <p className="text-green-600 font-bold text-sm mt-0.5">
                      {item.price.toLocaleString('vi-VN')} ₫
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 my-4" />

          <div className="flex justify-between py-1 text-sm">
            <span className="text-gray-500">Số lượng sản phẩm</span>
            <span className="font-bold">{listingIds.length} xe</span>
          </div>
          <div className="flex justify-between py-1 text-sm">
            <span className="text-gray-500">Phí vận chuyển</span>
            <span className="font-bold text-green-600">Miễn phí</span>
          </div>

          {totalPrice > 0 && (
            <>
              <div className="border-t border-gray-100 my-4" />
              <div className="flex justify-between items-end">
                <span className="text-gray-600 font-medium">Tổng cộng</span>
                <span className="text-2xl font-black text-green-600">
                  {totalPrice.toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </>
          )}

          <div className="border-t border-gray-100 my-4" />

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" /> {error}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={isProcessing || addresses.length === 0 || !selectedAddressId}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-black text-base flex items-center justify-center gap-2
              hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {isProcessing ? (
              <><Loader2 size={20} className="animate-spin" /> Đang xử lý...</>
            ) : (
              <><CreditCard size={20} /> Thanh toán ngay</>
            )}
          </button>

          <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
            <Check size={14} className="text-green-500" />
            <span>Giao dịch được bảo mật</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
