'use client';

import { Prisma } from '@prisma/client';
import { useMemo, useState } from 'react';
import { ProductPurchasePanel } from '@/components/store/ProductPurchasePanel';
import { RecentlyViewedTracker } from '@/components/store/RecentlyViewedTracker';
import { StickyBar } from '@/components/store/StickyBar';
import type { ProductDetail } from '@/lib/products';

type VariantOption = {
  name: string;
  values: string[];
};

function parseVariants(variants: Prisma.JsonValue): VariantOption[] {
  if (!Array.isArray(variants)) return [];
  return variants
    .map((v): VariantOption | null => {
      if (typeof v === 'object' && v !== null && 'name' in v && 'values' in v && typeof v.name === 'string' && Array.isArray(v.values)) {
        return { name: v.name, values: v.values.filter((x): x is string => typeof x === 'string') };
      }
      return null;
    })
    .filter((v): v is VariantOption => Boolean(v));
}

type ProductPageWrapperProps = {
  product: ProductDetail;
};

export function ProductPageWrapper({ product }: ProductPageWrapperProps) {
  const variantOptions = useMemo(() => parseVariants(product.variants), [product.variants]);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() =>
    Object.fromEntries(variantOptions.map((v) => [v.name, v.values[0] ?? ''])),
  );

  return (
    <>
      <RecentlyViewedTracker product={product} />
      <ProductPurchasePanel product={product} selectedVariants={selectedVariants} onVariantsChange={setSelectedVariants} />
      <StickyBar product={product} selectedVariants={selectedVariants} variantOptions={variantOptions} />
    </>
  );
}
