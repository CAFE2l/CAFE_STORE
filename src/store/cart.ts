'use client';

import { create } from 'zustand';
import { persist, type PersistStorage, type StorageValue } from 'zustand/middleware';
import type { CartItem } from '@/types';

type CartState = {
  items: CartItem[];
  total: number;
  count: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, quantity: number) => void;
  clearCart: () => void;
  syncWithBackend: () => Promise<void>;
  fetchFromBackend: (merge?: boolean) => Promise<void>;
};

function calculateTotals(items: CartItem[]) {
  return {
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    count: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

const cartStorageName = 'cafe-store-cart';

type PersistedCartState = Pick<CartState, 'items' | 'total' | 'count'>;

const safeCartStorage: PersistStorage<PersistedCartState> = {
  getItem: (name) => {
    try {
      const raw = localStorage.getItem(name);
      if (!raw) return null;
      return JSON.parse(raw) as StorageValue<PersistedCartState>;
    } catch {
      try {
        localStorage.removeItem(cartStorageName);
      } catch {
        // localStorage may be unavailable in private or restricted contexts.
      }
      return null;
    }
  },
  setItem: (name, value) => {
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
  },
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
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
      clearCart: () => {
        set({ items: [], total: 0, count: 0 });
        get().syncWithBackend();
      },
      syncWithBackend: async () => {
        try {
          await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: get().items }),
          });
        } catch {
          // silent fail
        }
      },
      fetchFromBackend: async (merge = true) => {
        try {
          const res = await fetch('/api/cart');
          if (!res.ok) return;
          const data = await res.json();
          const serverItems = (data.data?.items ?? []) as CartItem[];

          if (!merge || serverItems.length === 0) {
            if (serverItems.length > 0) {
              set({ items: serverItems, ...calculateTotals(serverItems) });
            }
            return;
          }

          const localItems = get().items;
          const merged = [...serverItems];

          for (const local of localItems) {
            const existing = merged.find((m) => m.id === local.id);
            if (existing) {
              existing.quantity = Math.max(existing.quantity, local.quantity);
            } else {
              merged.push(local);
            }
          }

          set({ items: merged, ...calculateTotals(merged) });
          get().syncWithBackend();
        } catch {
          // silent fail
        }
      },
    }),
    {
      name: cartStorageName,
      storage: safeCartStorage,
      partialize: (state) => ({
        items: state.items,
        total: state.total,
        count: state.count,
      }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          localStorage.removeItem(cartStorageName);
        }
      },
    },
  ),
);
