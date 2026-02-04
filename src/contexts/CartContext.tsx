import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

// --- Interfaces ---
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
  selectedItems: CartItem[];
  selectedTotalPrice: number;
  selectedCount: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleSelectItem: (productId: string) => void;
  selectItems: (productIds: string[]) => void;
}

// --- Context ---
const CartContext = createContext<CartContextType | undefined>(undefined);

// --- Provider ---
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // 1. State Management
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("cart_items");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to parse cart items:", error);
      return [];
    }
  });

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // 2. Persistence Layer
  useEffect(() => {
    localStorage.setItem("cart_items", JSON.stringify(items));
  }, [items]);

  // 3. Actions (Memoized with useCallback)
  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === item.productId,
      );
      if (existingIndex > -1) {
        const newItems = [...prev];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + (item.quantity || 1),
        };
        return newItems;
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
    setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.productId !== productId);
      return prev.map((i) =>
        i.productId === productId ? { ...i, quantity } : i,
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setSelectedProductIds([]);
  }, []);

  const toggleSelectItem = useCallback((productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }, []);

  const selectItems = useCallback((productIds: string[]) => {
    setSelectedProductIds(productIds);
  }, []);

  // 4. Derived State (Calculated with useMemo)
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const selectedItems = useMemo(
    () => items.filter((item) => selectedProductIds.includes(item.productId)),
    [items, selectedProductIds],
  );

  const selectedTotalPrice = useMemo(
    () =>
      selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [selectedItems],
  );

  const selectedCount = selectedItems.length;

  // 5. Context Value (Memoized to prevent unnecessary re-renders of consumers)
  const contextValue: CartContextType = useMemo(
    () => ({
      items,
      totalItems,
      totalPrice,
      selectedItems,
      selectedTotalPrice,
      selectedCount,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      toggleSelectItem,
      selectItems,
    }),
    [
      items,
      totalItems,
      totalPrice,
      selectedItems,
      selectedTotalPrice,
      selectedCount,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      toggleSelectItem,
      selectItems,
    ],
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

// --- Hook ---
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
