'use client';

import { useEffect } from 'react';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import type { ProductDetail } from '@/lib/products';

type RecentlyViewedTrackerProps = {
  product: ProductDetail;
};

export function RecentlyViewedTracker({ product }: RecentlyViewedTrackerProps) {
  const { addItem } = useRecentlyViewed();

  useEffect(() => {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? '/placeholder-product.svg',
      price: product.price,
    });
  }, [product.id, product.slug, product.name, product.images, product.price, addItem]);

  return null;
}
