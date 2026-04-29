import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, HatConfig, HAT_PRICE } from '@/types/hat';

interface CartContextType {
  items: CartItem[];
  addItem: (hat: HatConfig) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function getHatPrice(_hat: HatConfig): number {
  return HAT_PRICE;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (hat: HatConfig) => {
    const id = crypto.randomUUID();
    setItems((prev) => [...prev, { hat: { ...hat, id }, quantity: 1 }]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.hat.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return removeItem(id);
    setItems((prev) => prev.map((i) => (i.hat.id === id ? { ...i, quantity } : i)));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.quantity * getHatPrice(i.hat), 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
}

export { HAT_PRICE };
