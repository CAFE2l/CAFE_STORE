'use client';

import { create } from 'zustand';
import { persist, type PersistStorage, type StorageValue } from 'zustand/middleware';
import type { CartItem } from '@/types';

type CartToastItem = {
  name: string;
  imageUrl: string;
  price: number;
};

type CartState = {
  items: CartItem[];
  total: number;
  count: number;
  cartToastItem: CartToastItem | null;
  lastAddedAt: number;
  revision: number;
  addItem: (item: CartItem) => void;
  showCartToast: (item: CartToastItem) => void;
  clearCartToast: () => void;
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
    if (typeof window === 'undefined') return null;

    try {
      const raw = window.localStorage.getItem(name);
      if (!raw) return null;
      return JSON.parse(raw) as StorageValue<PersistedCartState>;
    } catch {
      try {
        window.localStorage.removeItem(cartStorageName);
      } catch {
        // localStorage may be unavailable in private or restricted contexts.
      }
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(name);
  },
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      count: 0,
      cartToastItem: null,
      lastAddedAt: 0,
      revision: 0,
      addItem: (item) => {
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
            cartToastItem: {
              name: item.name,
              imageUrl: item.image,
              price: item.price,
            },
            lastAddedAt: Date.now(),
            revision: state.revision + 1,
            ...calculateTotals(items),
          };
        });
        void get().syncWithBackend();
      },
      showCartToast: (item) => set({ cartToastItem: item, lastAddedAt: Date.now() }),
      clearCartToast: () => set({ cartToastItem: null }),
      removeItem: (id) => {
        set((state) => {
          const items = state.items.filter((item) => item.id !== id);
          return { items, revision: state.revision + 1, ...calculateTotals(items) };
        });
        void get().syncWithBackend();
      },
      updateQty: (id, quantity) => {
        set((state) => {
          const nextQuantity = Math.max(1, quantity);
          const items = state.items.map((item) =>
            item.id === id ? { ...item, quantity: nextQuantity } : item,
          );
          return { items, revision: state.revision + 1, ...calculateTotals(items) };
        });
        void get().syncWithBackend();
      },
      clearCart: () => {
        set((state) => ({ items: [], total: 0, count: 0, revision: state.revision + 1 }));
        void get().syncWithBackend();
      },
      syncWithBackend: async () => {
        const revision = get().revision;
        const items = get().items;
        try {
          const response = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items }),
          });
          if (!response.ok || get().revision !== revision) return;
          const data = await response.json();
          const canonicalItems = (data.data?.items ?? []) as CartItem[];
          set({ items: canonicalItems, ...calculateTotals(canonicalItems) });
        } catch {
          // silent fail
        }
      },
      fetchFromBackend: async (merge = true) => {
        const revision = get().revision;
        try {
          const res = await fetch('/api/cart');
          if (!res.ok) return;
          const data = await res.json();
          const serverItems = (data.data?.items ?? []) as CartItem[];

          // A user action while this request was in flight wins over its stale
          // response. This is what prevents a removed item from coming back.
          if (get().revision !== revision) {
            void get().syncWithBackend();
            return;
          }

          if (!merge) {
            set({ items: serverItems, ...calculateTotals(serverItems) });
            return;
          }

          if (serverItems.length === 0) {
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
        if (error && typeof window !== 'undefined') {
          window.localStorage.removeItem(cartStorageName);
        }
      },
    },
  ),
);
