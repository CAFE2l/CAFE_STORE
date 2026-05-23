'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'cafe-store-recently-viewed';
const MAX_ITEMS = 8;

type RecentlyViewedItem = {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
};

function read(): RecentlyViewedItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as RecentlyViewedItem[];
  } catch {
    return [];
  }
}

function write(items: RecentlyViewedItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // silent
  }
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    setItems(read());
  }, []);

  const addItem = useCallback((item: RecentlyViewedItem) => {
    setItems((prev) => {
      const filtered = prev.filter((i) => i.id !== item.id);
      const updated = [item, ...filtered].slice(0, MAX_ITEMS);
      write(updated);
      return updated;
    });
  }, []);

  return { items, addItem };
}
