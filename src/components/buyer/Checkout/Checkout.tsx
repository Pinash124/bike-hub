import React, { useState } from 'react';
import { MapPin, CreditCard, Package, AlertCircle, Check } from 'lucide-react';
import { useCart } from '../../../contexts/CartContext';


export interface Address {
  id: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detailedAddress: string;
  isDefault: boolean;
}

interface CheckoutProps {
  addresses: Address[];
  onPayment?: (data: CheckoutData) => void;
}

export interface CheckoutData {
  selectedAddressId: string;
  items: any[];
  totalAmount: number;
  shippingCost: number;
}

export const Checkout: React.FC<CheckoutProps> = ({ addresses, onPayment }) => {
  const { selectedItems, totalPrice } = useCart();
  const [selectedAddressId, setSelectedAddressId] = useState(
    addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || ''
  );
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const shippingCost = shippingMethod === 'standard' ? 30000 : 100000;

  const handleVNPAYPayment = async () => {
    if (!selectedAddressId) {
      alert('Please select a delivery address');
      return;
    }

    if (selectedItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate VNPAY API call
      const checkoutData: CheckoutData = {
        selectedAddressId,
        items: selectedItems,
        totalAmount: totalPrice + shippingCost,
        shippingCost,
      };

      console.log('Processing payment:', checkoutData);

      // In real app, integrate with VNPAY API
      // Redirect to VNPAY payment gateway
      setTimeout(() => {
        onPayment?.(checkoutData);
        alert('Redirecting to VNPAY payment...');
        // window.location.href = 'https://sandbox.vnpayment.vn/...';
        setIsProcessing(false);
      }, 1000);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-6">
      <h1 className="text-2xl font-semibold">Order Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Column - Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Delivery Address */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><MapPin size={20} /> Delivery Address</h2>

            {addresses.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-6">
                <AlertCircle size={48} />
                <p className="text-gray-600">No addresses saved. Please add an address first.</p>
                <button className="mt-2 bg-green-600 text-white px-4 py-2 rounded">Add Address</button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {addresses.map((address) => (
                  <label key={address.id} className="flex items-start gap-3 p-3 border rounded">
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      checked={selectedAddressId === address.id}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      className="mt-1 h-4 w-4"
                    />
                    <div>
                      <h4 className="font-semibold">{address.fullName}</h4>
                      <p className="text-sm text-gray-500">{address.phone}</p>
                      <p className="text-sm text-gray-500">{address.detailedAddress}, {address.ward}, {address.district}, {address.province}</p>
                      {address.isDefault && <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Default</span>}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Shipping Method */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><Package size={20} /> Shipping Method</h2>
            <div className="mt-4 space-y-3">
              <label className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <input type="radio" name="shipping" value="standard" checked={shippingMethod === 'standard'} onChange={(e) => setShippingMethod(e.target.value as 'standard' | 'express')} className="h-4 w-4" />
                  <div>
                    <div className="font-semibold">Standard Delivery</div>
                    <div className="text-sm text-gray-500">3-5 business days</div>
                  </div>
                </div>
                <div className="text-sm">30,000 VND</div>
              </label>

              <label className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <input type="radio" name="shipping" value="express" checked={shippingMethod === 'express'} onChange={(e) => setShippingMethod(e.target.value as 'standard' | 'express')} className="h-4 w-4" />
                  <div>
                    <div className="font-semibold">Express Delivery</div>
                    <div className="text-sm text-gray-500">1-2 business days</div>
                  </div>
                </div>
                <div className="text-sm">100,000 VND</div>
              </label>
            </div>
          </div>

          {/* Step 3: Order Notes */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold">Order Notes (Optional)</h2>
            <textarea placeholder="Add any special instructions for the seller..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full mt-2 p-2 border rounded" />
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-3">Order Summary</h2>

          {/* Items */}
          <div className="space-y-2">
            {selectedItems.length === 0 ? (
              <p className="text-gray-500">No items selected</p>
            ) : (
              selectedItems.map((item) => (
                <div key={item.productId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded">{item.image}</div>
                    <div>
                      <div className="text-sm">{item.productName}</div>
                      <div className="text-xs text-gray-500">x{item.quantity}</div>
                    </div>
                  </div>
                  <span className="font-semibold">{((item.price * item.quantity) / 1000000).toFixed(1)}M</span>
                </div>
              ))
            )}
          </div>

          <div className="border-t my-3" />

          {/* Subtotal */}
          <div className="flex justify-between py-2">
            <span>Subtotal ({selectedItems.length} items)</span>
            <span>{(totalPrice / 1000000).toFixed(1)}M VND</span>
          </div>

          {/* Shipping Cost */}
          <div className="flex justify-between py-2">
            <span>Shipping ({shippingMethod})</span>
            <span>{(shippingCost / 1000).toFixed(0)}K VND</span>
          </div>

          <div className="border-t my-3" />

          {/* Total */}
          <div className="flex justify-between py-2 font-semibold text-lg">
            <span>Total Payment</span>
            <span>{((totalPrice + shippingCost) / 1000000).toFixed(1)}M VND</span>
          </div>

          {/* VNPAY Button */}
          <button className="w-full mt-4 bg-green-600 text-white py-2 rounded flex items-center justify-center gap-2" onClick={handleVNPAYPayment} disabled={isProcessing || selectedItems.length === 0}>
            {isProcessing ? <>Processing...</> : <><CreditCard size={20} /> Pay with VNPAY</>}
          </button>

          {/* Security Badge */}
          <div className="flex items-center gap-2 mt-4 text-sm text-gray-600"><Check size={16} /> <span>Secure payment with VNPAY</span></div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
