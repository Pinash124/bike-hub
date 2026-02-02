import React, { useState } from 'react';
import { Trash2, ShoppingCart, ChevronRight } from 'lucide-react';
import { useCart } from '../../../contexts/CartContext';
import type { CartItem } from '../../../contexts/CartContext';
import '../../../styles/ShoppingCart.css';

interface ShoppingCartProps {
  onCheckout?: (selectedItems: CartItem[]) => void;
}

export const ShoppingCartView: React.FC<ShoppingCartProps> = ({
  onCheckout,
}) => {
  const { items, removeItem, updateQuantity, selectItems, selectedItems } =
    useCart();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectItem = (productId: string) => {
    setSelectedIds((prev) => {
      const newIds = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      selectItems(newIds);
      return newIds;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
      selectItems([]);
    } else {
      const allIds = items.map((item) => item.productId);
      setSelectedIds(allIds);
      selectItems(allIds);
    }
  };

  const totalSelected = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="shopping-cart-view">
      <h2>
        <ShoppingCart size={24} /> Shopping Cart ({items.length} items)
      </h2>

      {items.length === 0 ? (
        <div className="empty-cart">
          <ShoppingCart size={64} />
          <p>Your cart is empty</p>
          <a href="/marketplace" className="btn-primary">
            Continue Shopping
          </a>
        </div>
      ) : (
        <div className="cart-container">
          {/* Cart Items */}
          <div className="cart-items">
            <div className="cart-header">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedIds.length === items.length && items.length > 0}
                  onChange={handleSelectAll}
                />
                <span>
                  Select All ({selectedIds.length}/{items.length})
                </span>
              </label>
            </div>

            {items.map((item) => (
              <div key={item.productId} className="cart-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.productId)}
                    onChange={() => handleSelectItem(item.productId)}
                  />
                </label>

                <div className="item-image">
                  <div className="image-placeholder">{item.image}</div>
                </div>

                <div className="item-info">
                  <h4>{item.productName}</h4>
                  <p className="seller">Seller: {item.sellerName}</p>
                  <p className="price">
                    {(item.price / 1000000).toFixed(1)}M VND
                  </p>
                </div>

                <div className="item-quantity">
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(
                        item.productId,
                        parseInt(e.target.value) || 1
                      )
                    }
                    min="1"
                  />
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>

                <div className="item-total">
                  {((item.price * item.quantity) / 1000000).toFixed(1)}M
                </div>

                <button
                  className="btn-remove"
                  onClick={() => removeItem(item.productId)}
                  title="Remove from cart"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="cart-summary">
            <h3>Order Summary</h3>

            <div className="summary-row">
              <span>Subtotal ({selectedItems.length} items)</span>
              <span className="amount">
                {(totalSelected / 1000000).toFixed(1)}M VND
              </span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span className="amount">To be calculated</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total">
              <span>Total</span>
              <span className="amount">
                {(totalSelected / 1000000).toFixed(1)}M VND
              </span>
            </div>

            <div className="summary-note">
              <p>
                Select items to proceed to checkout. Shipping will be calculated at checkout.
              </p>
            </div>

            <button
              className="btn-checkout"
              disabled={selectedIds.length === 0}
              onClick={() =>
                onCheckout ? onCheckout(selectedItems) : console.log('Checkout')
              }
            >
              Proceed to Checkout
              <ChevronRight size={20} />
            </button>

            <a href="/marketplace" className="btn-continue-shopping">
              Continue Shopping
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCartView;
