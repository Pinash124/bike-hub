import React, { useState } from 'react';
import { Trash2, ShoppingCart, ChevronRight } from 'lucide-react';
import { useCart } from '../../../contexts/CartContext';
import type { CartItem } from '../../../contexts/CartContext';


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
    <div className="max-w-[1200px] mx-auto p-6">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <ShoppingCart size={24} /> Shopping Cart ({items.length} items)
      </h2>

      {items.length === 0 ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center gap-4">
          <ShoppingCart size={64} />
          <p className="text-gray-600">Your cart is empty</p>
          <a href="/marketplace" className="bg-green-600 text-white px-4 py-2 rounded">Continue Shopping</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 bg-white p-4 rounded shadow">
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedIds.length === items.length && items.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4"
                />
                <span className="text-sm text-gray-700">Select All ({selectedIds.length}/{items.length})</span>
              </label>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-4 p-3 border rounded">
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.productId)}
                      onChange={() => handleSelectItem(item.productId)}
                      className="h-4 w-4"
                    />
                  </label>

                  <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded">{item.image}</div>

                  <div className="flex-1">
                    <h4 className="font-semibold">{item.productName}</h4>
                    <p className="text-sm text-gray-500">Seller: {item.sellerName}</p>
                    <p className="text-sm text-red-600">{(item.price / 1000000).toFixed(1)}M VND</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="px-2 py-1 border rounded" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>−</button>
                    <input className="w-12 text-center border rounded py-1" type="number" value={item.quantity} onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)} min="1" />
                    <button className="px-2 py-1 border rounded" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                  </div>

                  <div className="w-20 text-right font-semibold">{((item.price * item.quantity) / 1000000).toFixed(1)}M</div>

                  <button className="text-red-500 p-2" onClick={() => removeItem(item.productId)} title="Remove from cart"><Trash2 size={20} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-3">Order Summary</h3>

            <div className="flex justify-between py-2">
              <span>Subtotal ({selectedItems.length} items)</span>
              <span className="font-semibold">{(totalSelected / 1000000).toFixed(1)}M VND</span>
            </div>

            <div className="flex justify-between py-2">
              <span>Shipping</span>
              <span className="text-gray-500">To be calculated</span>
            </div>

            <div className="border-t my-2" />

            <div className="flex justify-between py-2 font-semibold text-lg">
              <span>Total</span>
              <span>{(totalSelected / 1000000).toFixed(1)}M VND</span>
            </div>

            <p className="text-sm text-gray-500 mt-2">Select items to proceed to checkout. Shipping will be calculated at checkout.</p>

            <button className="w-full mt-4 bg-green-600 text-white py-2 rounded flex items-center justify-center gap-2" disabled={selectedIds.length === 0} onClick={() => onCheckout ? onCheckout(selectedItems) : console.log('Checkout')}>Proceed to Checkout <ChevronRight size={20} /></button>

            <a href="/marketplace" className="block text-center mt-3 text-sm text-gray-600">Continue Shopping</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCartView;
