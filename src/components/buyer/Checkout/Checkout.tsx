import React, { useState } from 'react';
import { MapPin, CreditCard, Package, AlertCircle, Check } from 'lucide-react';
import { useCart } from '../../../contexts/CartContext';
import '../../../styles/Checkout.css';

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
    <div className="checkout-container">
      <h1>Order Checkout</h1>

      <div className="checkout-content">
        {/* Left Column - Checkout Form */}
        <div className="checkout-form">
          {/* Step 1: Delivery Address */}
          <div className="checkout-section">
            <h2 className="section-title">
              <MapPin size={24} /> Delivery Address
            </h2>

            {addresses.length === 0 ? (
              <div className="empty-addresses">
                <AlertCircle size={48} />
                <p>No addresses saved. Please add an address first.</p>
                <button className="btn-primary">Add Address</button>
              </div>
            ) : (
              <div className="addresses-radio">
                {addresses.map((address) => (
                  <label key={address.id} className="address-option">
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      checked={selectedAddressId === address.id}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                    />
                    <div className="address-content">
                      <h4>{address.fullName}</h4>
                      <p className="phone">{address.phone}</p>
                      <p className="location">
                        {address.detailedAddress}, {address.ward}, {address.district},
                        {address.province}
                      </p>
                      {address.isDefault && <span className="default-badge">Default</span>}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Shipping Method */}
          <div className="checkout-section">
            <h2 className="section-title">
              <Package size={24} /> Shipping Method
            </h2>
            <div className="shipping-options">
              <label className="shipping-option">
                <input
                  type="radio"
                  name="shipping"
                  value="standard"
                  checked={shippingMethod === 'standard'}
                  onChange={(e) => setShippingMethod(e.target.value as 'standard' | 'express')}
                />
                <div className="shipping-info">
                  <span className="shipping-name">Standard Delivery</span>
                  <span className="shipping-time">3-5 business days</span>
                </div>
                <span className="shipping-price">30,000 VND</span>
              </label>

              <label className="shipping-option">
                <input
                  type="radio"
                  name="shipping"
                  value="express"
                  checked={shippingMethod === 'express'}
                  onChange={(e) => setShippingMethod(e.target.value as 'standard' | 'express')}
                />
                <div className="shipping-info">
                  <span className="shipping-name">Express Delivery</span>
                  <span className="shipping-time">1-2 business days</span>
                </div>
                <span className="shipping-price">100,000 VND</span>
              </label>
            </div>
          </div>

          {/* Step 3: Order Notes */}
          <div className="checkout-section">
            <h2 className="section-title">Order Notes (Optional)</h2>
            <textarea
              placeholder="Add any special instructions for the seller..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="notes-textarea"
            ></textarea>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="order-summary">
          <h2>Order Summary</h2>

          {/* Items */}
          <div className="summary-items">
            {selectedItems.length === 0 ? (
              <p className="no-items">No items selected</p>
            ) : (
              selectedItems.map((item) => (
                <div key={item.productId} className="summary-item">
                  <div className="item-details">
                    <span className="item-name">{item.productName}</span>
                    <span className="item-qty">x{item.quantity}</span>
                  </div>
                  <span className="item-price">
                    {((item.price * item.quantity) / 1000000).toFixed(1)}M
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="summary-divider"></div>

          {/* Subtotal */}
          <div className="summary-row">
            <span>Subtotal ({selectedItems.length} items)</span>
            <span>{(totalPrice / 1000000).toFixed(1)}M VND</span>
          </div>

          {/* Shipping Cost */}
          <div className="summary-row">
            <span>Shipping ({shippingMethod})</span>
            <span>{(shippingCost / 1000).toFixed(0)}K VND</span>
          </div>

          <div className="summary-divider"></div>

          {/* Total */}
          <div className="summary-row total">
            <span>Total Payment</span>
            <span>{((totalPrice + shippingCost) / 1000000).toFixed(1)}M VND</span>
          </div>

          {/* VNPAY Button */}
          <button
            className="btn-vnpay"
            onClick={handleVNPAYPayment}
            disabled={isProcessing || selectedItems.length === 0}
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                <CreditCard size={20} />
                Pay with VNPAY
              </>
            )}
          </button>

          {/* Security Badge */}
          <div className="security-badge">
            <Check size={16} />
            <span>Secure payment with VNPAY</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
