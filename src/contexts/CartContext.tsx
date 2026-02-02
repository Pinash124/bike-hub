import React, { createContext, useContext, useState } from 'react';

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
  sellerId: string;
  sellerName: string;
}

export interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  selectItems: (productIds: string[]) => void;
  selectedItems: CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
    setSelectedProductIds((prev) =>
      prev.filter((id) => id !== productId)
    );
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setSelectedProductIds([]);
  };

  const selectItems = (productIds: string[]) => {
    setSelectedProductIds(productIds);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedItems = items.filter((item) =>
    selectedProductIds.includes(item.productId)
  );

  const value: CartContextType = {
    items,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    selectItems,
    selectedItems,
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
