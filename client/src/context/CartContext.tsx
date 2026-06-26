import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { CartLine, MenuItem } from "../types";

interface CartContextValue {
  lines: CartLine[];
  addItem: (item: MenuItem, quantity?: number) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  function addItem(item: MenuItem, quantity = 1) {
    setLines((prev) => {
      const existing = prev.find((line) => line.menuItem.id === item.id);
      if (existing) {
        return prev.map((line) =>
          line.menuItem.id === item.id
            ? { ...line, quantity: line.quantity + quantity }
            : line
        );
      }
      return [...prev, { menuItem: item, quantity }];
    });
  }

  function removeItem(menuItemId: string) {
    setLines((prev) => prev.filter((line) => line.menuItem.id !== menuItemId));
  }

  function updateQuantity(menuItemId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    setLines((prev) =>
      prev.map((line) =>
        line.menuItem.id === menuItemId ? { ...line, quantity } : line
      )
    );
  }

  function clearCart() {
    setLines([]);
  }

  function openDrawer() {
    setIsDrawerOpen(true);
  }

  function closeDrawer() {
    setIsDrawerOpen(false);
  }

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.menuItem.price * line.quantity, 0),
    [lines]
  );

  const itemCount = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines]
  );

  return (
    <CartContext.Provider
      value={{
        lines,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        itemCount,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
