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
  /** The sole client-side source of cart contents. */
  items: CartItem[];
  cartToastItem: CartToastItem | null;
  lastAddedAt: number;
  revision: number;
  isHydrated: boolean;
  addItem: (item: CartItem) => void;
  showCartToast: (item: CartToastItem) => void;
  clearCartToast: () => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, quantity: number) => void;
  clearCart: () => void;
  syncWithBackend: () => Promise<void>;
  fetchFromBackend: () => Promise<void>;
};

export const CART_STORAGE_KEY = 'cafe-store-cart-v2';
const LEGACY_CART_STORAGE_KEY = 'cafe-store-cart';

type PersistedCartState = Pick<CartState, 'items'>;

export function getCartCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function sanitizeItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  return value.flatMap((candidate) => {
    if (
      typeof candidate !== 'object' || candidate === null ||
      typeof (candidate as CartItem).id !== 'string' ||
      typeof (candidate as CartItem).productId !== 'string' ||
      typeof (candidate as CartItem).slug !== 'string' ||
      typeof (candidate as CartItem).name !== 'string' ||
      typeof (candidate as CartItem).image !== 'string' ||
      !Number.isFinite((candidate as CartItem).price) ||
      !Number.isFinite((candidate as CartItem).quantity)
    ) return [];

    const item = candidate as CartItem;
    if (item.price < 0 || item.quantity < 1 || seen.has(item.id)) return [];
    seen.add(item.id);

    return [{ ...item, quantity: Math.floor(item.quantity) }];
  });
}

const cartStorage: PersistStorage<PersistedCartState> = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null;
    try {
      // Deliberately do not migrate the legacy cache: it was the source of
      // ghost entries. A v2 cart starts only with data added to this store.
      window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
      const raw = window.localStorage.getItem(name);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as StorageValue<PersistedCartState>;
      return { ...parsed, state: { items: sanitizeItems(parsed.state?.items) } };
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(name, JSON.stringify(value));
    } catch {
      // The in-memory cart remains usable if browser storage is unavailable.
    }
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(name);
    } catch {
      // ignore unavailable browser storage
    }
  },
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartToastItem: null,
      lastAddedAt: 0,
      revision: 0,
      isHydrated: false,
      addItem: (item) => {
        set((state) => {
          const items = state.items.some((current) => current.id === item.id)
            ? state.items.map((current) => current.id === item.id
              ? { ...current, quantity: current.quantity + item.quantity }
              : current)
            : [...state.items, item];

          return {
            items,
            revision: state.revision + 1,
            lastAddedAt: Date.now(),
            cartToastItem: { name: item.name, imageUrl: item.image, price: item.price },
          };
        });
        void get().syncWithBackend();
      },
      showCartToast: (item) => set({ cartToastItem: item, lastAddedAt: Date.now() }),
      clearCartToast: () => set({ cartToastItem: null }),
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          revision: state.revision + 1,
        }));
        void get().syncWithBackend();
      },
      updateQty: (id, quantity) => {
        set((state) => ({
          items: state.items.map((item) => item.id === id
            ? { ...item, quantity: Math.max(1, Math.floor(quantity)) }
            : item),
          revision: state.revision + 1,
        }));
        void get().syncWithBackend();
      },
      clearCart: () => {
        set((state) => ({ items: [], revision: state.revision + 1 }));
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

          const body = await response.json();
          const canonicalItems = sanitizeItems(body.data?.items);
          set({ items: canonicalItems });
        } catch {
          // Guests intentionally retain their local v2 cart until they sign in.
        }
      },
      fetchFromBackend: async () => {
        const revision = get().revision;
        try {
          const response = await fetch('/api/cart');
          if (!response.ok) return;
          const body = await response.json();
          const serverItems = sanitizeItems(body.data?.items);

          // Never let an in-flight GET resurrect an item removed locally.
          if (get().revision !== revision) {
            void get().syncWithBackend();
            return;
          }
          set({ items: serverItems });
        } catch {
          // Keep the persisted local cart when offline.
        }
      },
    }),
    {
      name: CART_STORAGE_KEY,
      storage: cartStorage,
      // Hydrating synchronously makes the first browser render differ from
      // the server render whenever localStorage has cart items. Providers
      // explicitly rehydrates after mount instead.
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => () => {
        useCartStore.setState({ isHydrated: true });
      },
    },
  ),
);
