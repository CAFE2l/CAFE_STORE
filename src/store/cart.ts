'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types';

type CartState = {
  items: CartItem[];
  total: number;
  count: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, quantity: number) => void;
  clearCart: () => void;
};

function calculateTotals(items: CartItem[]) {
  return {
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    count: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      total: 0,
      count: 0,
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((cartItem) => cartItem.id === item.id);
          const items = existingItem
            ? state.items.map((cartItem) =>
                cartItem.id === item.id
                  ? {
                      ...cartItem,
                      quantity: cartItem.quantity + item.quantity,
                    }
                  : cartItem,
              )
            : [...state.items, item];

          return {
            items,
            ...calculateTotals(items),
          };
        }),
      removeItem: (id) =>
        set((state) => {
          const items = state.items.filter((item) => item.id !== id);

          return {
            items,
            ...calculateTotals(items),
          };
        }),
      updateQty: (id, quantity) =>
        set((state) => {
          const nextQuantity = Math.max(1, quantity);
          const items = state.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  quantity: nextQuantity,
                }
              : item,
          );

          return {
            items,
            ...calculateTotals(items),
          };
        }),
      clearCart: () => ({
        items: [],
        total: 0,
        count: 0,
      }),
    }),
    {
      name: 'cafe-store-cart',
      partialize: (state) => ({
        items: state.items,
        total: state.total,
        count: state.count,
      }),
    },
  ),
);
