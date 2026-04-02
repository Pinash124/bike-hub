import React, { useState } from 'react';
import { Trash2, ShoppingCart, ChevronRight, Minus, Plus, Bike, ShieldCheck, Check } from 'lucide-react';
import { useCart } from '../../../contexts/CartContext';
import type { CartItem } from '../../../contexts/CartContext';
import { formatVND } from '../../../utils/format';


interface ShoppingCartProps {
  onCheckout?: (selectedItems: CartItem[]) => void;
}

export const ShoppingCartView: React.FC<ShoppingCartProps> = ({
  onCheckout,
}) => {
  const { items, removeItem, updateQuantity, selectItems, selectedItems } = useCart();
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
    <div className="max-w-[1100px] mx-auto py-10">
      <h1 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tight flex items-center gap-3">
        Giỏ hàng của bạn <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">{items.length} xe</span>
      </h1>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <ShoppingCart size={48} className="text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Giỏ hàng trống</h2>
          <p className="text-slate-500 mb-8 max-w-sm">Chưa có chiếc xe nào trong giỏ hàng. Hãy lướt một vòng và tìm chiếc xe mơ ước của bạn nào!</p>
          <a
            href="/"
            className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl shadow-slate-900/20 active:scale-95"
          >
            Tiếp tục mua sắm
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Cart Items Area */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                    ${selectedIds.length === items.length && items.length > 0 ? 'bg-green-600 border-green-600' : 'border-slate-300 group-hover:border-green-500'}`}
                  >
                    {selectedIds.length === items.length && items.length > 0 && <Check size={14} className="text-white" strokeWidth={3} />}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={selectedIds.length === items.length && items.length > 0}
                    onChange={handleSelectAll}
                  />
                  <span className="font-bold text-slate-700 text-sm uppercase tracking-wider">Chọn tất cả ({items.length})</span>
                </label>
              </div>

              <div className="divide-y divide-slate-100">
                {items.map((item) => {
                  const isSelected = selectedIds.includes(item.productId);
                  return (
                    <div key={item.productId} className={`p-6 transition-colors ${isSelected ? 'bg-green-50/30' : 'hover:bg-slate-50/50'}`}>
                      <div className="flex gap-4 sm:gap-6">
                        <label className="flex items-start pt-2 cursor-pointer group">
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shadow-sm
                            ${isSelected ? 'bg-green-600 border-green-600' : 'border-slate-300 bg-white group-hover:border-green-500'}`}
                          >
                            {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                          </div>
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={isSelected}
                            onChange={() => handleSelectItem(item.productId)}
                          />
                        </label>

                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-100 rounded-2xl overflow-hidden shrink-0 relative border border-slate-100">
                          {item.image ? (
                            <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl text-slate-300">
                              <Bike size={40} />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-4">
                              <h3 className="text-base sm:text-lg font-bold text-slate-800 line-clamp-2 leading-tight">
                                <a href={`/marketplace/product/${item.productId}`} className="hover:text-green-600 transition-colors">
                                  {item.productName}
                                </a>
                              </h3>
                              <button
                                onClick={() => removeItem(item.productId)}
                                className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
                                title="Xóa khỏi giỏ hàng"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                            <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Người bán: {item.sellerName || 'BikeHub'}</p>
                          </div>

                          <div className="flex flex-wrap items-end justify-between gap-4 mt-4">
                            <p className="text-green-600 font-extrabold text-xl sm:text-2xl">
                              {formatVND(item.price)}
                            </p>

                            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden p-1">
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 rounded-lg transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                                className="w-10 text-center bg-transparent border-none focus:ring-0 font-bold text-sm"
                                min="1"
                              />
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 rounded-lg transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sticky Order Summary Area */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sticky top-28">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-6 pb-4 border-b border-slate-100">
                Thanh toán
              </h2>

              <div className="space-y-4 text-sm font-medium text-slate-500">
                <div className="flex justify-between items-center">
                  <span>Tạm tính ({selectedItems.length} sản phẩm)</span>
                  <span className="font-bold text-slate-800">{formatVND(totalSelected)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Phí giao hàng</span>
                  <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full text-xs uppercase tracking-wide">Miễn phí</span>
                </div>
              </div>

              <div className="my-6 border-t border-slate-100 border-dashed" />

              <div className="flex flex-col gap-1 mb-6">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tổng cộng</span>
                <span className="text-3xl font-black text-green-600">{totalSelected > 0 ? formatVND(totalSelected) : '0 VND'}</span>
              </div>

              <button
                disabled={selectedIds.length === 0}
                onClick={() => onCheckout ? onCheckout(selectedItems) : null}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-green-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex justify-center items-center gap-2"
              >
                Tiến hành đặt hàng <ChevronRight size={18} />
              </button>

              <div className="mt-6 p-4 bg-slate-50 rounded-2xl flex gap-3 text-xs text-slate-500 font-medium border border-slate-100">
                <ShieldCheck size={20} className="text-green-600 shrink-0" />
                <p>Thanh toán an toàn với tính năng giữ tiền của BikeHub. Bạn chỉ trả tiền sau khi nhận và hài lòng với xe.</p>
              </div>

              <a href="/" className="mt-4 flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-800 transition-colors">
                Trở lại Mua sắm
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCartView;
